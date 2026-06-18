import type { PricingData } from "../types";

const STORAGE_KEY = "silver-price:last-pricing";

export function savePricing(pricing: PricingData): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      silverSpotUsd: pricing.silverSpotUsd,
      usdIlsRate: pricing.usdIlsRate,
      updatedAt: pricing.updatedAt,
    }),
  );
}

export function loadSavedPricing(): PricingData | null {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Omit<PricingData, "source">;

    if (
      typeof parsed.silverSpotUsd !== "number" ||
      typeof parsed.usdIlsRate !== "number" ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }

    return {
      ...parsed,
      source: "saved",
    };
  } catch {
    return null;
  }
}
