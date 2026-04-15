import type { PoeType, SelectorFilters, SwitchModel } from "@/lib/types";

export const poeRank = {
  None: 0,
  "PoE+": 1,
  "PoE++": 2,
} as const;

type BooleanFilterKey = {
  [K in keyof SelectorFilters]: SelectorFilters[K] extends boolean ? K : never;
}[keyof SelectorFilters];

type NumberFilterKey = {
  [K in keyof SelectorFilters]: SelectorFilters[K] extends number ? K : never;
}[keyof SelectorFilters];

const booleanKeys = new Set<BooleanFilterKey>([
  "poeRequired",
]);

const numberKeys = new Set<NumberFilterKey>([
  "copperPortsNeeded",
  "minimumPoeBudget",
  "minimumSfpPlusCount",
]);

function isBooleanFilterKey(key: keyof SelectorFilters): key is BooleanFilterKey {
  return booleanKeys.has(key as BooleanFilterKey);
}

function isNumberFilterKey(key: keyof SelectorFilters): key is NumberFilterKey {
  return numberKeys.has(key as NumberFilterKey);
}

export function getAccessCopperPorts(switchModel: SwitchModel) {
  return switchModel.copper1G + switchModel.copperMultigig;
}

export function getAvailableCopperPorts(
  switchModel: SwitchModel,
) {
  return getAccessCopperPorts(switchModel);
}

export function getPreferredPortClass(copperPortsNeeded: number) {
  if (copperPortsNeeded <= 8) {
    return 8;
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
    filters.copperPortsNeeded <= 8 &&
    isSmallInstallExceptionModel(switchModel)
  );
}

export function getPortOversize(
  switchModel: SwitchModel,
  filters: SelectorFilters,
) {
  return getAvailableCopperPorts(switchModel) - filters.copperPortsNeeded;
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

    if (isBooleanFilterKey(key)) {
      filters[key] = rawValue === "true";
      continue;
    }

    if (isNumberFilterKey(key)) {
      const parsed = Number(rawValue);

      if (Number.isFinite(parsed) && parsed >= 0) {
        filters[key] = parsed;
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
  const availableCopperPorts = getAvailableCopperPorts(switchModel);

  if (!switchModel.approved) {
    reasons.push("Model is not on the approved internal list.");
  }

  if (switchModel.category === "core_aggregation") {
    reasons.push("This streamlined selector only recommends access-layer switches.");
  }

  if (
    switchModel.category === "access" &&
    getAccessCopperPorts(switchModel) === 16
  ) {
    reasons.push("16-port specialty switches are outside the standard access catalog.");
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
    switchModel.category === "access" &&
    switchModel.orientation === "front-facing" &&
    !canUseFrontFacingException(switchModel, filters)
  ) {
    reasons.push("Front-facing layouts are limited to the approved compact small-room exception.");
  }

  if (switchModel.connectorStyle !== "RJ45") {
    reasons.push("Connector style is not RJ45, so it is excluded from endpoint access recommendations.");
  }

  return reasons;
}
