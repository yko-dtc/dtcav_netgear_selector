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

    expect(screen.getByText("Recommended")).toBeInTheDocument();
    expect(screen.getByText("M4350-24G4XF")).toBeInTheDocument();
    expect(screen.getByText("Other approved fits")).toBeInTheDocument();
    expect(screen.getAllByText("Suitable fit").length).toBeGreaterThan(0);
  });

  it("surfaces the 8-port exception when the filters allow it", () => {
    render(
      <SelectorTool
        filters={{
          ...defaultFilters,
          copperPortsNeeded: 6,
          minimumPoeBudget: 200,
          minimumSfpPlusCount: 2,
        }}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onReset={noop}
      />,
    );

    const recommendationSection = screen
      .getByText("Recommended")
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
        matchReasons={["8 copper ports for 6 needed"]}
        watchOuts={[]}
        isSuitable
      />,
    );

    fireEvent.error(screen.getByAltText("M4250-8G2XF-PoE+"));
    expect(screen.getByText("Image coming soon")).toBeInTheDocument();
  });

  it("opens a modal when a switch card is clicked", () => {
    render(
      <SwitchCard
        model={switches[0]}
        matchReasons={["8 copper ports for 6 needed", "PoE+ meets the required PoE type"]}
        watchOuts={["Front-facing exception for compact rooms."]}
        summary="Recommended: M4250-8G2XF-PoE+ because it fits compact rooms."
        isSuitable
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /View details for M4250-8G2XF-PoE\+/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(screen.getByText("Watch-outs")).toBeInTheDocument();
    expect(within(dialog).getByText("PoE+ meets the required PoE type")).toBeInTheDocument();
  });

  it("does not show a core / aggregation section in the streamlined selector", () => {
    render(
      <SelectorTool
        filters={defaultFilters}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onReset={noop}
      />,
    );

    expect(screen.queryByText("Core / aggregation candidates")).not.toBeInTheDocument();
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
