export type SilverCalculationInput = {
  silverSpotUsd: number;
  usdIlsRate: number;
  markupPercent: number;
};

export type SilverCalculationResult = {
  usdPerKg: number;
  usdPerGramBeforeMarkup: number;
  usdPerGram: number;
  nisPerGram: number;
};

const TROY_OUNCES_PER_KG = 32.15;

export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSilverPrices(input: SilverCalculationInput): SilverCalculationResult {
  const usdPerKg = input.silverSpotUsd * TROY_OUNCES_PER_KG;
  const usdPerGramBeforeMarkup = usdPerKg / 1000;
  const usdPerGram = (usdPerKg * (1 + input.markupPercent / 100)) / 1000;
  const nisPerGram = usdPerGram * input.usdIlsRate;

  return {
    usdPerKg: roundToTwoDecimals(usdPerKg),
    usdPerGramBeforeMarkup: roundToTwoDecimals(usdPerGramBeforeMarkup),
    usdPerGram: roundToTwoDecimals(usdPerGram),
    nisPerGram: roundToTwoDecimals(nisPerGram),
  };
}

export function formatMoney(value: number): string {
  return value.toFixed(2);
}
