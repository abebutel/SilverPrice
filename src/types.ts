export type PricingData = {
  silverSpotUsd: number;
  usdIlsRate: number;
  updatedAt: string;
  source: "live" | "saved" | "manual";
};
