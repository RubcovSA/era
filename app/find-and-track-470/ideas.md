

# Revised Plan: E-Rate Data Tool as a Client-Side Vue App

## Problem Focus and Goal

**Pain Point:** Service providers struggle to **find and track E-rate RFPs (Form 470)** across various sources. Missing an RFP means missing a sales opportunity, especially during the hectic bid season.

**Goal:** Build a **Form 470 RFP Tracker**: a small web app that helps a vendor quickly see newly posted E-rate Form 470 requests (RFPs) relevant to them, without manual hunting.

**Solution (1 sentence):** A client-side Vue SPA that pulls Form 470 filings from USAC open data, lets users filter/sort, and supports bookmarking via localStorage.

## Technical Approach and Constraints

- **100% client-side:** Vue.js SPA. No backend.
- **Data source:** USAC Open Data (Socrata) Form 470 dataset via REST API.
- **No heavy processing:** No PDF parsing or large file downloads.
- **Persistence:** localStorage for watchlist and preferences.
- **Desktop-first UX:** Data-dense table UI.

## Data Source Details and Access Strategy

### Form 470 dataset (Competitive Bidding)

USAC provides open E-rate datasets via Socrata. We will consume the Form 470 dataset directly from the browser.

- Example endpoint (JSON):
  - `https://opendata.usac.org/resource/jt8s-3q52.json`

### Querying (SoQL parameters)

Use server-side filtering to reduce payload:

- `$limit` (cap results)
- `$order` (sort newest first)
- field filters like `state_code=CA`

Example (latest 100 in a state):

```http
GET https://opendata.usac.org/resource/jt8s-3q52.json?$limit=100&$order=date_posted DESC&state_code=CA
```

### Rate limits and caching

- Keep queries efficient and small (100–500 records for the demo).
- Cache recent results in memory and optionally in localStorage to reduce re-fetching.
- If needed, add a Socrata app token later (not required for prototype).

## Application Functionality and UX

### Core features

- **Filterable RFP list**
  - State dropdown
  - Service/category filter (if available in data)
  - Date range / “recent only” defaults
  - Optional text search (client-side)

- **RFP results display**
  - Form 470 number (link to official details)
  - Applicant name + location
  - Posted date
  - **Days remaining** until close (computed)
  - Visual urgency cues (color/badges)

- **Bookmarking / Watchlist**
  - Star icon per item
  - Saved list stored in localStorage
  - Separate view or “Show saved only” toggle

- **Preference persistence**
  - Save last-used filters (e.g., state) in localStorage

### Desktop UX

- Data table with sticky header
- Clear filter panel
- Quick scanning: badges for “NEW” and “closing soon”

### Error handling

- Empty-state messaging (“No RFPs found”) and fetch-failure banner.

## Implementation Plan (Step-by-Step)

1. **Project setup**
   - Vue 3 + Vite
   - Axios (or native fetch)
   - Simple component structure: `Filters`, `RfpTable`, `Watchlist`

2. **Fetch data from API**

```js
import axios from 'axios';

const FORM470_API = 'https://opendata.usac.org/resource/jt8s-3q52.json';

export async function fetchForm470({ stateCode, limit = 200 }) {
  const params = {
    $limit: limit,
    $order: 'date_posted DESC',
  };
  if (stateCode) params.state_code = stateCode;

  const { data } = await axios.get(FORM470_API, { params });
  return data;
}
```

3. **Filtering strategy**
   - Server-side filtering for state/year/date
   - Client-side filtering for text search and “saved only” view

4. **Vue state management**
   - Keep it simple with Composition API refs/reactive
   - Load saved preferences and watchlist on app mount

5. **localStorage persistence**

- Keys:
  - `erate_watchlist` → JSON array of Form 470 IDs
  - `erate_filters` → JSON object of last-used filters

- Store objects as JSON strings and parse on load.

6. **Bookmark toggle**
   - Add/remove ID in array
   - Update UI immediately
   - Persist to localStorage

7. **UI polish**
   - Table readability, row hover, sticky header
   - Badges:
     - “NEW” if posted in last X days
     - “CLOSING SOON” if deadline within Y days

8. **Test scenarios (capture screenshots)**
   - High-volume state (many results)
   - Low-volume state (few or none)
   - Watchlist persistence (bookmark → refresh → still saved)
   - Deadline highlighting
   - Optional: compare different time windows

## Trade-offs and Assumptions

- Focus on Form 470 only for day-1 scope.
- Rely on USAC open data being accessible from browser (CORS).
- localStorage is per-browser and limited in size, but fine for a prototype.

## Next Steps (If More Time)

- Opportunity ranking (blend in other datasets like budgets)
- Alerts/notifications for new matching RFPs
- More advanced filters (regions, categories, saved searches)
- Account-based syncing (beyond localStorage)