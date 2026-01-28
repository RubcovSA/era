## Deadline Compliance Mini Tracker

Client-side Vue 3 app that watches Form 470 filings, highlights 28-day windows, and keeps your saved RFPs and filters in `localStorage`. No backend required.

### Getting started

```bash
cd app/Deadline-Compliance-Mini-Tracker
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

### Notes

- Data comes directly from `https://opendata.usac.org/resource/jt8s-3q52.json`.
- Optional: set `VITE_USAC_APP_TOKEN` in a `.env` file if you have a Socrata token for higher rate limits.
