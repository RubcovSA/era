# Bid Pulse Relay (Vue + Slack/Teams alerts)

## Problem / Pain to solve
- Persona hates the “E-rate hell” scramble and fears missing Form 470/RFPs scattered across USAC, state portals, and district sites. They check USAC twice a day today and still worry. Information is siloed; reps only see what’s in their inbox.

## Who it’s for
- Regional sales directors / owners who need instant visibility on new RFPs in their territory and a fast way to route them to the right rep without another heavy CRM.

## Data sources (E-rate required)
- USAC Open Data: Form 470 postings (fields: posting date, deadline, category, applicant, state, service type, incumbent/vendor hints if present).
- Optional enrichment: USAC Form 471 history to show prior spend/vendor per applicant for qualification.

## External APIs to use
- Slack or Microsoft Teams incoming webhooks for push alerts.
- Geocoding (Mapbox or Google Geocoding) to normalize districts to territories/regions.
- Optional: Nominatim (open) if paid maps are out of scope for the day.

## What the Vue app does
- Live “signal board” lists freshly posted 470s filtered by state/territory, with countdown to the 28-day window close.
- Auto-scores relevance using simple rules: category match (e.g., C2 network vs WAN), prior vendor history (from 471), and geography fit; shows a “Pursue / Watch / Ignore” tag.
- One-click “Route to Rep” button posts a Slack/Teams card with deadline, scope, applicant, and quick links (RFP URL, applicant profile).
- Inline mini-profile for each applicant showing last funded amount, last upgrade year, and whether the incumbent is visible in 471 history.

## Key Vue screens / flow
1) Signals: table of new 470s with filters (state, category, min discount rate) and urgency chips.
2) Applicant drawer: pulls 471 history to show spend, vendor, and C2 left; surfaces “likely incumbent” and “time since last upgrade.”
3) Alert action: configure Slack/Teams webhook + territory mapping; send preview, then post.
4) Settings: map zipcode/state to rep; set scoring weights for relevance.

## Why this fits the 6–8h build
- Limited scope UI (two main views), leverages USAC JSON endpoints + a webhook POST. No auth complexity. Scoring can start as simple rules.

## Validation scenarios
- High-activity week: multiple new 470s; confirm alerts dedupe and respect filters.
- Low/no data: empty state still shows “you’re covered” message.
- Out-of-territory posting: ensure it’s tagged Ignore and not alerted.
- Prior vendor present vs absent: show how the relevance score changes.

## Elevator pitch
“Bid Pulse Relay keeps you from missing any Form 470. It watches USAC, scores relevance, and blasts the right rep in Slack/Teams with the RFP, deadline clock, and incumbent hints—so you triage in minutes instead of living in USAC tabs.” 
