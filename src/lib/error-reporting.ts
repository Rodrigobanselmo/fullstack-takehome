export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  // TODO: Replace with actual error reporting service (e.g., Sentry)
  console.error("Error captured:", error, context);
}
