import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchSilverSpotUsd, readBullionVaultSilverSpotUsd, readUsdIlsRate, resetPricingCacheForTest } from "./prices";

const bullionVaultCsv = `"Date",High (kg),Low (kg),Close (kg),,High (troy oz),Low (troy oz),Close (troy oz),
"06:27:30 19-Jun-2026",2060.93,2060.74,2060.74,,64.10,64.10,64.10,
"06:27:15 19-Jun-2026",2061.03,2060.93,2060.93,,64.11,64.10,64.11,`;

describe("readUsdIlsRate", () => {
  it("reads the current Frankfurter v2 rates response", () => {
    expect(readUsdIlsRate([{ date: "2026-06-18", base: "USD", quote: "ILS", rate: 2.933 }])).toBe(2.933);
  });
});

describe("readBullionVaultSilverSpotUsd", () => {
  it("reads the latest troy-ounce close price from BullionVault CSV", () => {
    expect(readBullionVaultSilverSpotUsd(bullionVaultCsv)).toBe(64.1);
  });
});

describe("fetchSilverSpotUsd", () => {
  beforeEach(() => {
    resetPricingCacheForTest();
    vi.restoreAllMocks();
  });

  it("reuses the cached BullionVault price for five minutes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(bullionVaultCsv),
      }),
    );

    const firstPrice = await fetchSilverSpotUsd();
    const secondPrice = await fetchSilverSpotUsd();

    expect(firstPrice).toBe(64.1);
    expect(secondPrice).toBe(64.1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
