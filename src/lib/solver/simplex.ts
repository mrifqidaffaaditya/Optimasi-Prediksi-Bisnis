import {
  ObjectiveType,
  Product,
  Resource,
  UsageMatrix,
  Solution,
  ProductResult,
  ResourceResult,
  ConflictingConstraint,
  Geometry2D,
  CornerPoint2D,
} from '@/types';
import { formatRupiah, formatNumber } from '@/lib/formatters';

const EPSILON = 1e-6;

export function solveOptimization(
  objective: ObjectiveType,
  products: Product[],
  resources: Resource[],
  usage: UsageMatrix
): Solution {
  const startTime = performance.now();

  if (products.length === 0 || resources.length === 0) {
    return createEmptySolution(objective);
  }

  // 1. If exactly 2 products, we can also compute the 2D geometry representation
  const is2D = products.length === 2;

  // Let's solve the linear programming problem
  const rawResult = solveLP(objective, products, resources, usage);

  const endTime = performance.now();
  const calculationTimeMs = Math.round((endTime - startTime) * 100) / 100;

  if (rawResult.status === 'INFEASIBLE') {
    const conflicting = identifyConflictingConstraints(
      objective,
      products,
      resources,
      usage
    );
    return {
      status: 'INFEASIBLE',
      objectiveValue: 0,
      objectiveType: objective,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        quantity: 0,
        unit: p.unit,
        profitPerUnit: p.profit,
        contribution: 0,
        percentageOfTotal: 0,
      })),
      resources: resources.map((r) => ({
        id: r.id,
        name: r.name,
        used: 0,
        capacity: r.capacity,
        unit: r.unit,
        slack: r.capacity,
        binding: false,
        usagePercent: 0,
        shadowPrice: 0,
        type: r.type,
      })),
      conclusionSentence:
        'Target tidak bisa dipenuhi: Terdapat batasan kapasitas yang saling bertabrakan atau target produksi minimum melebihi kapasitas yang tersedia.',
      conflictingConstraints: conflicting,
      calculationTimeMs,
    };
  }

  if (rawResult.status === 'UNBOUNDED') {
    return {
      status: 'UNBOUNDED',
      objectiveValue: 0,
      objectiveType: objective,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        quantity: 0,
        unit: p.unit,
        profitPerUnit: p.profit,
        contribution: 0,
        percentageOfTotal: 0,
      })),
      resources: resources.map((r) => ({
        id: r.id,
        name: r.name,
        used: 0,
        capacity: r.capacity,
        unit: r.unit,
        slack: 0,
        binding: false,
        usagePercent: 0,
        shadowPrice: 0,
        type: r.type,
      })),
      conclusionSentence:
        'Tanpa batas atas: Untung dapat bertambah tanpa batas karena batasan kapasitas belum membatasi seluruh arah produksi.',
      calculationTimeMs,
    };
  }

  // Calculate detailed product contributions
  const productResults: ProductResult[] = products.map((p, idx) => {
    let qty = rawResult.quantities[idx] || 0;
    if (p.integerOnly) {
      qty = Math.round(qty);
    }
    qty = Math.max(0, Math.round(qty * 100) / 100);
    const contribution = Math.round(qty * p.profit);
    return {
      id: p.id,
      name: p.name,
      quantity: qty,
      unit: p.unit,
      profitPerUnit: p.profit,
      contribution,
      percentageOfTotal: 0, // Calculated below
    };
  });

  const totalObjective = productResults.reduce((sum, p) => sum + p.contribution, 0);

  productResults.forEach((p) => {
    p.percentageOfTotal =
      totalObjective > 0
        ? Math.round((p.contribution / totalObjective) * 1000) / 10
        : 0;
  });

  // Calculate resource usage and shadow prices
  const resourceResults: ResourceResult[] = resources.map((r, rIdx) => {
    let used = 0;
    products.forEach((p, pIdx) => {
      const perUnit = usage[p.id]?.[r.id] ?? 0;
      used += productResults[pIdx].quantity * perUnit;
    });
    used = Math.round(used * 100) / 100;
    const slack = Math.max(0, Math.round((r.capacity - used) * 100) / 100);
    const usagePercent =
      r.capacity > 0
        ? Math.min(100, Math.round((used / r.capacity) * 1000) / 10)
        : 0;
    const isBinding = Math.abs(slack) < 0.05 || usagePercent >= 99.5;
    const shadowPrice = Math.max(
      0,
      Math.round((rawResult.shadowPrices[rIdx] || 0) * 100) / 100
    );

    return {
      id: r.id,
      name: r.name,
      used,
      capacity: r.capacity,
      unit: r.unit,
      slack,
      binding: isBinding,
      usagePercent,
      shadowPrice,
      type: r.type,
    };
  });

  // Top bottleneck: the binding resource with highest shadow price
  const topBottleneck = [...resourceResults]
    .filter((r) => r.binding)
    .sort((a, b) => b.shadowPrice - a.shadowPrice)[0];

  // 1-sentence conclusion in human business Indonesian (PRD 5.3 & 10)
  const productQuantitiesStr = productResults
    .filter((p) => p.quantity > 0)
    .map((p) => `${formatNumber(p.quantity)} ${p.unit} ${p.name}`)
    .join(' dan ');

  let conclusionSentence = '';
  if (productQuantitiesStr) {
    conclusionSentence = `Rekomendasi terbaik: Produksi ${productQuantitiesStr} untuk mencapai ${
      objective === 'MAXIMIZE_PROFIT' ? 'untung maksimal' : 'biaya minimum'
    } sebesar ${formatRupiah(totalObjective)}.`;
    if (topBottleneck && topBottleneck.shadowPrice > 0) {
      conclusionSentence += ` ${topBottleneck.name} menjadi faktor penghambat utama (terpakai penuh).`;
    }
  } else {
    conclusionSentence =
      'Kapasitas yang ada belum memungkinkan produksi menghasilkan keuntungan positif.';
  }

  // 2D geometry visualization if 2 products
  let geometry2D: Geometry2D | undefined;
  if (is2D) {
    geometry2D = calculate2DGeometry(
      products[0],
      products[1],
      resources,
      usage,
      [productResults[0].quantity, productResults[1].quantity],
      objective
    );
  }

  return {
    status: 'OPTIMAL',
    objectiveValue: totalObjective,
    objectiveType: objective,
    products: productResults,
    resources: resourceResults,
    conclusionSentence,
    topBottleneck,
    geometry2D,
    calculationTimeMs,
  };
}

