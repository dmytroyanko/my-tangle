// Node.js-only part of instrumentation.ts, kept in its own module so it is not bundled for the Edge runtime.
export async function initPayload() {
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
