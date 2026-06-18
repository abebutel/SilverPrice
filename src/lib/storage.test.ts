import { beforeEach, describe, expect, it } from "vitest";
import { loadSavedPricing, savePricing } from "./storage";

describe("pricing storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no saved pricing exists", () => {
    expect(loadSavedPricing()).toBeNull();
  });

  it("saves and loads pricing data", () => {
    savePricing({
      silverSpotUsd: 31,
      usdIlsRate: 3.7,
      updatedAt: "2026-06-18T12:00:00Z",
      source: "live",
    });

    expect(loadSavedPricing()).toEqual({
      silverSpotUsd: 31,
      usdIlsRate: 3.7,
      updatedAt: "2026-06-18T12:00:00Z",
      source: "saved",
    });
  });
});