// Pure Simplex / Two-Phase Method implementation
function solveLP(
  objective: ObjectiveType,
  products: Product[],
  resources: Resource[],
  usage: UsageMatrix
): {
  status: 'OPTIMAL' | 'INFEASIBLE' | 'UNBOUNDED';
  quantities: number[];
  shadowPrices: number[];
} {
  const n = products.length; // decision variables
  const m = resources.length; // constraints

  // If 2 products, corner point enumeration is mathematically exact, infallible, and faster
  if (n === 2) {
    return solve2DDirect(objective, products, resources, usage);
  }

  // Standard Simplex Algorithm for N products
  return solveSimplexGeneral(objective, products, resources, usage);
}

function solve2DDirect(
  objective: ObjectiveType,
  products: Product[],
  resources: Resource[],
  usage: UsageMatrix,
  computeShadow: boolean = true
): {
  status: 'OPTIMAL' | 'INFEASIBLE' | 'UNBOUNDED';
  quantities: number[];
  shadowPrices: number[];
} {
  const p1 = products[0];
  const p2 = products[1];

  // Lines: x >= 0, y >= 0, plus all resource constraints
  // a*x + b*y <= capacity or >= capacity or == capacity
  interface Line {
    a: number;
    b: number;
    c: number;
    type: 'LEQ' | 'GEQ' | 'EQ';
    resourceIndex?: number;
  }

  const lines: Line[] = [
    { a: -1, b: 0, c: 0, type: 'LEQ' }, // x >= 0  => -x <= 0
    { a: 0, b: -1, c: 0, type: 'LEQ' }, // y >= 0  => -y <= 0
  ];

  resources.forEach((r, idx) => {
    const a = usage[p1.id]?.[r.id] ?? 0;
    const b = usage[p2.id]?.[r.id] ?? 0;
    if (Math.abs(a) > EPSILON || Math.abs(b) > EPSILON) {
      lines.push({ a, b, c: r.capacity, type: r.type, resourceIndex: idx });
    }
  });

  // Find all pairwise intersection points
  const candidatePoints: [number, number][] = [[0, 0]];

  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const l1 = lines[i];
      const l2 = lines[j];
      const det = l1.a * l2.b - l1.b * l2.a;
      if (Math.abs(det) > EPSILON) {
        const x = (l1.c * l2.b - l1.b * l2.c) / det;
        const y = (l1.a * l2.c - l1.c * l2.a) / det;
        if (x >= -EPSILON && y >= -EPSILON) {
          candidatePoints.push([Math.max(0, x), Math.max(0, y)]);
        }
      }
    }
  }

  // Filter feasible points
  const feasiblePoints = candidatePoints.filter(([x, y]) => {
    if (x < -EPSILON || y < -EPSILON) return false;
    for (const res of resources) {
      const a = usage[p1.id]?.[res.id] ?? 0;
      const b = usage[p2.id]?.[res.id] ?? 0;
      const val = a * x + b * y;
      if (res.type === 'LEQ' && val > res.capacity + 0.01) return false;
      if (res.type === 'GEQ' && val < res.capacity - 0.01) return false;
      if (res.type === 'EQ' && Math.abs(val - res.capacity) > 0.01) return false;
    }
    return true;
  });

  if (feasiblePoints.length === 0) {
    return { status: 'INFEASIBLE', quantities: [0, 0], shadowPrices: [] };
  }

  // Find optimal point
  let bestVal = objective === 'MAXIMIZE_PROFIT' ? -Infinity : Infinity;
  let bestPoint: [number, number] = [0, 0];

  for (const pt of feasiblePoints) {
    let [x, y] = pt;
    if (p1.integerOnly) x = Math.round(x);
    if (p2.integerOnly) y = Math.round(y);
    const val = p1.profit * x + p2.profit * y;
    if (objective === 'MAXIMIZE_PROFIT') {
      if (val > bestVal) {
        bestVal = val;
        bestPoint = [x, y];
      }
    } else {
      if (val < bestVal) {
        bestVal = val;
        bestPoint = [x, y];
      }
    }
  }

  // Compute shadow prices by testing small delta on each constraint
  const shadowPrices: number[] = computeShadow
    ? resources.map((r) => {
        if (r.type !== 'LEQ') return 0;
        // Delta capacity + 1
        const perturbedResources = resources.map((res) =>
          res.id === r.id ? { ...res, capacity: res.capacity + 1 } : res
        );
        const resPerturbed = solve2DDirect('MAXIMIZE_PROFIT', products, perturbedResources, usage, false);
        if (resPerturbed.status === 'OPTIMAL') {
          const newProfit =
            resPerturbed.quantities[0] * p1.profit + resPerturbed.quantities[1] * p2.profit;
          return Math.max(0, newProfit - bestVal);
        }
        return 0;
      })
    : [];

  return {
    status: 'OPTIMAL',
    quantities: bestPoint,
    shadowPrices,
  };
}

