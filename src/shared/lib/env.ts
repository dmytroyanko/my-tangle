// `next build` evaluates the Payload config without runtime secrets, so only enforce at runtime.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value && !isBuildPhase) {
    throw new Error(`Missing required environment variable ${name}. See .env.example.`)
  }
  return value ?? ''
}
