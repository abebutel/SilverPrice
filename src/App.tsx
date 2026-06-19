import { useEffect, useMemo, useState } from "react";
import { BullionVaultChart } from "./BullionVaultChart";
import { calculateSilverPrices, formatMoney } from "./lib/calculator";
import { fetchLivePricing } from "./lib/pricingClient";
import { loadSavedPricing, savePricing } from "./lib/storage";
import type { PricingData } from "./types";

const QUICK_MARKUPS = [3, 5, 7, 8, 10];

function createManualPricing(silverSpotUsd: number, usdIlsRate: number, existingPricing: PricingData | null): PricingData {
  return {
    silverSpotUsd,
    usdIlsRate,
    updatedAt: existingPricing?.updatedAt ?? new Date().toISOString(),
    source: existingPricing?.source ?? "manual",
  };
}

export default function App() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [status, setStatus] = useState("Loading live prices");
  const [markupPercent, setMarkupPercent] = useState(5);
  const [manualSilver, setManualSilver] = useState("");
  const [manualRate, setManualRate] = useState("");

  useEffect(() => {
    fetchLivePricing()
      .then((livePricing) => {
        setPricing(livePricing);
        savePricing(livePricing);
        setManualSilver(formatMoney(livePricing.silverSpotUsd));
        setManualRate(formatMoney(livePricing.usdIlsRate));
        setStatus("Live prices");
      })
      .catch(() => {
        const savedPricing = loadSavedPricing();

        if (savedPricing) {
          setPricing(savedPricing);
          setManualSilver(formatMoney(savedPricing.silverSpotUsd));
          setManualRate(formatMoney(savedPricing.usdIlsRate));
          setStatus("Using saved prices");
          return;
        }

        setStatus("Enter prices manually");
      });
  }, []);

  const activePricing = useMemo<PricingData | null>(() => {
    const silverSpotUsd = Number(manualSilver);
    const usdIlsRate = Number(manualRate);

    if (Number.isFinite(silverSpotUsd) && silverSpotUsd > 0 && Number.isFinite(usdIlsRate) && usdIlsRate > 0) {
      return createManualPricing(silverSpotUsd, usdIlsRate, pricing);
    }

    return pricing;
  }, [manualRate, manualSilver, pricing]);

  const calculated = activePricing
    ? calculateSilverPrices({
        silverSpotUsd: activePricing.silverSpotUsd,
        usdIlsRate: activePricing.usdIlsRate,
        markupPercent,
      })
    : null;

  return (
    <main className="app-shell">
      <section className="summary">
        <p className="eyebrow">{status}</p>
        <h1>Silver Price</h1>
        <p className="timestamp">
          {activePricing ? `Last updated ${new Date(activePricing.updatedAt).toLocaleString()}` : "Waiting for prices"}
        </p>
      </section>

      <section className="metrics" aria-label="Current rates">
        <article aria-label="Silver spot price">
          <span>Silver spot</span>
          <strong>{activePricing ? `$${formatMoney(activePricing.silverSpotUsd)}` : "--"}</strong>
          <small>per troy ounce</small>
          {activePricing ? (
            <small className="metric-time">Updated {new Date(activePricing.updatedAt).toLocaleString()}</small>
          ) : null}
        </article>
        <article>
          <span>USD/ILS</span>
          <strong>{activePricing ? formatMoney(activePricing.usdIlsRate) : "--"}</strong>
          <small>exchange rate</small>
        </article>
        <article>
          <span>Silver g</span>
          <strong>{calculated ? `$${formatMoney(calculated.usdPerGramBeforeMarkup)}` : "--"}</strong>
          <small>USD</small>
        </article>
      </section>

      <BullionVaultChart />

      <section className="controls" aria-label="Markup controls">
        <label htmlFor="markup">Markup percentage</label>
        <div className="button-row">
          {QUICK_MARKUPS.map((value) => (
            <button
              className={markupPercent === value ? "active" : ""}
              key={value}
              onClick={() => setMarkupPercent(value)}
              type="button"
            >
              {value}%
            </button>
          ))}
        </div>
        <input
          id="markup"
          inputMode="decimal"
          min="0"
          onChange={(event) => setMarkupPercent(Number(event.target.value))}
          type="number"
          value={markupPercent}
        />
      </section>

      <section className="result" aria-label="Calculated prices">
        <article>
          <span>Price per gram</span>
          <strong>{calculated ? `$${formatMoney(calculated.usdPerGram)}` : "--"}</strong>
          <small>USD</small>
        </article>
        <article>
          <span>Price per gram</span>
          <strong>{calculated ? `NIS ${formatMoney(calculated.nisPerGram)}` : "--"}</strong>
          <small>NIS</small>
        </article>
      </section>

      <section className="manual" aria-label="Manual pricing">
        <label>
          Silver spot USD
          <input
            inputMode="decimal"
            onChange={(event) => setManualSilver(event.target.value)}
            step="0.01"
            type="number"
            value={manualSilver}
          />
        </label>
        <label>
          USD/ILS rate
          <input
            inputMode="decimal"
            onChange={(event) => setManualRate(event.target.value)}
            step="0.01"
            type="number"
            value={manualRate}
          />
        </label>
      </section>
    </main>
  );
}
