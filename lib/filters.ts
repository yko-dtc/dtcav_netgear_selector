import type { PoeType, SelectorFilters, SwitchModel } from "@/lib/types";

export const poeRank = {
  None: 0,
  "PoE+": 1,
  "PoE++": 2,
} as const;

const booleanKeys = new Set<keyof SelectorFilters>([
  "poeRequired",
  "rearFacingOnly",
  "rj45Only",
  "multigigPreferred",
  "allowSmallInstallException",
  "includeCoreAggregation",
]);

const numberKeys = new Set<keyof SelectorFilters>([
  "copperPortsNeeded",
  "minimumPoeBudget",
  "minimumSfpPlusCount",
]);

export function getAccessCopperPorts(switchModel: SwitchModel) {
  return switchModel.copper1G + switchModel.copperMultigig;
}

export function getAvailableCopperPorts(
  switchModel: SwitchModel,
  includeCoreAggregation: boolean,
) {
  if (switchModel.category === "core_aggregation" && includeCoreAggregation) {
    return switchModel.copper1G + switchModel.copperMultigig + switchModel.copper10G;
  }

  return getAccessCopperPorts(switchModel);
}

export function getPreferredPortClass(
  copperPortsNeeded: number,
  allowSmallInstallException: boolean,
) {
  if (copperPortsNeeded <= 8) {
    return allowSmallInstallException ? 8 : 24;
  }

  if (copperPortsNeeded <= 24) {
    return 24;
  }

  return 48;
}

export function getSwitchPortClass(switchModel: SwitchModel) {
  if (switchModel.category === "core_aggregation") {
    return 0;
  }

  const ports = getAccessCopperPorts(switchModel);

  if (ports <= 8) {
    return 8;
  }

  if (ports <= 26) {
    return 24;
  }

  return 48;
}

export function isSmallInstallExceptionModel(switchModel: SwitchModel) {
  return switchModel.allowForSmallInstalls && switchModel.standardTier === "exception";
}

export function matchesPoeType(modelType: PoeType, minimumType: PoeType) {
  return poeRank[modelType] >= poeRank[minimumType];
}

export function canUseFrontFacingException(
  switchModel: SwitchModel,
  filters: SelectorFilters,
) {
  return (
    filters.rearFacingOnly &&
    filters.allowSmallInstallException &&
    isSmallInstallExceptionModel(switchModel)
  );
}

export function getPortOversize(
  switchModel: SwitchModel,
  filters: SelectorFilters,
) {
  return getAvailableCopperPorts(switchModel, filters.includeCoreAggregation) - filters.copperPortsNeeded;
}

export function parseFilters(
  params: URLSearchParams,
  defaults: SelectorFilters,
): SelectorFilters {
  const filters = { ...defaults };

  for (const key of Object.keys(defaults) as Array<keyof SelectorFilters>) {
    const rawValue = params.get(key);

    if (rawValue === null) {
      continue;
    }

    if (booleanKeys.has(key)) {
      filters[key] = (rawValue === "true") as SelectorFilters[typeof key];
      continue;
    }

    if (numberKeys.has(key)) {
      const parsed = Number(rawValue);

      if (Number.isFinite(parsed) && parsed >= 0) {
        filters[key] = parsed as SelectorFilters[typeof key];
      }

      continue;
    }

    if (
      key === "minimumPoeType" &&
      (rawValue === "None" || rawValue === "PoE+" || rawValue === "PoE++")
    ) {
      filters.minimumPoeType = rawValue;
    }
  }

  return filters;
}

export function serializeFilters(filters: SelectorFilters, defaults: SelectorFilters) {
  const params = new URLSearchParams();

  for (const key of Object.keys(filters) as Array<keyof SelectorFilters>) {
    const value = filters[key];
    const defaultValue = defaults[key];

    if (value === defaultValue) {
      continue;
    }

    params.set(key, String(value));
  }

  return params;
}

export function evaluateHardRequirements(
  switchModel: SwitchModel,
  filters: SelectorFilters,
) {
  const reasons: string[] = [];
  const availableCopperPorts = getAvailableCopperPorts(
    switchModel,
    filters.includeCoreAggregation,
  );

  if (!switchModel.approved) {
    reasons.push("Model is not on the approved internal list.");
  }

  if (switchModel.category === "core_aggregation" && !filters.includeCoreAggregation) {
    reasons.push("Core / aggregation models are hidden unless explicitly enabled.");
  }

  if (
    switchModel.category === "access" &&
    getAccessCopperPorts(switchModel) === 16
  ) {
    reasons.push("16-port specialty switches are outside the standard access catalog.");
  }

  if (
    isSmallInstallExceptionModel(switchModel) &&
    !filters.allowSmallInstallException
  ) {
    reasons.push("Small-install exception models are disabled in the current filters.");
  }

  if (availableCopperPorts < filters.copperPortsNeeded) {
    reasons.push(
      `Only ${availableCopperPorts} usable copper ports are available for a ${filters.copperPortsNeeded}-port request.`,
    );
  }

  if (filters.poeRequired && !matchesPoeType(switchModel.poeType, filters.minimumPoeType)) {
    reasons.push(
      `${switchModel.poeType} does not meet the minimum ${filters.minimumPoeType} requirement.`,
    );
  }

  if (
    filters.poeRequired &&
    switchModel.poeBudgetMaxWatts < filters.minimumPoeBudget
  ) {
    reasons.push(
      `Maximum PoE budget of ${switchModel.poeBudgetMaxWatts}W is below the ${filters.minimumPoeBudget}W minimum.`,
    );
  }

  if (switchModel.sfpPlus10G < filters.minimumSfpPlusCount) {
    reasons.push(
      `Provides ${switchModel.sfpPlus10G}x SFP+ uplinks, below the ${filters.minimumSfpPlusCount}x minimum.`,
    );
  }

  if (
    filters.rearFacingOnly &&
    switchModel.orientation === "front-facing" &&
    !canUseFrontFacingException(switchModel, filters)
  ) {
    reasons.push("Front-facing layout conflicts with the current rear-facing-only rule.");
  }

  if (filters.rj45Only && switchModel.connectorStyle !== "RJ45") {
    reasons.push("Connector style is not RJ45, so it is excluded from endpoint access recommendations.");
  }

  return reasons;
}
