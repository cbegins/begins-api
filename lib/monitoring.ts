interface MetricData {
  timestamp: number
  value: number
  tags?: Record<string, string>
}

class SimpleMetrics {
  private metrics: Map<string, MetricData[]> = new Map()

  increment(name: string, value = 1, tags?: Record<string, string>) {
    const key = this.getKey(name, tags)
    const existing = this.metrics.get(key) || []

    existing.push({
      timestamp: Date.now(),
      value,
      tags,
    })

    // Keep only last 1000 data points
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000)
    }

    this.metrics.set(key, existing)
  }

  gauge(name: string, value: number, tags?: Record<string, string>) {
    const key = this.getKey(name, tags)
    this.metrics.set(key, [
      {
        timestamp: Date.now(),
        value,
        tags,
      },
    ])
  }

  getMetrics(name: string, tags?: Record<string, string>): MetricData[] {
    const key = this.getKey(name, tags)
    return this.metrics.get(key) || []
  }

  private getKey(name: string, tags?: Record<string, string>): string {
    if (!tags) return name
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(",")
    return `${name}|${tagString}`
  }

  // Get aggregated data for the last N minutes
  getAggregated(name: string, minutes = 60): { count: number; sum: number; avg: number } {
    const cutoff = Date.now() - minutes * 60 * 1000
    const data = this.getMetrics(name).filter((m) => m.timestamp > cutoff)

    const count = data.length
    const sum = data.reduce((acc, m) => acc + m.value, 0)
    const avg = count > 0 ? sum / count : 0

    return { count, sum, avg }
  }
}

export const metrics = new SimpleMetrics()

// Helper functions for common metrics
export function trackApiRequest(endpoint: string, statusCode: number, responseTime: number, plan: string) {
  metrics.increment("api.requests.total", 1, { endpoint, status: statusCode.toString(), plan })
  metrics.increment("api.response_time", responseTime, { endpoint })

  if (statusCode >= 400) {
    metrics.increment("api.errors.total", 1, { endpoint, status: statusCode.toString() })
  }
}

export function trackUserSignup(plan: string) {
  metrics.increment("users.signups.total", 1, { plan })
}

export function trackTokenUsage(tokens: number, plan: string) {
  metrics.increment("tokens.used.total", tokens, { plan })
}

export function getSystemHealth() {
  const last5Min = 5
  const requests = metrics.getAggregated("api.requests.total", last5Min)
  const errors = metrics.getAggregated("api.errors.total", last5Min)
  const responseTime = metrics.getAggregated("api.response_time", last5Min)

  const errorRate = requests.count > 0 ? (errors.count / requests.count) * 100 : 0

  return {
    requests_per_minute: requests.count / last5Min,
    error_rate_percent: errorRate,
    avg_response_time_ms: responseTime.avg,
    status: errorRate < 5 && responseTime.avg < 2000 ? "healthy" : "degraded",
  }
}
