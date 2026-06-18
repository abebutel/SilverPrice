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
