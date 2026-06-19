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

    expect(screen.getByLabelText("Price per gram before markup")).toBeTruthy();
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

  it("shows the USD/ILS card between the calculated per-gram cards", async () => {
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

    const usdPerGram = screen.getByLabelText("Price per gram USD");
    const exchangeRate = screen.getByLabelText("USD/ILS exchange rate");
    const nisPerGram = screen.getByLabelText("Price per gram NIS");

    expect(usdPerGram.compareDocumentPosition(exchangeRate) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(exchangeRate.compareDocumentPosition(nisPerGram) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows the update date and time in the silver spot card", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            silverSpotUsd: 64.1,
            usdIlsRate: 3.42,
            updatedAt: "2026-06-19T06:27:30.000Z",
          }),
      }),
    );

    render(<App />);

    const silverSpot = await screen.findByLabelText("Silver spot price");

    expect(silverSpot.textContent).toContain("Updated");
    expect(silverSpot.textContent).toContain(new Date("2026-06-19T06:27:30.000Z").toLocaleString());
  });

  it("renders the BullionVault silver chart area", async () => {
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

    expect(screen.getByLabelText("BullionVault silver chart")).toBeTruthy();
  });
});
