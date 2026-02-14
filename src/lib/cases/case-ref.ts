import { randomUUID } from 'crypto'

const CASE_REF_MAX_LENGTH = 72
const CASE_REF_SUFFIX_LENGTH = 10
const CASE_REF_SEPARATOR = '-'

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createCaseReference(fullName: string | null | undefined): string {
  const normalized = normalizeName(fullName || '')
  const namePrefix = normalized.length > 0 ? normalized : 'client'
  const uniqueSuffix = randomUUID().replace(/-/g, '').slice(0, CASE_REF_SUFFIX_LENGTH)
  const maxPrefixLength =
    CASE_REF_MAX_LENGTH - CASE_REF_SEPARATOR.length - CASE_REF_SUFFIX_LENGTH
  const safePrefix = namePrefix.slice(0, Math.max(1, maxPrefixLength))

  return `${safePrefix}${CASE_REF_SEPARATOR}${uniqueSuffix}`
}
