# Silver Price PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a free, shareable phone-friendly PWA that displays live silver spot, USD/ILS, kg price, and marked-up per-gram prices.

**Architecture:** Use a Vite React TypeScript frontend deployed to Vercel. Browser code calls one Vercel API route that hides the metals API key, normalizes silver and USD/ILS values, and returns a compact pricing payload.

**Tech Stack:** Vite, React, TypeScript, Vitest, Vercel serverless function, browser localStorage, CSS.

---

## File Map

- `package.json`: npm scripts and dependencies.
- `index.html`: root HTML entry.
- `src/main.tsx`: React mount point.
- `src/App.tsx`: screen composition and app state.
- `src/styles.css`: responsive app styling.
- `src/lib/calculator.ts`: silver formulas, rounding, and formatting.
- `src/lib/storage.ts`: last successful pricing persistence.
- `src/lib/pricingClient.ts`: browser fetch wrapper for `/api/prices`.
- `src/types.ts`: shared browser-facing pricing types.
- `api/prices.ts`: Vercel serverless pricing endpoint.
- `public/manifest.webmanifest`: PWA metadata.
- `public/icon.svg`: simple app icon.
- `src/lib/calculator.test.ts`: formula tests.
- `src/lib/storage.test.ts`: fallback persistence tests.
- `README.md`: setup, API key, local run, and deployment instructions.

### Task 1: Scaffold App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/types.ts`

- [ ] **Step 1: Create package manifest**

```json
{
  "name": "silver-price-pwa",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "typescript": "^5.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create HTML shell**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#101820" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <title>Silver Price</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Add initial React entry**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 4: Add shared types**

```ts
export type PricingData = {
  silverSpotUsd: number;
  usdIlsRate: number;
  updatedAt: string;
  source: "live" | "saved" | "manual";
};
```

- [ ] **Step 5: Add temporary app**

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>Silver Price</h1>
      <p>Live silver and shekel calculator.</p>
    </main>
  );
}
```

- [ ] **Step 6: Add base styles**

```css
:root {
  color: #172026;
  background: #f4f1ea;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}
```

- [ ] **Step 7: Install dependencies and verify scaffold**

Run: `npm install`

Run: `npm run build`

Expected: build completes and creates `dist/`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json index.html src
git commit -m "feat: scaffold silver price app"
```

### Task 2: Calculator

**Files:**
- Create: `src/lib/calculator.ts`
- Create: `src/lib/calculator.test.ts`

- [ ] **Step 1: Write formula tests**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/calculator.test.ts`

Expected: fails because `src/lib/calculator.ts` does not exist.

- [ ] **Step 3: Implement calculator**

```ts
export type SilverCalculationInput = {
  silverSpotUsd: number;
  usdIlsRate: number;
  markupPercent: number;
};

export type SilverCalculationResult = {
  usdPerKg: number;
  usdPerGram: number;
  nisPerGram: number;
};

const TROY_OUNCES_PER_KG = 32.15;

export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSilverPrices(input: SilverCalculationInput): SilverCalculationResult {
  const usdPerKg = input.silverSpotUsd * TROY_OUNCES_PER_KG;
  const usdPerGram = (usdPerKg * (1 + input.markupPercent / 100)) / 1000;
  const nisPerGram = usdPerGram * input.usdIlsRate;

  return {
    usdPerKg: roundToTwoDecimals(usdPerKg),
    usdPerGram: roundToTwoDecimals(usdPerGram),
    nisPerGram: roundToTwoDecimals(nisPerGram),
  };
}

export function formatMoney(value: number): string {
  return value.toFixed(2);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/lib/calculator.test.ts`

Expected: tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculator.ts src/lib/calculator.test.ts
git commit -m "feat: add silver price calculator"
```

### Task 3: Pricing Endpoint

**Files:**
- Create: `api/prices.ts`
- Create: `.env.example`

- [ ] **Step 1: Add environment example**

```text
METALS_API_KEY=replace-with-your-metals-api-key
```

- [ ] **Step 2: Implement pricing endpoint**

```ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

