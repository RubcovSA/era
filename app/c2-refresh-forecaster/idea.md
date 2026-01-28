# C2 Refresh Forecaster (Vue + vendor lifecycle enrichment)

## Problem / Pain to solve
- Reps struggle to prioritize which districts are ripe for upgrade because generic tools don’t show refresh cycles. They waste time on long shots and miss accounts nearing end-of-life gear or unused C2 budget.

## Who it’s for
- Vendor-side sales directors and SEs planning territory plays for the next bid season; consultants advising multiple resellers on where to hunt next.

## Data sources (E-rate required)
- USAC Form 471 purchase history (FRNs, amounts, line items) to infer gear age and spend.
- C2 budget data by entity to calculate remaining budget vs historical drawdown.
- Form 470 dates to spot districts that have not posted recently (potential refresh gap).

## External APIs to use
- Vendor lifecycle/EoX APIs (e.g., Cisco EoX, Aruba EoS feeds) or open product lifecycle datasets to tag line items with end-of-support dates.
- Mapbox (or Leaflet + OpenStreetMap tiles) for a territory heatmap.
- Optional: Crunchbase or Clearbit enrichment to size district/org (staff, sites) for weighting.

## What the Vue app does
- Territory heatmap showing districts color-coded by “Refresh Likelihood” score (time since last C2 purchase, EoX proximity, remaining C2 budget).
- Drill-down card per district with: last funded year, vendors/models seen, projected refresh window, remaining C2 dollars, and link to latest 470 if present.
- Export prioritized list (CSV) for reps with rep-assigned territories.
- “Build a play” quick filter: e.g., “show me districts with Cisco gear hitting EoX within 12 months AND >$50k C2 left.”

## Key Vue screens / flow
1) Map view: heatmap + filters (state, vendor, discount rate, C2 balance, last upgrade year).
2) List view: sortable table with “Refresh Likelihood,” “EoX soon,” “C2 left,” and last 470 date.
3) Detail drawer: EoX timeline, suggested outreach window, and button to export/send to rep.
4) Export/share: CSV download plus optional Slack/Teams webhook with top N targets for a territory.

## Why this fits the 6–8h build
- Data transforms are straightforward (time deltas + simple scoring). Map and table can share the same dataset. Lifecycle enrichment can be a stubbed fetch for a handful of common SKUs.

## Validation scenarios
- District with no 471 history in 5+ years: score spikes, marked as “stale.”
- District with recent purchase and no EoX: low score, filtered out.
- Mixed vendors: ensure EoX tagging shows per-model differences.
- Missing lifecycle data: fall back gracefully with “unknown” tags.

## Elevator pitch
“C2 Refresh Forecaster spots the next rip-and-replace deals before the RFP drops. It blends 471 history, remaining C2 budget, and vendor EoX feeds to heatmap your territory and spit out a ranked target list—so reps hunt where gear is aging and money is still on the table.” 