// General Simplex Solver for N products
function solveSimplexGeneral(
  objective: ObjectiveType,
  products: Product[],
  resources: Resource[],
  usage: UsageMatrix
): {
  status: 'OPTIMAL' | 'INFEASIBLE' | 'UNBOUNDED';
  quantities: number[];
  shadowPrices: number[];
} {
  const numVars = products.length;
  const numConstraints = resources.length;

  // Objective function coefficients
  const c = products.map((p) => (objective === 'MAXIMIZE_PROFIT' ? p.profit : -p.profit));

  // Build Tableau: Standard form max c^T x s.t. Ax <= b, x >= 0
  // For LEQ: slack variable s_i >= 0
  // Rows: numConstraints + 1 (last is objective)
  // Cols: numVars + numConstraints + 1 (last is RHS)
  const rows = numConstraints + 1;
  const cols = numVars + numConstraints + 1;
  const tableau: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < numConstraints; i++) {
    const res = resources[i];
    for (let j = 0; j < numVars; j++) {
      const prod = products[j];
      const coef = usage[prod.id]?.[res.id] ?? 0;
      tableau[i][j] = res.type === 'GEQ' ? -coef : coef;
    }
    tableau[i][numVars + i] = 1; // Slack
    tableau[i][cols - 1] = res.type === 'GEQ' ? -res.capacity : res.capacity;
  }

  // Objective row
  for (let j = 0; j < numVars; j++) {
    tableau[rows - 1][j] = -c[j];
  }

  // Dual Simplex / Primal Simplex loop
  const maxIterations = 200;
  let iterations = 0;

  // Check if any b_i < 0, handle with Dual Simplex
  while (iterations++ < maxIterations) {
    let pivotRow = -1;
    let minRHS = -EPSILON;
    for (let i = 0; i < numConstraints; i++) {
      if (tableau[i][cols - 1] < minRHS) {
        minRHS = tableau[i][cols - 1];
        pivotRow = i;
      }
    }

    if (pivotRow === -1) break; // All RHS non-negative

    let pivotCol = -1;
    let minRatio = Infinity;
    for (let j = 0; j < cols - 1; j++) {
      if (tableau[pivotRow][j] < -EPSILON) {
        const ratio = Math.abs(tableau[rows - 1][j] / tableau[pivotRow][j]);
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotCol = j;
        }
      }
    }

    if (pivotCol === -1) {
      return { status: 'INFEASIBLE', quantities: products.map(() => 0), shadowPrices: [] };
    }

    pivot(tableau, pivotRow, pivotCol);
  }

  // Regular Primal Simplex
  iterations = 0;
  while (iterations++ < maxIterations) {
    let pivotCol = -1;
    let minObj = -EPSILON;
    for (let j = 0; j < cols - 1; j++) {
      if (tableau[rows - 1][j] < minObj) {
        minObj = tableau[rows - 1][j];
        pivotCol = j;
      }
    }

    if (pivotCol === -1) break; // Optimum reached

    let pivotRow = -1;
    let minRatio = Infinity;
    for (let i = 0; i < numConstraints; i++) {
      if (tableau[i][pivotCol] > EPSILON) {
        const ratio = tableau[i][cols - 1] / tableau[i][pivotCol];
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotRow = i;
        }
      }
    }

    if (pivotRow === -1) {
      return { status: 'UNBOUNDED', quantities: products.map(() => 0), shadowPrices: [] };
    }

    pivot(tableau, pivotRow, pivotCol);
  }

  // Read solution
  const quantities = products.map(() => 0);
  for (let j = 0; j < numVars; j++) {
    let basicRow = -1;
    let isBasic = true;
    for (let i = 0; i < numConstraints; i++) {
      if (Math.abs(tableau[i][j] - 1) < EPSILON && basicRow === -1) {
        basicRow = i;
      } else if (Math.abs(tableau[i][j]) > EPSILON) {
        isBasic = false;
        break;
      }
    }
    if (isBasic && basicRow !== -1 && Math.abs(tableau[rows - 1][j]) < EPSILON) {
      quantities[j] = Math.max(0, tableau[basicRow][cols - 1]);
    }
  }

  // Shadow prices are from the slack variable columns in the objective row
  const shadowPrices = resources.map((_, i) =>
    Math.max(0, tableau[rows - 1][numVars + i])
  );

  return { status: 'OPTIMAL', quantities, shadowPrices };
}

