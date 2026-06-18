# Silver Price PWA Design

## Goal

Build a free, shareable, phone-friendly web app that displays live silver pricing and USD/ILS exchange data, then calculates marked-up silver prices per gram in USD and NIS.

The app should be easy to open from a shared link and install to a phone home screen as a Progressive Web App.

## Recommended Platform

Use a GitHub repository deployed to Vercel.

Vercel is preferred over GitHub Pages because the silver pricing API will require a free API key. A Vercel server route can call the metals API without exposing that key in the browser. The GitHub repository remains the source of truth and can deploy automatically through Vercel.

## User Interface

The app uses a compact English-only layout designed primarily for phones, while still working on desktop.

The main screen shows:

- Silver spot price in USD per troy ounce.
- USD/ILS exchange rate.
- Silver price per kg in USD.
- Markup selector with quick buttons: 3%, 5%, 7%, 8%, and 10%.
- Custom markup input for any user-entered percentage.
- Final price per gram in USD.
- Final price per gram in NIS.
- Last updated time.

All displayed numbers are rounded to 2 decimals.

## Formulas

Silver kg price in USD:

```text
silverSpotUsdPerTroyOunce * 32.15
```

Marked-up price per gram in USD:

```text
((silverSpotUsdPerTroyOunce * 32.15) * (1 + markupPercent / 100)) / 1000
```

Marked-up price per gram in NIS:

```text
usdPricePerGram * usdIlsExchangeRate
```

## Data Sources

Silver spot pricing should come from a free-key metals API that supports XAG/USD spot pricing. The API key is stored as a Vercel environment variable and used only by a server route.

USD/ILS should come from a no-key exchange-rate API such as Frankfurter.

The app fetches both values through a single internal pricing endpoint where possible, so the front end receives normalized data:

```json
{
  "silverSpotUsd": 31.25,
  "usdIlsRate": 3.65,
  "updatedAt": "2026-06-18T12:00:00Z"
}
```

## Fallback Behavior

If live data loads successfully, the app stores the latest successful silver spot price, USD/ILS rate, and update time locally in the browser.

If live data fails, the app:

- Shows the last saved successful prices if available.
- Clearly marks that the prices are not live.
- Allows manual entry of silver spot USD and USD/ILS rate.
- Recalculates all derived prices from either saved or manually entered values.

If no live or saved prices exist, the app starts in manual-entry mode.

## App Structure

The implementation should use a small web stack suitable for Vercel hosting, such as Vite with React or plain TypeScript. The app does not require user accounts, a database, payments, analytics, or backend storage.

Suggested units:

- Pricing fetcher: calls the server pricing endpoint and handles loading/error states.
- Calculator: contains the pricing formulas and rounding.
- Markup controls: quick buttons and custom percentage input.
- Manual override controls: shown when live data fails or when the user chooses to edit values.
- PWA metadata: manifest and app icons for add-to-home-screen support.

## Testing

Test coverage should focus on formula correctness and fallback behavior:

- kg price calculation.
- USD per gram calculation with markup.
- NIS per gram calculation.
- 2-decimal formatting.
- behavior when live data succeeds.
- behavior when live data fails with saved values.
- behavior when live data fails without saved values.

Manual verification should include phone-width layout and desktop layout.

## Deployment

The app should be pushed to GitHub and connected to Vercel. Required environment variables should be documented in the project README.

Expected environment variable:

```text
METALS_API_KEY
```

The final output should include:

- A working local app.
- A README explaining setup, API key configuration, and deployment.
- A Vercel-ready project.
