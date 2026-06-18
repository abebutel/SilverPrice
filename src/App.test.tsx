import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("lets the user calculate manual prices when live pricing is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Enter prices manually")).toBeTruthy();
    });

    await user.type(screen.getByLabelText("Silver spot USD"), "30");
    await user.type(screen.getByLabelText("USD/ILS rate"), "3.7");
    await user.click(screen.getByRole("button", { name: "10%" }));

    expect(screen.getByText("Silver g")).toBeTruthy();
    expect(screen.getByText("$0.96")).toBeTruthy();
    expect(screen.getByText("$1.06")).toBeTruthy();
    expect(screen.getByText("NIS 3.93")).toBeTruthy();
  });

  it("shows calculated per-gram cards before manual price inputs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Enter prices manually")).toBeTruthy();
    });

    const calculatedPrices = screen.getByLabelText("Calculated prices");
    const manualPricing = screen.getByLabelText("Manual pricing");

    expect(calculatedPrices.compareDocumentPosition(manualPricing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