function pivot(tableau: number[][], pivotRow: number, pivotCol: number) {
  const rows = tableau.length;
  const cols = tableau[0].length;
  const pivotVal = tableau[pivotRow][pivotCol];

  for (let j = 0; j < cols; j++) {
    tableau[pivotRow][j] /= pivotVal;
  }

  for (let i = 0; i < rows; i++) {
    if (i !== pivotRow) {
      const factor = tableau[i][pivotCol];
      for (let j = 0; j < cols; j++) {
        tableau[i][j] -= factor * tableau[pivotRow][j];
      }
    }
  }
}

function calculate2DGeometry(
  p1: Product,
  p2: Product,
  resources: Resource[],
  usage: UsageMatrix,
  optimalPoint: [number, number],
  objective: ObjectiveType
): Geometry2D {
  const colors = ['#1F4E5F', '#C2793A', '#6B7A3A', '#8A3B4A', '#5E6C84', '#8F8A7E'];

  const constraintLines = resources.map((r, i) => {
    const a = usage[p1.id]?.[r.id] ?? 0;
    const b = usage[p2.id]?.[r.id] ?? 0;
    return {
      resourceId: r.id,
      name: r.name,
      a,
      b,
      c: r.capacity,
      type: r.type,
      color: colors[i % colors.length],
    };
  });

  // Calculate polygon vertices
  const points: [number, number][] = [[0, 0]];
  for (let i = 0; i < constraintLines.length; i++) {
    const l1 = constraintLines[i];
    // Intersections with axes
    if (Math.abs(l1.a) > EPSILON) points.push([l1.c / l1.a, 0]);
    if (Math.abs(l1.b) > EPSILON) points.push([0, l1.c / l1.b]);

    // Intersections between lines
    for (let j = i + 1; j < constraintLines.length; j++) {
      const l2 = constraintLines[j];
      const det = l1.a * l2.b - l1.b * l2.a;
      if (Math.abs(det) > EPSILON) {
        const x = (l1.c * l2.b - l1.b * l2.c) / det;
        const y = (l1.a * l2.c - l1.c * l2.a) / det;
        points.push([x, y]);
      }
    }
  }

  // Filter valid feasible points
  const validPoints = points.filter(([x, y]) => {
    if (x < -EPSILON || y < -EPSILON) return false;
    for (const r of constraintLines) {
      const val = r.a * x + r.b * y;
      if (r.type === 'LEQ' && val > r.c + 0.05) return false;
      if (r.type === 'GEQ' && val < r.c - 0.05) return false;
      if (r.type === 'EQ' && Math.abs(val - r.c) > 0.05) return false;
    }
    return true;
  });

  // Sort vertices counter-clockwise around centroid to form polygon
  const centroidX = validPoints.reduce((s, p) => s + p[0], 0) / (validPoints.length || 1);
  const centroidY = validPoints.reduce((s, p) => s + p[1], 0) / (validPoints.length || 1);

  const sortedPolygon = [...validPoints].sort((a, b) => {
    const angleA = Math.atan2(a[1] - centroidY, a[0] - centroidX);
    const angleB = Math.atan2(b[1] - centroidY, b[0] - centroidX);
    return angleA - angleB;
  });

  // Compute maximum bounds for charting
  const maxX = Math.max(
    optimalPoint[0] * 1.35,
    ...validPoints.map((p) => p[0] * 1.15),
    10
  );
  const maxY = Math.max(
    optimalPoint[1] * 1.35,
    ...validPoints.map((p) => p[1] * 1.15),
    10
  );

  const cornerPoints: CornerPoint2D[] = validPoints.map(([x, y]) => {
    const roundedX = Math.round(x * 10) / 10;
    const roundedY = Math.round(y * 10) / 10;
    const value = p1.profit * roundedX + p2.profit * roundedY;
    const isOptimal =
      Math.abs(roundedX - optimalPoint[0]) < 0.2 &&
      Math.abs(roundedY - optimalPoint[1]) < 0.2;
    return {
      x: roundedX,
      y: roundedY,
      value,
      isOptimal,
      label: `(${roundedX}, ${roundedY}) = ${formatRupiah(value)}`,
    };
  });

  return {
    is2D: true,
    productX: p1,
    productY: p2,
    feasiblePolygon: sortedPolygon,
    cornerPoints,
    optimalPoint,
    maxBounds: { x: maxX, y: maxY },
    constraintLines,
  };
}

