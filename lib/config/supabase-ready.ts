/** Treat copied .env.example values as "not configured" so the demo stays on mock. */
const PLACEHOLDER_PATTERN =
  /your-project|your_publishable|your_secret|your_real|placeholder|example|changeme|insert.?key/i

export function isMissingOrPlaceholderEnv(value?: string): boolean {
  const trimmed = value?.trim()
  if (!trimmed) return true
  return PLACEHOLDER_PATTERN.test(trimmed)
}

export function hasRealSupabasePublicConfig(
  url?: string,
  publishableKey?: string
): boolean {
  return !isMissingOrPlaceholderEnv(url) && !isMissingOrPlaceholderEnv(publishableKey)
}
