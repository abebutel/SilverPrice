import type { VercelRequest, VercelResponse } from "@vercel/node";

type FrankfurterV1Response = {
  rates?: {
    ILS?: number;
  };
};

type FrankfurterV2Rate = {
  base?: string;
  quote?: string;
  rate?: number;
};

type CachedSilverSpot = {
  price: number;
  updatedAt: string;
  expiresAt: number;
};

const BULLIONVAULT_SILVER_CSV_URL = "https://chart-data.bullionvault.com/prices/CSV/AGX/USD/120/Full";
const SILVER_SPOT_CACHE_MS = 5 * 60 * 1000;

let cachedSilverSpot: CachedSilverSpot | null = null;

export function readBullionVaultSilverSpotUsd(csv: string): number {
  const latestDataLine = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith('"') && !line.startsWith('"Date"'));

  if (!latestDataLine) {
    throw new Error("BullionVault CSV did not include a silver price row");
  }

  const columns = latestDataLine.split(",");
  const value = Number(columns[7]);

  if (!Number.isFinite(value)) {
    throw new Error("BullionVault CSV did not include a valid troy-ounce close price");
  }

  return value;
}

export function resetPricingCacheForTest(): void {
  cachedSilverSpot = null;
}

export async function fetchSilverSpotUsd(): Promise<number> {
  const now = Date.now();

  if (cachedSilverSpot && cachedSilverSpot.expiresAt > now) {
    return cachedSilverSpot.price;
  }

  const response = await fetch(BULLIONVAULT_SILVER_CSV_URL);

  if (!response.ok) {
    throw new Error(`BullionVault chart CSV returned ${response.status}`);
  }

  const csv = await response.text();
  const price = readBullionVaultSilverSpotUsd(csv);

  cachedSilverSpot = {
    price,
    updatedAt: new Date().toISOString(),
    expiresAt: now + SILVER_SPOT_CACHE_MS,
  };

  return price;
}

async function fetchUsdIlsRate(): Promise<number> {
  const response = await fetch("https://api.frankfurter.dev/v2/rates?base=USD&quotes=ILS");

  if (!response.ok) {
    throw new Error(`Frankfurter API returned ${response.status}`);
  }

  const data = (await response.json()) as unknown;

  return readUsdIlsRate(data);
}

export function readUsdIlsRate(data: unknown): number {
  const value = Array.isArray(data)
    ? (data as FrankfurterV2Rate[]).find((rate) => rate.base === "USD" && rate.quote === "ILS")?.rate
    : (data as FrankfurterV1Response).rates?.ILS;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Frankfurter response did not include USD/ILS");
  }

  return value;
}

export default async function handler(_request: VercelRequest, response: VercelResponse) {
  try {
    const [silverSpotUsd, usdIlsRate] = await Promise.all([fetchSilverSpotUsd(), fetchUsdIlsRate()]);

    response.status(200).json({
      silverSpotUsd,
      usdIlsRate,
      updatedAt: cachedSilverSpot?.updatedAt ?? new Date().toISOString(),
    });
  } catch (error) {
    response.status(502).json({
      error: error instanceof Error ? error.message : "Unable to load pricing",
    });
  }
}
