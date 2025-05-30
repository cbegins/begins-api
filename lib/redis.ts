import { Redis } from "@upstash/redis"

// Initialize Redis client using the provided environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export async function checkRateLimit(key: string, limit: number, window: number): Promise<RateLimitResult> {
  const now = Date.now()
  const pipeline = redis.pipeline()

  // Remove expired entries
  pipeline.zremrangebyscore(key, 0, now - window)

  // Count current requests
  pipeline.zcard(key)

  // Add current request
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })

  // Set expiration
  pipeline.expire(key, Math.ceil(window / 1000))

  const results = await pipeline.exec()
  const currentCount = results[1] as number

  if (currentCount >= limit) {
    // Remove the request we just added since it's over limit
    await redis.zrem(key, `${now}-${Math.random()}`)

    return {
      success: false,
      remaining: 0,
      resetTime: now + window,
    }
  }

  return {
    success: true,
    remaining: limit - currentCount - 1,
    resetTime: now + window,
  }
}

export async function getApiKeyUsage(apiKey: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0]
  const key = `usage:${apiKey}:${today}`

  const count = await redis.get(key)
  return count ? Number.parseInt(count as string) : 0
}

export async function incrementApiKeyUsage(apiKey: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0]
  const key = `usage:${apiKey}:${today}`

  const count = await redis.incr(key)
  await redis.expire(key, 86400) // 24 hours

  return count
}

export async function cacheGeminiResponse(prompt: string, response: string, ttl = 3600): Promise<void> {
  const key = `cache:${Buffer.from(prompt).toString("base64")}`
  await redis.setex(key, ttl, response)
}

export async function getCachedGeminiResponse(prompt: string): Promise<string | null> {
  const key = `cache:${Buffer.from(prompt).toString("base64")}`
  return await redis.get(key)
}

export default redis
