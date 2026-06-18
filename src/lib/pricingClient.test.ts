import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchLivePricing } from "./pricingClient";

describe("fetchLivePricing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads pricing from the internal API and marks it live", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          silverSpotUsd: 31,
          usdIlsRate: 3.7,
          updatedAt: "2026-06-18T12:00:00Z",
        }),
      }),
    );

    await expect(fetchLivePricing()).resolves.toEqual({
      silverSpotUsd: 31,
      usdIlsRate: 3.7,
      updatedAt: "2026-06-18T12:00:00Z",
      source: "live",
    });
  });

  it("throws when the internal API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    await expect(fetchLivePricing()).rejects.toThrow("Unable to load live pricing");
  });
});
