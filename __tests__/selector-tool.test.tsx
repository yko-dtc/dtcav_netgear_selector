import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterPanel } from "@/components/filter-panel";
import { SelectorTool } from "@/components/selector-app";
import { SwitchCard } from "@/components/switch-card";
import { switches } from "@/data/switches";
import { defaultFilters, type SelectorDraftErrors, type SelectorDraftFilters } from "@/lib/types";

describe("selector UI", () => {
  const noop = () => {};
  const emptyErrors: SelectorDraftErrors = {};

  function buildDraftFilters(
    overrides: Partial<SelectorDraftFilters> = {},
  ): SelectorDraftFilters {
    return {
      copperPortsNeeded: String(defaultFilters.copperPortsNeeded),
      poeRequired: defaultFilters.poeRequired,
      minimumPoeType: defaultFilters.minimumPoeType,
      minimumPoeBudget: String(defaultFilters.minimumPoeBudget),
      minimumSfpPlusCount: String(defaultFilters.minimumSfpPlusCount),
      ...overrides,
    };
  }

  function EditableFilterPanel() {
    const [draftFilters, setDraftFilters] = useState<SelectorDraftFilters>(
      buildDraftFilters({
        copperPortsNeeded: "",
        minimumPoeType: "",
        minimumPoeBudget: "",
      }),
    );

    return (
      <FilterPanel
        draftFilters={draftFilters}
        errors={emptyErrors}
        onNumberChange={(key, value) =>
          setDraftFilters((current) => ({ ...current, [key]: value }))
        }
        onBooleanChange={(key, value) =>
          setDraftFilters((current) => ({ ...current, [key]: value }))
        }
        onPoeTypeChange={(value) =>
          setDraftFilters((current) => ({ ...current, minimumPoeType: value }))
        }
        onSubmit={noop}
        onReset={() =>
          setDraftFilters(
            buildDraftFilters({
              copperPortsNeeded: "",
              minimumPoeType: "",
              minimumPoeBudget: "",
            }),
          )
        }
      />
    );
  }

  it("shows a prompt before a search has been submitted", () => {
    render(
      <SelectorTool
        draftFilters={buildDraftFilters({
          copperPortsNeeded: "",
          minimumPoeType: "",
          minimumPoeBudget: "",
        })}
        errors={emptyErrors}
        appliedFilters={null}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onSubmit={noop}
        onReset={noop}
      />,
    );

    expect(screen.getByText("Enter the request details to see a recommendation.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find Best Match" })).toBeInTheDocument();
    expect(screen.queryByText("Recommended")).not.toBeInTheDocument();
  });

  it("shows a best match and alternate matches for the default view", () => {
    render(
      <SelectorTool
        draftFilters={buildDraftFilters()}
        errors={emptyErrors}
        appliedFilters={defaultFilters}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onSubmit={noop}
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
        draftFilters={buildDraftFilters({
          copperPortsNeeded: "6",
          minimumPoeBudget: "200",
        })}
        errors={emptyErrors}
        appliedFilters={{
          ...defaultFilters,
          copperPortsNeeded: 6,
          minimumPoeBudget: 200,
          minimumSfpPlusCount: 2,
        }}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onSubmit={noop}
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

  it("lets the copper ports field be cleared and typed into", async () => {
    const user = userEvent.setup();

    render(<EditableFilterPanel />);

    const copperInput = screen.getByLabelText("Copper ports needed");

    await user.type(copperInput, "24");
    expect(copperInput).toHaveValue(24);

    await user.clear(copperInput);
    expect((copperInput as HTMLInputElement).value).toBe("");

    await user.type(copperInput, "48");
    expect(copperInput).toHaveValue(48);
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
        draftFilters={buildDraftFilters()}
        errors={emptyErrors}
        appliedFilters={defaultFilters}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onSubmit={noop}
        onReset={noop}
      />,
    );

    expect(screen.queryByText("Core / aggregation candidates")).not.toBeInTheDocument();
  });

  it("keeps the excluded models list collapsed by default", () => {
    render(
      <SelectorTool
        draftFilters={buildDraftFilters()}
        errors={emptyErrors}
        appliedFilters={defaultFilters}
        onNumberChange={noop}
        onBooleanChange={noop}
        onPoeTypeChange={noop}
        onSubmit={noop}
        onReset={noop}
      />,
    );

    const details = screen.getByText(/Excluded models/i).closest("details");
    expect(details).not.toHaveAttribute("open");
  });
});
