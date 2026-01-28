import type { RfpFilters, RfpRecord } from '../types/erate'

// NOTE: USAC Open Data is hosted on opendata.usac.org using a Socrata API.
// The exact dataset ID for FCC Form 470 postings should be confirmed from the
// USAC Open Data catalog and updated below.
const BASE_URL = 'https://opendata.usac.org/resource/REPLACE_FORM_470_DATASET_ID.json'

export async function fetchRfps(filters: RfpFilters): Promise<RfpRecord[]> {
  // Basic guard to avoid calling an obviously misconfigured endpoint in development.
  if (BASE_URL.includes('REPLACE_FORM_470_DATASET_ID')) {
    console.warn(
      'USAC Form 470 dataset ID is not configured. Please update BASE_URL in src/api/usac.ts.',
    )
    return []
  }

  const params = new URLSearchParams()

  // Simple example filters – these will need to be adapted to actual field names
  // once the dataset schema is confirmed from USAC Open Data.
  const whereClauses: string[] = []

  if (filters.state) {
    // Example: state field might be called applicant_state or similar.
    whereClauses.push(`upper(applicant_state) = '${filters.state.toUpperCase()}'`)
  }

  if (filters.fundingYear) {
    // Example: funding year field might be called funding_year.
    whereClauses.push(`funding_year = '${filters.fundingYear}'`)
  }

  if (filters.openOnly) {
    // Example: filter by a bid/allowable contract date in the future.
    // This is pseudocode until actual field names are confirmed.
    whereClauses.push(`bid_due_date >= current_date`)
  }

  if (filters.search) {
    const escaped = filters.search.replace(/'/g, "''")
    whereClauses.push(
      `(upper(applicant_name) like '%${escaped.toUpperCase()}%' OR upper(narrative) like '%${escaped.toUpperCase()}%')`,
    )
  }

  if (whereClauses.length > 0) {
    params.set('$where', whereClauses.join(' AND '))
  }

  params.set('$limit', '200')
  params.set('$order', 'posting_date DESC')

  const url = `${BASE_URL}?${params.toString()}`

  // Helpful for debugging in the console while developing.
  console.info('[RFP Radar] Fetching Form 470 data from USAC', url)

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`USAC API error: ${res.status} ${res.statusText}`)
  }

  const data = (await res.json()) as any[]

  // Map raw USAC records into our internal RfpRecord shape.
  return data.map((row, idx): RfpRecord => {
    return {
      id: String(row.id ?? idx),
      applicantName: row.applicant_name ?? 'Unknown applicant',
      state: row.applicant_state ?? '',
      postingDate: row.posting_date ?? '',
      dueDate: row.bid_due_date ?? row.allowable_contract_date,
      category: row.category_of_service ?? row.service_type,
      shortDescription: row.narrative ?? row.short_description,
      url: row.rfp_url ?? row.form_470_url,
    }
  })
}

