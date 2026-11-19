// Runs once when the server starts. Initialising Payload here validates required env vars
// and applies production migrations at boot instead of on the first request.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  try {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    await getPayload({ config })
  } catch (error) {
    // Next.js logs instrumentation errors but keeps serving; exit so a broken deploy is visible.
    console.error('Failed to initialise Payload:', error)
    process.exit(1)
  }
}
