import type { PricingData } from "../types";

export async function fetchLivePricing(): Promise<PricingData> {
  const response = await fetch("/api/prices");

  if (!response.ok) {
    throw new Error("Unable to load live pricing");
  }

  const data = (await response.json()) as Omit<PricingData, "source">;

  return {
    ...data,
    source: "live",
  };
}
