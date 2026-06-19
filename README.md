# Silver Price

A phone-friendly silver price calculator that shows:

- silver spot price in USD per troy ounce
- USD/ILS exchange rate
- silver price per kg in USD
- marked-up price per gram in USD and NIS
- an embedded BullionVault silver chart

## Setup

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

## Data Sources

Silver spot pricing uses BullionVault's chart CSV feed through the server route. The server caches the silver spot value for five minutes.

USD/ILS exchange rates use Frankfurter. No API key is required.

## Deploy

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Deploy.
