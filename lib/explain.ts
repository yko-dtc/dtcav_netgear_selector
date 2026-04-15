import {
  canUseFrontFacingException,
  getAccessCopperPorts,
  getAvailableCopperPorts,
  getPreferredPortClass,
  getSwitchPortClass,
  isSmallInstallExceptionModel,
} from "@/lib/filters";
import type { RecommendationResult, SelectorFilters, SwitchModel } from "@/lib/types";

export function buildRecommendationReasons(
  switchModel: SwitchModel,
  filters: SelectorFilters,
) {
  const reasons: string[] = [];
  const availableCopperPorts = getAvailableCopperPorts(switchModel);
  const requestedPortClass = getPreferredPortClass(filters.copperPortsNeeded);
  const switchPortClass = getSwitchPortClass(switchModel);

  reasons.push(`${availableCopperPorts} copper ports for ${filters.copperPortsNeeded} needed`);

  if (filters.poeRequired) {
    reasons.push(`${switchModel.poeType} meets the required PoE type`);
    reasons.push(`${switchModel.poeBudgetMaxWatts}W PoE budget clears ${filters.minimumPoeBudget}W`);
  }

  if (filters.minimumSfpPlusCount > 0) {
    reasons.push(`${switchModel.sfpPlus10G}x SFP+ uplinks meet the minimum`);
  }

  if (switchModel.orientation === "rear-facing") {
    reasons.push("Rear-facing layout matches the preferred rack orientation");
  } else if (canUseFrontFacingException(switchModel, filters)) {
    reasons.push("Approved front-facing exception for compact installs");
  }

  if (switchModel.standardTier === "preferred") {
    reasons.push("Preferred approved access model");
  } else if (switchModel.standardTier === "standard") {
    reasons.push("Approved standard access model");
  } else if (isSmallInstallExceptionModel(switchModel)) {
    reasons.push("Approved compact exception model");
  }

  if (switchPortClass !== 0 && switchPortClass === requestedPortClass) {
    reasons.push(`${requestedPortClass}-port class fit`);
  }

  if (filters.copperPortsNeeded <= 8 && isSmallInstallExceptionModel(switchModel)) {
    reasons.push("Auto-included for small-room requests");
  }

  return reasons;
}

export function buildWatchOuts(
  switchModel: SwitchModel,
  filters: SelectorFilters,
) {
  const watchOuts = [...switchModel.notes];

  if (isSmallInstallExceptionModel(switchModel)) {
    watchOuts.push("This model is an exception item and should not be the default room-rack choice.");
  }

  if (
    filters.poeRequired &&
    switchModel.poeBudgetBaseWatts < filters.minimumPoeBudget &&
    switchModel.poeBudgetMaxWatts >= filters.minimumPoeBudget
  ) {
    watchOuts.push(
      `Base PoE budget is ${switchModel.poeBudgetBaseWatts}W, so confirm the final power configuration before release.`,
    );
  }

  if (switchModel.connectorStyle === "QSFP28") {
    watchOuts.push("QSFP28 uplinks are not interchangeable with SFP+ in this selector.");
  }

  return Array.from(new Set(watchOuts));
}

function formatRequirementList(filters: SelectorFilters) {
  const requirements = ["port count"];

  if (filters.poeRequired) {
    requirements.push("PoE type", "PoE budget");
  }

  if (filters.minimumSfpPlusCount > 0) {
    requirements.push("SFP+ uplinks");
  }

  if (requirements.length === 1) {
    return requirements[0];
  }

  if (requirements.length === 2) {
    return `${requirements[0]} and ${requirements[1]}`;
  }

  return `${requirements.slice(0, -1).join(", ")}, and ${requirements.at(-1)}`;
}

export function buildRecommendationSummary(
  result: RecommendationResult,
  filters: SelectorFilters,
) {
  return `Recommended: ${result.switch.model} because it clears the ${formatRequirementList(filters)} checks.`;
}

export function buildCatalogNotes(switchModel: SwitchModel) {
  const accessPorts =
    getAccessCopperPorts(switchModel) > 0
      ? `${getAccessCopperPorts(switchModel)} copper access ports`
      : `${switchModel.copper10G} copper 10G ports`;

  return [
    accessPorts,
    `${switchModel.sfpPlus10G}x SFP+ uplinks`,
    switchModel.poeType === "None"
      ? "No PoE"
      : `${switchModel.poeType} with up to ${switchModel.poeBudgetMaxWatts}W`,
    switchModel.orientation === "rear-facing" ? "Rear-facing layout" : "Front-facing layout",
  ];
}
