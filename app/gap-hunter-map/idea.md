# Gap Hunter Map (Vue + FCC/Mapbox overlay)

## Problem / Pain to solve
- Providers feel they “throw bids across the wall” because they lack a proactive view of districts that should be buying but aren’t posting. They also want competitive edge intel (who’s the incumbent, is broadband underperforming?) to prioritize outreach.

## Who it’s for
- Regional sales leaders and partner managers scouting new logos in their territory before the 470 rush; consultants advising smaller telcos that lack bandwidth to research.

## Data sources (E-rate required)
- USAC Form 470 history to flag districts with no recent postings (possible latent need).
- USAC Form 471 disbursements to see who already spends, on what, and when.
- Category (C1 vs C2) to split network vs connectivity opportunities.

## External APIs to use
- FCC Broadband Map API (or NTIA availability data) to overlay current broadband performance; gaps imply WAN/fiber opportunity.
- Mapbox (or Leaflet + OSM tiles) for map rendering; geocode district locations.
- Optional: Education demographics (NCES) to size student count for demand weighting.

## What the Vue app does
- Map of districts color-coded by “Attention Needed” score combining: no 470 in X years, low broadband throughput, high student count, and past E-rate spend.
- Click on a district to see incumbent hints (from last 471), last upgrade year, and whether C2 is underutilized.
- “Find lookalikes” filter: show districts similar to your best reference customer (same size, same tech vendor, but older 470/471 activity).
- Export/share top targets to CSV and optional Slack/Teams webhook.

## Key Vue screens / flow
1) Map view: filters for state, spend band, last-470 year, broadband quality, and incumbent vendor.
2) District drawer: snapshot of spend history, broadband stats, and suggested outreach angle (e.g., “Sub-100 Mbps, no 470 since FY21—pitch fiber/WAN refresh”).
3) Compare mode: select a reference district; show similar districts on map/list.
4) Export panel: download CSV or send to Slack/Teams with top N gaps for a rep.

## Why this fits the 6–8h build
- Reuses open map tiles + a single scoring formula; minimal CRUD. FCC API call plus USAC fetch powers the core experience; UI is map + drawer.

## Validation scenarios
- District with recent 470 + good broadband: should score low.
- District with no 470 in 3 years + poor broadband: should rank high.
- Missing broadband data: degrade gracefully and rely on E-rate signals.
- Dense metro vs rural: ensure filters handle both without performance issues.

## Elevator pitch
“Gap Hunter Map spotlights the districts you’re not seeing. It blends 470/471 history with FCC broadband data to color the map with who’s underserved, who hasn’t posted lately, and who still has money to spend—so you call the right districts before the rush.” 
