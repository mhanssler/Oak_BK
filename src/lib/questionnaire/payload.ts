function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

interface PayloadCarrier {
  payload: unknown
}

export function getResponsePayload(response: PayloadCarrier | null | undefined): Record<string, unknown> {
  if (!response) {
    return {}
  }

  return isPlainRecord(response.payload) ? response.payload : {}
}

export function readResponseField(responses: PayloadCarrier[], fieldKey: string): unknown {
  for (const response of responses) {
    const payload = getResponsePayload(response)
    if (Object.prototype.hasOwnProperty.call(payload, fieldKey)) {
      return payload[fieldKey]
    }
  }

  return null
}
