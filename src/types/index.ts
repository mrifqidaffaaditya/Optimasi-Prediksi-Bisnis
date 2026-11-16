export type ObjectiveType = 'MAXIMIZE_PROFIT' | 'MINIMIZE_COST';

export type ConstraintType = 'LEQ' | 'GEQ' | 'EQ'; // <=, >=, ==

export interface Product {
  id: string;
  name: string;
  profit: number; // Untung per unit (atau biaya jika Minimalkan Biaya)
  unit: string;
  integerOnly: boolean; // Hanya jumlah utuh
}

export interface Resource {
  id: string;
  name: string;
  capacity: number;
  unit: string;
  type: ConstraintType; // 'Tidak boleh lebih dari', 'Paling sedikit', 'Harus tepat'
}

export type UsageMatrix = {
  [productId: string]: {
    [resourceId: string]: number;
  };
};

export type SolverStatus = 'OPTIMAL' | 'INFEASIBLE' | 'UNBOUNDED' | 'TIMEOUT';

export interface ProductResult {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  profitPerUnit: number;
  contribution: number;
  percentageOfTotal: number;
}

export interface ResourceResult {
  id: string;
  name: string;
  used: number;
  capacity: number;
  unit: string;
  slack: number; // Sisa kapasitas
  binding: boolean; // Terpakai penuh (penghambat)
  usagePercent: number;
  shadowPrice: number; // Nilai tambah per satu unit kapasitas
  type: ConstraintType;
}

export interface ConflictingConstraint {
  resourceId: string;
  name: string;
  reason: string;
  suggestedFix: string;
  suggestedCapacity: number;
}

export interface CornerPoint2D {
  x: number;
  y: number;
  value: number;
  isOptimal: boolean;
  label?: string;
}

export interface Geometry2D {
  is2D: boolean;
  productX: Product;
  productY: Product;
  feasiblePolygon: [number, number][];
  cornerPoints: CornerPoint2D[];
  optimalPoint: [number, number];
  maxBounds: { x: number; y: number };
  constraintLines: {
    resourceId: string;
    name: string;
    a: number; // coeff x
    b: number; // coeff y
    c: number; // capacity
    type: ConstraintType;
    color: string;
  }[];
}

export interface Solution {
  status: SolverStatus;
  objectiveValue: number;
  objectiveType: ObjectiveType;
  products: ProductResult[];
  resources: ResourceResult[];
  conclusionSentence: string;
  topBottleneck?: ResourceResult;
  conflictingConstraints?: ConflictingConstraint[];
  geometry2D?: Geometry2D;
  calculationTimeMs: number;
}

export interface Scenario {
  id: string;
  name: string;
  createdAt: string;
  objective: ObjectiveType;
  products: Product[];
  resources: Resource[];
  usage: UsageMatrix;
  solution: Solution;
}

export interface AISettings {
  provider: 'openai' | 'groq' | 'openrouter' | 'deepseek' | 'ollama';
  apiKey: string;
  baseUrl: string;
  model: string;
  isLocal: boolean;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  objective: ObjectiveType;
  products: Product[];
  resources: Resource[];
  usage: UsageMatrix;
}
