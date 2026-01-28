RFP Radar – FCC Form 470 Opportunity Scanner
============================================

Problem
-------

Regional E-rate service provider leaders live in “Form 470 FOMO”: they manually check USAC and state portals twice a day, worried they will miss a good RFP in their territory. The process is noisy, fragmented, and hard to prioritize, especially during the annual “E-rate hell” rush.

This prototype gives them a single, filterable view of Form 470 postings so they can quickly see “what’s out there” without combing through raw downloads.

What this prototype does
------------------------

- Lets a user:
  - choose a state,
  - pick a funding year,
  - optionally search by district/narrative keywords, and
  - focus on “currently open” RFPs.
- Calls USAC’s public Open Data API for FCC Form 470 (dataset ID to be configured in `src/api/usac.ts`) and normalizes the results.
- Shows:
  - a table of Form 470 opportunities with applicant, state, posting date, due/ACD, category, and RFP link (when available);
  - simple urgency badges for deadlines (closed / days left); and
  - a small “posting volume by month” chart so the user can feel how noisy their current window is.

Assumptions
-----------

- The ICP is the **E-rate service provider decision-maker** (regional sales director/owner).
- We assume USAC’s Form 470 dataset:
  - is exposed via `https://opendata.usac.org/resource/<DATASET>.json`,
  - includes applicant name, state, funding year, posting and due dates, category, and an RFP or Form 470 URL.
- The browser is allowed to call the Open Data API directly (no auth), and CORS is correctly configured by USAC.

Tradeoffs and intentional omissions
-----------------------------------

- **Not built**:
  - authentication, saved views, user accounts, or org separation;
  - real-time alerts/notifications;
  - deep prioritization scoring, win-rate analytics, or CRM-style pipeline features;
  - post-award tracking (Forms 471/486/invoicing).
- Filters are intentionally minimal (state, funding year, simple text search, open-only).
- Pagination is capped client-side to a `$limit` of 200 records per query to keep UX snappy.
- Dataset ID and field names in `src/api/usac.ts` are configurable – this prototype focuses on UX and flow rather than pinning to a specific schema.

How to run locally
------------------

```bash
cd app/rfp-radar
npm install
npm run dev
```

Then open `http://localhost:5173/` in a browser.

Next steps with more time
-------------------------

- Wire in the exact USAC Form 470 dataset ID and refine the SoQL queries (funding-year specific fields, better “open” logic).
- Add richer prioritization signals for each RFP (C2 budget left, previous vendor, upgrade recency).
- Allow saving “territory presets” (e.g., “My Florida C2 fiber patch”) and export to CSV/CRM.
- Layer in a second view that plots opportunity volume and aging by account manager or SPIN.

