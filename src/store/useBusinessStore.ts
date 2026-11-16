import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ObjectiveType,
  Product,
  Resource,
  UsageMatrix,
  Solution,
  Scenario,
  AISettings,
  ConstraintType,
} from '@/types';
import { solveOptimization } from '@/lib/solver/simplex';
import { BUSINESS_TEMPLATES } from '@/lib/templates';
import LZString from 'lz-string';

export type ActiveTab = 'wizard' | 'table' | 'results' | 'scenarios';
export type TableDensity = 'comfortable' | 'compact';
export type RobustnessLevel = 'none' | 'light' | 'medium' | 'heavy';

interface BusinessState {
  objective: ObjectiveType;
  products: Product[];
  resources: Resource[];
  usage: UsageMatrix;
  
  activeTab: ActiveTab;
  wizardStep: 1 | 2 | 3 | 4;
  tableDensity: TableDensity;
  
  whatIfAdjustments: { [resourceId: string]: number }; // Stores overridden capacity
  robustnessLevel: RobustnessLevel;
  
  scenarios: Scenario[];
  aiSettings: AISettings;

  solution: Solution;

  // History for Undo/Redo (PRD 5.1)
  history: Array<{
    objective: ObjectiveType;
    products: Product[];
    resources: Resource[];
    usage: UsageMatrix;
  }>;
  historyIndex: number;

  // Actions
  setObjective: (obj: ObjectiveType) => void;
  setWizardStep: (step: 1 | 2 | 3 | 4) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setTableDensity: (density: TableDensity) => void;

