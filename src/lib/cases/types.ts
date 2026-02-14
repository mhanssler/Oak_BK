export interface BankruptcyCase {
  id: string
  case_ref: string | null
  user_id: string
  title: string
  chapter: string
  filing_state: string | null
  filing_county: string | null
  status: 'draft' | 'submitted' | 'archived'
  created_at: string
  updated_at: string
}

export interface CaseResponse {
  case_id: string
  step_id: string
  payload: Record<string, unknown>
  completed: boolean
  updated_at: string
}