type MetalsResponse = {
  rates?: Record<string, number>;
  metals?: Record<string, number>;
  silver?: number;
  price?: number;
};

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
  const value = data.metals?.silver ?? data.rates?.XAG ?? data.silver ?? data.price;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Metals API response did not include a silver price");
  }

  return value;
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
```

- [ ] **Step 3: Add Vercel node type dependency**

Run: `npm install -D @vercel/node`

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: TypeScript build passes.

- [ ] **Step 5: Commit**

```bash
git add api/prices.ts .env.example package.json package-lock.json
git commit -m "feat: add pricing api route"
```

### Task 4: Browser Data and Fallback Storage

**Files:**
- Create: `src/lib/pricingClient.ts`
- Create: `src/lib/storage.ts`
- Create: `src/lib/storage.test.ts`

- [ ] **Step 1: Implement pricing client**

```ts
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
```

- [ ] **Step 2: Write storage tests**

```ts
import { describe, expect, it, beforeEach } from "vitest";
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
```

- [ ] **Step 3: Implement storage**

```ts
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
```

- [ ] **Step 4: Run storage tests**

Run: `npm test -- src/lib/storage.test.ts --environment jsdom`

Expected: tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pricingClient.ts src/lib/storage.ts src/lib/storage.test.ts package.json package-lock.json
git commit -m "feat: add pricing fallback storage"
```

### Task 5: Full App UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Replace app with calculator UI**

```tsx
import { useEffect, useMemo, useState } from "react";
import { calculateSilverPrices, formatMoney } from "./lib/calculator";
import { fetchLivePricing } from "./lib/pricingClient";
import { loadSavedPricing, savePricing } from "./lib/storage";
import type { PricingData } from "./types";

const QUICK_MARKUPS = [3, 5, 7, 8, 10];

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
        setManualSilver(String(livePricing.silverSpotUsd));
        setManualRate(String(livePricing.usdIlsRate));
        setStatus("Live prices");
      })
      .catch(() => {
        const savedPricing = loadSavedPricing();
        if (savedPricing) {
          setPricing(savedPricing);
          setManualSilver(String(savedPricing.silverSpotUsd));
          setManualRate(String(savedPricing.usdIlsRate));
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
      return {
        silverSpotUsd,
        usdIlsRate,
        updatedAt: pricing?.updatedAt ?? new Date().toISOString(),
        source: pricing?.source ?? "manual",
      };
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
        <article>
          <span>Silver spot</span>
          <strong>{activePricing ? `$${formatMoney(activePricing.silverSpotUsd)}` : "--"}</strong>
          <small>per troy ounce</small>
        </article>
        <article>
          <span>USD/ILS</span>
          <strong>{activePricing ? formatMoney(activePricing.usdIlsRate) : "--"}</strong>
          <small>exchange rate</small>
        </article>
        <article>
          <span>Silver kg</span>
          <strong>{calculated ? `$${formatMoney(calculated.usdPerKg)}` : "--"}</strong>
          <small>USD</small>
        </article>
      </section>

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

      <section className="manual" aria-label="Manual pricing">
        <label>
          Silver spot USD
          <input inputMode="decimal" onChange={(event) => setManualSilver(event.target.value)} type="number" value={manualSilver} />
        </label>
        <label>
          USD/ILS rate
          <input inputMode="decimal" onChange={(event) => setManualRate(event.target.value)} type="number" value={manualRate} />
        </label>
      </section>

      <section className="result" aria-label="Calculated prices">
        <article>
          <span>Price per gram</span>
          <strong>{calculated ? `$${formatMoney(calculated.usdPerGram)}` : "--"}</strong>
          <small>USD</small>
        </article>
        <article>
          <span>Price per gram</span>
          <strong>{calculated ? `₪${formatMoney(calculated.nisPerGram)}` : "--"}</strong>
          <small>NIS</small>
        </article>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Replace styles**

```css
:root {
  color: #172026;
  background: #f4f1ea;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input {
  font: inherit;
}

