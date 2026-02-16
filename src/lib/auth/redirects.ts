export function sanitizeRedirectPath(nextParam: string | null): string {
  if (!nextParam) {
    return '/dashboard'
  }

  if (!nextParam.startsWith('/')) {
    return '/dashboard'
  }

  return nextParam
}

export function safeNextPath(path: string | null): string {
  if (!path || !path.startsWith('/')) {
    return '/dashboard'
  }

  return path
}
