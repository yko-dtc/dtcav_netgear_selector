import { fireEvent, render, screen, within } from "@testing-library/react";
import { SelectorTool } from "@/components/selector-app";
import { SwitchCard } from "@/components/switch-card";
import { switches } from "@/data/switches";
import { defaultFilters } from "@/lib/types";

describe("selector UI", () => {
  const noop = () => {};

  it("shows a best match and alternate matches for the default view", () => {
    render(
      <SelectorTool
        filters={defaultFilters}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onReset={noop}
      />,
    );

    expect(screen.getByText("Recommended switch")).toBeInTheDocument();
    expect(screen.getByText("M4350-24G4XF")).toBeInTheDocument();
    expect(screen.getByText("Alternate approved matches")).toBeInTheDocument();
  });

  it("surfaces the 8-port exception when the filters allow it", () => {
    render(
      <SelectorTool
        filters={{
          ...defaultFilters,
          copperPortsNeeded: 6,
          minimumPoeBudget: 200,
          minimumSfpPlusCount: 2,
          allowSmallInstallException: true,
        }}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onReset={noop}
      />,
    );

    const recommendationSection = screen
      .getByText("Recommended switch")
      .closest("section");

    expect(recommendationSection).not.toBeNull();
    expect(
      within(recommendationSection as HTMLElement).getByText("M4250-8G2XF-PoE+"),
    ).toBeInTheDocument();
  });

  it("renders the image placeholder when an image fails to load", () => {
    render(
      <SwitchCard
        model={switches[0]}
        matchReasons={["Approved for compact installs."]}
        watchOuts={[]}
      />,
    );

    fireEvent.error(screen.getByAltText("M4250-8G2XF-PoE+"));
    expect(screen.getByText("Image coming soon")).toBeInTheDocument();
  });

  it("keeps core / aggregation matches in a separate section", () => {
    render(
      <SelectorTool
        filters={{
          ...defaultFilters,
          includeCoreAggregation: true,
          copperPortsNeeded: 24,
          minimumPoeBudget: 300,
          minimumSfpPlusCount: 4,
        }}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onReset={noop}
      />,
    );

    expect(screen.getByText("Core / aggregation candidates")).toBeInTheDocument();
    expect(screen.getByText("M4350-24X4V")).toBeInTheDocument();
  });

  it("keeps the excluded models list collapsed by default", () => {
    render(
      <SelectorTool
        filters={defaultFilters}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onReset={noop}
      />,
    );

    const details = screen.getByText(/Excluded models/i).closest("details");
    expect(details).not.toHaveAttribute("open");
  });
});
