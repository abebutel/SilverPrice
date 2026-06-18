import { describe, expect, it } from "vitest";
import { calculateSilverPrices, formatMoney } from "./calculator";

describe("calculateSilverPrices", () => {
  it("calculates kg and per gram prices with markup", () => {
    const result = calculateSilverPrices({
      silverSpotUsd: 30,
      usdIlsRate: 3.7,
      markupPercent: 10,
    });

    expect(result.usdPerKg).toBe(964.5);
    expect(result.usdPerGram).toBe(1.06);
    expect(result.nisPerGram).toBe(3.93);
  });
});

describe("formatMoney", () => {
  it("formats all displayed values to 2 decimals", () => {
    expect(formatMoney(1)).toBe("1.00");
    expect(formatMoney(1.236)).toBe("1.24");
  });
});
