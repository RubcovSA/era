## Form 470 RFP Tracker

Client-side Vue 3 SPA that pulls Form 470 filings from USAC open data, lets you filter by state/year/category, search, and save a local watchlist (stored in `localStorage`).

### Getting started

```bash
cd app/find-and-track-470
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

### Notes

- Data comes directly from `https://opendata.usac.org/resource/jt8s-3q52.json`.
- Optional: set `VITE_USAC_APP_TOKEN` in a `.env` file if you have a Socrata token for higher rate limits.
