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
  const availableCopperPorts = getAvailableCopperPorts(
    switchModel,
    filters.includeCoreAggregation,
  );
  const requestedPortClass = getPreferredPortClass(
    filters.copperPortsNeeded,
    filters.allowSmallInstallException,
  );
  const switchPortClass = getSwitchPortClass(switchModel);

  reasons.push(
    `Meets the ${filters.copperPortsNeeded}-port request with ${availableCopperPorts} usable copper ports.`,
  );

  if (filters.poeRequired) {
    reasons.push(
      `Supports ${switchModel.poeType} with up to ${switchModel.poeBudgetMaxWatts}W PoE budget.`,
    );
  }

  if (filters.minimumSfpPlusCount > 0) {
    reasons.push(
      `Provides ${switchModel.sfpPlus10G}x SFP+ uplinks for AV traffic transport between switches.`,
    );
  }

  if (switchModel.orientation === "rear-facing") {
    reasons.push("Rear-facing copper ports align with the preferred AV rack orientation.");
  } else if (canUseFrontFacingException(switchModel, filters)) {
    reasons.push("Approved front-facing small-install exception is allowed for this request.");
  }

  if (switchModel.standardTier === "preferred") {
    reasons.push("Falls inside the preferred standard access tier for commercial AV-over-IP work.");
  } else if (switchModel.standardTier === "standard") {
    reasons.push("Stays within the standard approved access catalog.");
  } else if (isSmallInstallExceptionModel(switchModel)) {
    reasons.push("Represents the approved compact exception for very small installs.");
  }

  if (switchPortClass !== 0 && switchPortClass === requestedPortClass) {
    reasons.push(`Matches the preferred ${requestedPortClass}-port class for this design size.`);
  }

  if (filters.multigigPreferred && switchModel.copperMultigig > 0) {
    reasons.push("Includes multigig copper ports, matching the current preference.");
  }

  if (switchModel.category === "core_aggregation") {
    reasons.push("Eligible only because core / aggregation models are explicitly included.");
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

  if (switchModel.category === "core_aggregation") {
    watchOuts.push("Core / aggregation models are visually separated to avoid accidental access-layer selection.");
  }

  if (switchModel.connectorStyle === "QSFP28") {
    watchOuts.push("QSFP28 uplinks are not interchangeable with SFP+ in this selector.");
  }

  if (filters.multigigPreferred && switchModel.copperMultigig === 0) {
    watchOuts.push("No multigig copper ports are available even though multigig is preferred.");
  }

  return Array.from(new Set(watchOuts));
}

export function buildRecommendationSummary(result: RecommendationResult) {
  const coreReason = result.matchReasons.slice(0, 4).join(", ").replace(/\.$/, "");
  return `Recommended: ${result.switch.model} because ${coreReason.toLowerCase()}.`;
}

export function buildCatalogNotes(switchModel: SwitchModel) {
  const accessPorts =
    getAccessCopperPorts(switchModel) > 0
      ? `${getAccessCopperPorts(switchModel)} copper access ports`
      : `${switchModel.copper10G} copper 10G ports`;

  return `${accessPorts}, ${switchModel.sfpPlus10G}x SFP+, ${switchModel.poeType}.`;
}
