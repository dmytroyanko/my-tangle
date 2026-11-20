// Runs once when the server starts. Initialising Payload here validates required env vars
// and applies production migrations at boot instead of on the first request.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initPayload } = await import('./instrumentation-node')
    await initPayload()
  }
}
