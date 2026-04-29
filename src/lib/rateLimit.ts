// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(key: string, limit: number, windowMs = 60000): boolean {
  const now = Date.now()
  const record = requests.get(key)
  if (!record || now > record.resetTime) {
    requests.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  if (record.count >= limit) return false
  record.count++
  return true
}
