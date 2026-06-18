import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

    expect(screen.getByText("$964.50")).toBeTruthy();
    expect(screen.getByText("$1.06")).toBeTruthy();
    expect(screen.getByText("NIS 3.93")).toBeTruthy();
  });
});
