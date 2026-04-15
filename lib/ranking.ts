import { buildRecommendationReasons, buildRecommendationSummary, buildWatchOuts } from "@/lib/explain";
import {
  evaluateHardRequirements,
  getAvailableCopperPorts,
  getPortOversize,
  getPreferredPortClass,
  getSwitchPortClass,
} from "@/lib/filters";
import type {
  RecommendationBuckets,
  RecommendationResult,
  SelectorFilters,
  SwitchModel,
} from "@/lib/types";

function getSfpScore(switchModel: SwitchModel, filters: SelectorFilters) {
  if (filters.minimumSfpPlusCount === 0) {
    return 4;
  }

  return Math.max(
    0,
    8 - Math.abs(switchModel.sfpPlus10G - filters.minimumSfpPlusCount),
  );
}

function getPoeBudgetScore(switchModel: SwitchModel, filters: SelectorFilters) {
  if (!filters.poeRequired) {
    return 4;
  }

  const delta = Math.abs(switchModel.poeBudgetMaxWatts - filters.minimumPoeBudget);
  return Math.max(0, 8 - Math.floor(delta / 120));
}

function isSmallestQualifiedFit(
  switchModel: SwitchModel,
  qualified: SwitchModel[],
  filters: SelectorFilters,
) {
  const currentPorts = getAvailableCopperPorts(switchModel);
  const minPorts = Math.min(
    ...qualified.map((candidate) => getAvailableCopperPorts(candidate)),
  );

  return currentPorts === minPorts;
}

function scoreSwitch(
  switchModel: SwitchModel,
  filters: SelectorFilters,
  qualified: SwitchModel[],
) {
  let score = 100;
  const targetClass = getPreferredPortClass(filters.copperPortsNeeded);
  const switchClass = getSwitchPortClass(switchModel);
  const oversize = getPortOversize(switchModel, filters);

  if (switchModel.allowAsDefault) {
    score += 25;
  }

  if (switchModel.orientation === "rear-facing") {
    score += 20;
  }

  if (switchModel.connectorStyle === "RJ45") {
    score += 10;
  }

  if (isSmallestQualifiedFit(switchModel, qualified, filters)) {
    score += 10;
  }

  score += getSfpScore(switchModel, filters);
  score += getPoeBudgetScore(switchModel, filters);

  if (switchModel.standardTier === "preferred") {
    score += 5;
  }

  if (switchModel.standardTier === "exception") {
    score -= 25;
  }

  if (switchClass !== 0 && switchClass === targetClass) {
    score += 40;
  } else if (switchClass !== 0) {
    score -= 15;
  }

  if (filters.copperPortsNeeded <= 8 && switchModel.allowForSmallInstalls) {
    score += 24;
  }

  score -= Math.max(0, oversize);

  return score;
}

function toRecommendationResult(
  switchModel: SwitchModel,
  filters: SelectorFilters,
  qualified: SwitchModel[],
) {
  const result: RecommendationResult = {
    switch: switchModel,
    score: scoreSwitch(switchModel, filters, qualified),
    matchReasons: buildRecommendationReasons(switchModel, filters),
    watchOuts: buildWatchOuts(switchModel, filters),
    disqualifiedReasons: [],
    summary: "",
  };

  result.summary = buildRecommendationSummary(result, filters);
  return result;
}

function sortResults(results: RecommendationResult[]) {
  return results.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.switch.model.localeCompare(right.switch.model);
  });
}

export function rankSwitches(
  switchModels: SwitchModel[],
  filters: SelectorFilters,
): RecommendationBuckets {
  const qualifiedModels: SwitchModel[] = [];
  const disqualified: RecommendationResult[] = [];

  for (const switchModel of switchModels) {
    const disqualifiedReasons = evaluateHardRequirements(switchModel, filters);

    if (disqualifiedReasons.length > 0) {
      disqualified.push({
        switch: switchModel,
        score: Number.NEGATIVE_INFINITY,
        matchReasons: [],
        watchOuts: [],
        disqualifiedReasons,
        summary: "",
      });
      continue;
    }

    qualifiedModels.push(switchModel);
  }

  const qualifiedResults = sortResults(
    qualifiedModels.map((switchModel) =>
      toRecommendationResult(switchModel, filters, qualifiedModels),
    ),
  );

  const recommended = qualifiedResults.filter(
    (result) => result.switch.category === "access",
  );

  const guidance =
    filters.copperPortsNeeded <= 8
      ? "Rear-facing access models stay prioritized by default, but the approved compact 8-port exception is automatically considered for very small rooms."
      : "This streamlined view stays focused on rear-facing RJ45 access switches from the approved internal list.";

  const alternates = recommended.slice(1);

  return {
    recommended: recommended.slice(0, 1),
    alternates,
    disqualified: sortResults(disqualified),
    guidance,
  };
}

export function getCatalogGroups(switchModels: SwitchModel[]) {
  return {
    access: switchModels.filter((switchModel) => switchModel.category === "access"),
    core: switchModels.filter((switchModel) => switchModel.category === "core_aggregation"),
  };
}

export function getRecommendationBanner(filters: SelectorFilters) {
  const portClass = getPreferredPortClass(filters.copperPortsNeeded);

  if (filters.copperPortsNeeded <= 8) {
    return "Compact requests automatically consider the approved 8-port exception first, then fall back to rear-facing access switches if needed.";
  }

  if (portClass === 24) {
    return "24-port class access switches are prioritized for this request size.";
  }

  return "48-port class access switches are prioritized for this request size.";
}
