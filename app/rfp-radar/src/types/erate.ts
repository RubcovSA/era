export interface RfpRecord {
  id: string
  applicantName: string
  state: string
  postingDate: string
  dueDate?: string
  category?: string
  shortDescription?: string
  url?: string
}

export interface RfpFilters {
  state: string
  fundingYear: string
  search: string
  openOnly: boolean
}

