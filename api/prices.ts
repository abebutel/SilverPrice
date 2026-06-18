import type { VercelRequest, VercelResponse } from "@vercel/node";

type MetalsResponse = {
  rates?: Record<string, number>;
  metals?: Record<string, number>;
  silver?: number;
  price?: number;
};

function readSilverSpotUsd(data: MetalsResponse): number {
  const value =
    data.metals?.silver ??
    data.metals?.Silver ??
    data.rates?.XAG ??
    data.rates?.silver ??
    data.silver ??
    data.price;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Metals API response did not include a silver price");
  }

  return value;
}

async function fetchSilverSpotUsd(): Promise<number> {
  const apiKey = process.env.METALS_API_KEY;

  if (!apiKey) {
    throw new Error("METALS_API_KEY is not configured");
  }

  const response = await fetch(`https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=USD&unit=toz`);

  if (!response.ok) {
    throw new Error(`Metals API returned ${response.status}`);
  }

  const data = (await response.json()) as MetalsResponse;

  return readSilverSpotUsd(data);
}

async function fetchUsdIlsRate(): Promise<number> {
  const response = await fetch("https://api.frankfurter.dev/v2/latest?base=USD&symbols=ILS");

  if (!response.ok) {
    throw new Error(`Frankfurter API returned ${response.status}`);
  }

  const data = (await response.json()) as { rates?: { ILS?: number } };
  const value = data.rates?.ILS;

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
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    response.status(502).json({
      error: error instanceof Error ? error.message : "Unable to load pricing",
    });
  }
}