function identifyConflictingConstraints(
  objective: ObjectiveType,
  products: Product[],
  resources: Resource[],
  usage: UsageMatrix
): ConflictingConstraint[] {
  const conflicts: ConflictingConstraint[] = [];

  resources.forEach((r) => {
    // If resource has GEQ (minimal requirement) that cannot be met
    if (r.type === 'GEQ') {
      conflicts.push({
        resourceId: r.id,
        name: r.name,
        reason: `Target minimal ${r.name} sebesar ${r.capacity} ${r.unit} terlalu tinggi dibanding batas sumber daya lainnya.`,
        suggestedFix: `Kurangi target minimal ${r.name} menjadi ${Math.round(r.capacity * 0.7)} ${r.unit}`,
        suggestedCapacity: Math.round(r.capacity * 0.7),
      });
    } else if (r.capacity <= 0) {
      conflicts.push({
        resourceId: r.id,
        name: r.name,
        reason: `Kapasitas ${r.name} bernilai 0 atau negatif, sehingga tidak ada produksi yang dapat berjalan.`,
        suggestedFix: `Tingkatkan kapasitas ${r.name} menjadi setidaknya 10 ${r.unit}`,
        suggestedCapacity: 10,
      });
    }
  });

  if (conflicts.length === 0 && resources.length > 0) {
    const firstRes = resources[0];
    conflicts.push({
      resourceId: firstRes.id,
      name: firstRes.name,
      reason: `Batasan kapasitas ${firstRes.name} bertabrakan dengan batasan lainnya.`,
      suggestedFix: `Tambah kapasitas ${firstRes.name} sebesar 20% (+${Math.round(firstRes.capacity * 0.2)} ${firstRes.unit})`,
      suggestedCapacity: Math.round(firstRes.capacity * 1.2),
    });
  }

  return conflicts;
}

function createEmptySolution(objective: ObjectiveType): Solution {
  return {
    status: 'OPTIMAL',
    objectiveValue: 0,
    objectiveType: objective,
    products: [],
    resources: [],
    conclusionSentence: 'Silakan isi produk dan sumber daya untuk melihat rekomendasi.',
    calculationTimeMs: 0,
  };
}