  addProduct: (product?: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;

  addResource: (resource?: Partial<Resource>) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  removeResource: (id: string) => void;

  updateUsage: (productId: string, resourceId: string, value: number) => void;

  loadTemplate: (templateId: string) => void;
  resetAll: () => void;

  // What-If
  setWhatIfCapacity: (resourceId: string, capacity: number) => void;
  adjustWhatIfPercent: (resourceId: string, percent: number) => void;
  resetWhatIf: () => void;
  setRobustnessLevel: (level: RobustnessLevel) => void;

  // Fix conflicting constraint
  applySuggestedFix: (resourceId: string, suggestedCapacity: number) => void;

  // Scenarios
  saveCurrentScenario: (name: string) => void;
  deleteScenario: (id: string) => void;
  loadScenario: (id: string) => void;

  // AI Settings
  setAISettings: (settings: Partial<AISettings>) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;

  // Import / Export Sharing
  importModelData: (
    objective: ObjectiveType,
    products: Product[],
    resources: Resource[],
    usage: UsageMatrix
  ) => void;
  getShareableHash: () => string;
  loadFromShareableHash: (hash: string) => boolean;
}

const defaultTemplate = BUSINESS_TEMPLATES[0];

function computeSolution(
  objective: ObjectiveType,
  products: Product[],
  resources: Resource[],
  usage: UsageMatrix,
  whatIf: { [resourceId: string]: number },
  robustness: RobustnessLevel
): Solution {
  // Apply What-If capacity overrides
  let activeResources = resources.map((r) => {
    let capacity = whatIf[r.id] !== undefined ? whatIf[r.id] : r.capacity;
    
    // Apply Robustness perturbation (PRD 5.2)
    if (robustness === 'light') {
      capacity = capacity * 0.95; // -5% stress
    } else if (robustness === 'medium') {
      capacity = capacity * 0.90; // -10% stress
    } else if (robustness === 'heavy') {
      capacity = capacity * 0.80; // -20% stress
    }

    return { ...r, capacity: Math.round(capacity * 10) / 10 };
  });

  return solveOptimization(objective, products, activeResources, usage);
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => {
      const initialSolution = computeSolution(
        defaultTemplate.objective,
        defaultTemplate.products,
        defaultTemplate.resources,
        defaultTemplate.usage,
        {},
        'none'
      );

      return {
        objective: defaultTemplate.objective,
        products: defaultTemplate.products,
        resources: defaultTemplate.resources,
        usage: defaultTemplate.usage,

        activeTab: 'wizard',
        wizardStep: 1,
        tableDensity: 'comfortable',

        whatIfAdjustments: {},
        robustnessLevel: 'none',

        scenarios: [],
        aiSettings: {
          provider: 'openai',
          apiKey: '',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4o',
          isLocal: true,
        },

        solution: initialSolution,

        history: [
          {
            objective: defaultTemplate.objective,
            products: defaultTemplate.products,
            resources: defaultTemplate.resources,
            usage: defaultTemplate.usage,
          },
        ],
        historyIndex: 0,

        setObjective: (obj) => {
          set((state) => {
            const nextSolution = computeSolution(
              obj,
              state.products,
              state.resources,
              state.usage,
              state.whatIfAdjustments,
              state.robustnessLevel
            );
            return {
              objective: obj,
              solution: nextSolution,
            };
          });
        },

        setWizardStep: (step) => set({ wizardStep: step }),
        setActiveTab: (tab) => set({ activeTab: tab }),
        setTableDensity: (density) => set({ tableDensity: density }),

        addProduct: (product) => {
          set((state) => {
            const newId = `p${Date.now()}`;
            const newProd: Product = {
              id: newId,
              name: product?.name || `Produk ${state.products.length + 1}`,
              profit: product?.profit ?? 10000,
              unit: product?.unit || 'unit',
              integerOnly: product?.integerOnly ?? true,
            };
            const updatedProducts = [...state.products, newProd];
            const updatedUsage: UsageMatrix = { ...state.usage, [newId]: {} };
            state.resources.forEach((r) => {
              updatedUsage[newId][r.id] = 1;
            });

            const nextSolution = computeSolution(
              state.objective,
              updatedProducts,
              state.resources,
              updatedUsage,
              state.whatIfAdjustments,
              state.robustnessLevel
            );

            return {
              products: updatedProducts,
              usage: updatedUsage,
              solution: nextSolution,
            };
          });
        },

        updateProduct: (id, updates) => {
          set((state) => {
            const updatedProducts = state.products.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            );
            const nextSolution = computeSolution(
              state.objective,
              updatedProducts,
              state.resources,
              state.usage,
              state.whatIfAdjustments,
              state.robustnessLevel
            );
            return {
              products: updatedProducts,
              solution: nextSolution,
            };
          });
        },

        removeProduct: (id) => {
          set((state) => {
            if (state.products.length <= 1) return state; // keep at least 1 product
            const updatedProducts = state.products.filter((p) => p.id !== id);
            const updatedUsage: UsageMatrix = { ...state.usage };
            delete updatedUsage[id];

            const nextSolution = computeSolution(
              state.objective,
              updatedProducts,
              state.resources,
              updatedUsage,
              state.whatIfAdjustments,
              state.robustnessLevel
            );
            return {
              products: updatedProducts,
              usage: updatedUsage,
              solution: nextSolution,
            };
          });
        },

        addResource: (resource) => {
          set((state) => {
            const newId = `r${Date.now()}`;
            const newRes: Resource = {
              id: newId,
              name: resource?.name || `Sumber Daya ${state.resources.length + 1}`,
              capacity: resource?.capacity ?? 100,
              unit: resource?.unit || 'unit',
              type: resource?.type || 'LEQ',
            };
            const updatedResources = [...state.resources, newRes];
            const updatedUsage: UsageMatrix = { ...state.usage };
            state.products.forEach((p) => {
              if (!updatedUsage[p.id]) updatedUsage[p.id] = {};
              updatedUsage[p.id][newId] = 1;
            });

            const nextSolution = computeSolution(
              state.objective,
              state.products,
              updatedResources,
              updatedUsage,
              state.whatIfAdjustments,
              state.robustnessLevel
            );
            return {
              resources: updatedResources,
              usage: updatedUsage,
              solution: nextSolution,
            };
          });
        },

        updateResource: (id, updates) => {
          set((state) => {
            const updatedResources = state.resources.map((r) =>
              r.id === id ? { ...r, ...updates } : r
            );
            const nextSolution = computeSolution(
              state.objective,
              state.products,
              updatedResources,
              state.usage,
              state.whatIfAdjustments,
              state.robustnessLevel
            );
            return {
              resources: updatedResources,
              solution: nextSolution,
            };
          });
        },

        removeResource: (id) => {
          set((state) => {
            if (state.resources.length <= 1) return state; // keep at least 1
            const updatedResources = state.resources.filter((r) => r.id !== id);
            const updatedUsage: UsageMatrix = { ...state.usage };
            state.products.forEach((p) => {
              if (updatedUsage[p.id]) {
                delete updatedUsage[p.id][id];
              }
            });

            const nextSolution = computeSolution(
              state.objective,
              state.products,
              updatedResources,
              updatedUsage,
              state.whatIfAdjustments,
              state.robustnessLevel
            );
            return {
              resources: updatedResources,
              usage: updatedUsage,
              solution: nextSolution,
            };
          });
        },

        updateUsage: (productId, resourceId, value) => {
          set((state) => {
            const updatedUsage = {
              ...state.usage,
              [productId]: {
                ...(state.usage[productId] || {}),
                [resourceId]: Math.max(0, value),
              },
            };
            const nextSolution = computeSolution(
              state.objective,
              state.products,
              state.resources,
              updatedUsage,
              state.whatIfAdjustments,
              state.robustnessLevel
            );
            return {
              usage: updatedUsage,
              solution: nextSolution,
            };
          });
        },

        loadTemplate: (templateId) => {
          const tmpl = BUSINESS_TEMPLATES.find((t) => t.id === templateId) || BUSINESS_TEMPLATES[0];
          set(() => {
            const nextSolution = computeSolution(
              tmpl.objective,
              tmpl.products,
              tmpl.resources,
              tmpl.usage,
              {},
              'none'
            );
            return {
              objective: tmpl.objective,
              products: tmpl.products,
              resources: tmpl.resources,
              usage: tmpl.usage,
              whatIfAdjustments: {},
              robustnessLevel: 'none',
              solution: nextSolution,
            };
          });
        },

        resetAll: () => {
          get().loadTemplate('fnb-bakery');
        },

        // What-If Realtime controls (<100ms)
        setWhatIfCapacity: (resourceId, capacity) => {
          set((state) => {
            const nextWhatIf = { ...state.whatIfAdjustments, [resourceId]: capacity };
            const nextSolution = computeSolution(
              state.objective,
              state.products,
              state.resources,
              state.usage,
              nextWhatIf,
              state.robustnessLevel
            );
            return {
              whatIfAdjustments: nextWhatIf,
              solution: nextSolution,
            };
          });
        },

        adjustWhatIfPercent: (resourceId, percent) => {
          const currentRes = get().resources.find((r) => r.id === resourceId);
          if (!currentRes) return;
          const baseCap = get().whatIfAdjustments[resourceId] !== undefined
            ? get().whatIfAdjustments[resourceId]
            : currentRes.capacity;
          const newCap = Math.max(0, Math.round(baseCap * (1 + percent / 100)));
          get().setWhatIfCapacity(resourceId, newCap);
        },

        resetWhatIf: () => {
          set((state) => {
            const nextSolution = computeSolution(
              state.objective,
              state.products,
              state.resources,
              state.usage,
              {},
              state.robustnessLevel
            );
            return {
              whatIfAdjustments: {},
              solution: nextSolution,
            };
          });
        },

        setRobustnessLevel: (level) => {
          set((state) => {
            const nextSolution = computeSolution(
              state.objective,
              state.products,
              state.resources,
              state.usage,
              state.whatIfAdjustments,
              level
            );
            return {
              robustnessLevel: level,
              solution: nextSolution,
            };
          });
        },

        applySuggestedFix: (resourceId, suggestedCapacity) => {
          get().updateResource(resourceId, { capacity: suggestedCapacity });
          get().resetWhatIf();
        },

        // Scenarios
        saveCurrentScenario: (name) => {
          set((state) => {
            const newScenario: Scenario = {
              id: `sc_${Date.now()}`,
              name: name || `Skenario ${state.scenarios.length + 1}`,
              createdAt: new Date().toLocaleString('id-ID'),
              objective: state.objective,
              products: state.products,
              resources: state.resources,
              usage: state.usage,
              solution: state.solution,
            };
            return {
              scenarios: [...state.scenarios, newScenario],
            };
          });
        },

        deleteScenario: (id) => {
          set((state) => ({
            scenarios: state.scenarios.filter((s) => s.id !== id),
          }));
        },

        loadScenario: (id) => {
          const sc = get().scenarios.find((s) => s.id === id);
          if (!sc) return;
          set(() => ({
            objective: sc.objective,
            products: sc.products,
            resources: sc.resources,
            usage: sc.usage,
            whatIfAdjustments: {},
            solution: sc.solution,
            activeTab: 'results',
          }));
        },

        // AI Settings
        setAISettings: (settings) => {
          set((state) => {
            const updated = { ...state.aiSettings, ...settings };
            updated.isLocal = !updated.apiKey || updated.apiKey.trim() === '';
            return { aiSettings: updated };
          });
        },

        undo: () => {
          // Future expansion
        },
        redo: () => {
          // Future expansion
        },

        // Import & Sharing
        importModelData: (objective, products, resources, usage) => {
          set((state) => {
            const nextSolution = computeSolution(
              objective,
              products,
              resources,
              usage,
              {},
              'none'
            );
            return {
              objective,
              products,
              resources,
              usage,
              whatIfAdjustments: {},
              robustnessLevel: 'none',
              solution: nextSolution,
              activeTab: 'results',
            };
          });
        },

        getShareableHash: () => {
          const state = get();
          const payload = {
            o: state.objective,
            p: state.products,
            r: state.resources,
            u: state.usage,
          };
          return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
        },

        loadFromShareableHash: (hash) => {
          try {
            const decompressed = LZString.decompressFromEncodedURIComponent(hash);
            if (!decompressed) return false;
            const data = JSON.parse(decompressed);
            if (data.p && data.r && data.u) {
              get().importModelData(data.o || 'MAXIMIZE_PROFIT', data.p, data.r, data.u);
              return true;
            }
          } catch (e) {
            console.error('Error loading shared hash', e);
          }
          return false;
        },
      };
    },
    {
      name: 'optimasi-prediksi-bisnis-storage',
      partialize: (state) => ({
        objective: state.objective,
        products: state.products,
        resources: state.resources,
        usage: state.usage,
        scenarios: state.scenarios,
        aiSettings: {
          ...state.aiSettings,
          apiKey: '', // Never persist API keys in localStorage for security (PRD 7 & 12)
        },
      }),
    }
  )
);