.app-shell {
  display: grid;
  gap: 18px;
  margin: 0 auto;
  max-width: 760px;
  min-height: 100vh;
  padding: 22px;
}

.summary h1 {
  font-size: 38px;
  line-height: 1;
  margin: 0 0 8px;
}

.eyebrow,
.timestamp,
small,
span {
  color: #5a6468;
}

.eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.timestamp {
  margin: 0;
}

.metrics,
.result {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

article,
.controls,
.manual {
  background: #ffffff;
  border: 1px solid #d7d2c9;
  border-radius: 8px;
  padding: 16px;
}

article {
  display: grid;
  gap: 6px;
}

strong {
  color: #101820;
  font-size: 28px;
  line-height: 1.1;
}

.controls,
.manual {
  display: grid;
  gap: 12px;
}

.button-row {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

button {
  background: #e9ece6;
  border: 1px solid #c8cec4;
  border-radius: 8px;
  color: #172026;
  min-height: 44px;
}

button.active {
  background: #101820;
  color: #ffffff;
}

label {
  display: grid;
  gap: 7px;
  font-weight: 700;
}

input {
  border: 1px solid #bcc3bf;
  border-radius: 8px;
  min-height: 44px;
  padding: 10px 12px;
  width: 100%;
}

.manual {
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

@media (max-width: 420px) {
  .app-shell {
    padding: 18px;
  }

  .button-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

- [ ] **Step 3: Run tests and build**

Run: `npm test`

Expected: tests pass.

Run: `npm run build`

Expected: build passes.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: build silver calculator interface"
```

### Task 6: PWA and Documentation

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/icon.svg`
- Create: `README.md`

- [ ] **Step 1: Add PWA manifest**

```json
{
  "name": "Silver Price",
  "short_name": "Silver",
  "description": "Silver price and shekel calculator",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f4f1ea",
  "theme_color": "#101820",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: Add SVG icon**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#101820"/>
  <circle cx="256" cy="256" r="150" fill="#d7d2c9"/>
  <text x="256" y="286" text-anchor="middle" font-family="Arial, sans-serif" font-size="132" font-weight="700" fill="#101820">Ag</text>
</svg>
```

- [ ] **Step 3: Add README**

```md
# Silver Price

A phone-friendly silver price calculator that shows:

- silver spot price in USD per troy ounce
- USD/ILS exchange rate
- silver price per kg in USD
- marked-up price per gram in USD and NIS

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```text
METALS_API_KEY=your_key_here
```

Run locally:

```bash
npm run dev
```

## API Key

Create a free Metals.Dev account and copy your API key. Add it to `.env.local` for local development and to Vercel as `METALS_API_KEY` for production.

USD/ILS exchange rates use Frankfurter and do not require an API key.

## Deploy

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Add the `METALS_API_KEY` environment variable in Vercel.
4. Deploy.
```

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: build passes.

- [ ] **Step 5: Commit**

```bash
git add public README.md
git commit -m "docs: add pwa setup and deployment notes"
```

### Task 7: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run full test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: build passes.

- [ ] **Step 3: Start local app**

Run: `npm run dev`

Expected: Vite prints a local URL.

- [ ] **Step 4: Verify layout manually**

Open the local URL on desktop and phone-width viewport. Confirm:

- live/saved/manual status is visible.
- silver spot, USD/ILS, kg USD, USD/gram, and NIS/gram all display.
- quick markup buttons update the output.
- custom markup input updates the output.
- manual silver and rate inputs update the output.
- no text overlaps on phone width.

- [ ] **Step 5: Commit final verification notes if README changed**

Only commit if verification requires README updates.
