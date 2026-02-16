export type StatusTone = 'error' | 'success'

export const LOGIN_STATUS_MESSAGE: Record<string, { tone: StatusTone; text: string }> = {
  missing_credentials: {
    tone: 'error',
    text: 'Enter both email and password.',
  },
  weak_password: {
    tone: 'error',
    text: 'Use a password with at least 12 characters.',
  },
  auth_failed: {
    tone: 'error',
    text: 'Sign in failed. Check your credentials or verify your email.',
  },
  signup_failed: {
    tone: 'error',
    text: 'Account creation failed. Try again from the Create Account page.',
  },
  account_exists: {
    tone: 'success',
    text: 'This email is already registered. Sign in to continue your intake.',
  },
  callback_failed: {
    tone: 'error',
    text: 'Email verification link could not be completed. Request a new verification link.',
  },
}

export const SIGNUP_STATUS_MESSAGE: Record<string, { tone: StatusTone; text: string }> = {
  missing_credentials: {
    tone: 'error',
    text: 'Please enter your full legal name, email, and password.',
  },
  weak_password: {
    tone: 'error',
    text: 'Use a password with at least 12 characters.',
  },
  signup_failed: {
    tone: 'error',
    text: 'Account creation failed. Please try again.',
  },
}

export const AUTH_CONFIRMED_STATUS_MESSAGE: Record<
  string,
  { tone: StatusTone; title: string; text: string }
> = {
  success: {
    tone: 'success',
    title: 'Email Confirmed',
    text: 'Your account is verified and ready. Continue to your dashboard.',
  },
  failed: {
    tone: 'error',
    title: 'Verification Link Failed',
    text: 'The verification link was invalid or expired. Request a new account email and try again.',
  },
  missing_code: {
    tone: 'error',
    title: 'Verification Link Incomplete',
    text: 'This page was opened without a valid verification token.',
  },
}
