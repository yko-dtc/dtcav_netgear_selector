import { switches } from "@/data/switches";
import { evaluateHardRequirements, matchesPoeType } from "@/lib/filters";
import { rankSwitches } from "@/lib/ranking";
import { defaultFilters } from "@/lib/types";

describe("ranking helpers", () => {
  it("applies the PoE rank order correctly", () => {
    expect(matchesPoeType("PoE++", "PoE+")).toBe(true);
    expect(matchesPoeType("PoE+", "PoE++")).toBe(false);
    expect(matchesPoeType("None", "None")).toBe(true);
  });

  it("prefers M4350-24G4XF for the default 24-port request", () => {
    const results = rankSwitches(switches, defaultFilters);

    expect(results.recommended[0]?.switch.model).toBe("M4350-24G4XF");
    expect(results.alternates.length).toBeGreaterThan(0);
  });

  it("uses a 24-port access switch for 1-8 port requests when the exception is disabled", () => {
    const results = rankSwitches(switches, {
      ...defaultFilters,
      copperPortsNeeded: 6,
      minimumPoeBudget: 200,
      minimumSfpPlusCount: 2,
    });

    expect(results.recommended[0]?.switch.model).toBe("M4350-24G4XF");
  });

  it("promotes the approved 8-port exception when allowed and sized correctly", () => {
    const results = rankSwitches(switches, {
      ...defaultFilters,
      copperPortsNeeded: 6,
      minimumPoeBudget: 200,
      minimumSfpPlusCount: 2,
      allowSmallInstallException: true,
    });

    expect(results.recommended[0]?.switch.model).toBe("M4250-8G2XF-PoE+");
  });

  it("recommends a 48-port class model for larger access requests", () => {
    const results = rankSwitches(switches, {
      ...defaultFilters,
      copperPortsNeeded: 32,
    });

    expect(results.recommended[0]?.switch.model).toBe("M4250-40G8XF-PoE+");
  });

  it("promotes the PoE++ access model when PoE++ is required", () => {
    const results = rankSwitches(switches, {
      ...defaultFilters,
      copperPortsNeeded: 32,
      minimumPoeType: "PoE++",
      minimumPoeBudget: 700,
    });

    expect(results.recommended[0]?.switch.model).toBe("M4250-40G8XF-PoE++");
  });

  it("records an SFP+ shortfall as a hard exclusion", () => {
    const smallException = switches.find(
      (switchModel) => switchModel.model === "M4250-8G2XF-PoE+",
    );

    expect(smallException).toBeDefined();
    expect(
      evaluateHardRequirements(smallException!, {
        ...defaultFilters,
        allowSmallInstallException: true,
      }),
    ).toContain("Provides 2x SFP+ uplinks, below the 4x minimum.");
  });

  it("excludes QSFP-only core hardware when RJ45-only is enabled", () => {
    const coreSwitch = switches.find((switchModel) => switchModel.model === "M4500-32C");

    expect(coreSwitch).toBeDefined();
    expect(evaluateHardRequirements(coreSwitch!, defaultFilters)).toContain(
      "Connector style is not RJ45, so it is excluded from endpoint access recommendations.",
    );
  });

  it("keeps core hardware out of results unless core / aggregation is enabled", () => {
    const coreSwitch = switches.find((switchModel) => switchModel.model === "M4350-24X4V");

    expect(coreSwitch).toBeDefined();
    expect(evaluateHardRequirements(coreSwitch!, defaultFilters)).toContain(
      "Core / aggregation models are hidden unless explicitly enabled.",
    );
  });
});

