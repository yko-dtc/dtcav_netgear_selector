export type PoeType = "None" | "PoE+" | "PoE++";

export type SwitchCategory = "access" | "core_aggregation";

export type StandardTier = "exception" | "standard" | "preferred" | "core";

export interface SwitchModel {
  series: string;
  model: string;
  sku: string;
  taaSku: string | null;
  category: SwitchCategory;
  approved: boolean;
  recommendedUse: string;
  portProfile: string;
  copper1G: number;
  copperMultigig: number;
  copper10G: number;
  sfp1G: number;
  sfpPlus10G: number;
  sfp28_25G: number;
  qsfp28_100G: number;
  poeType: PoeType;
  poePorts: number;
  poeBudgetBaseWatts: number;
  poeBudgetMaxWatts: number;
  orientation: "rear-facing" | "front-facing";
  connectorStyle: "RJ45" | "QSFP28" | "Other";
  notes: string[];
  standardTier: StandardTier;
  allowAsDefault: boolean;
  allowForSmallInstalls: boolean;
  allowForCoreAggregation: boolean;
  image: string;
}

export interface SelectorFilters {
  copperPortsNeeded: number;
  poeRequired: boolean;
  minimumPoeType: PoeType;
  minimumPoeBudget: number;
  minimumSfpPlusCount: number;
}

export interface RecommendationResult {
  switch: SwitchModel;
  score: number;
  matchReasons: string[];
  watchOuts: string[];
  disqualifiedReasons: string[];
  summary: string;
}

export interface RecommendationBuckets {
  recommended: RecommendationResult[];
  alternates: RecommendationResult[];
  disqualified: RecommendationResult[];
  guidance: string | null;
}

export const defaultFilters: SelectorFilters = {
  copperPortsNeeded: 24,
  poeRequired: true,
  minimumPoeType: "PoE+",
  minimumPoeBudget: 300,
  minimumSfpPlusCount: 4,
};
