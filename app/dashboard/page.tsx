"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Link from "next/link"

interface UserStats {
  api_key: string
  plan: string
  requests_used: number
  requests_limit: number
  created_at: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  const fetchUserStats = async (key: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/user/stats", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      })

      if (!response.ok) {
        throw new Error("Invalid API key")
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError("Failed to fetch user statistics")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      fetchUserStats(apiKey.trim())
    }
  }

  const getUsagePercentage = () => {
    if (!stats) return 0
    return Math.min((stats.requests_used / stats.requests_limit) * 100, 100)
  }

  const getUsageColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getRemainingRequests = () => {
    if (!stats) return 0
    return Math.max(stats.requests_limit - stats.requests_used, 0)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {!stats ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* API Key Input */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Enter Your API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="begins_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <Button type="submit" disabled={loading} className="w-full bg-black text-white">
                    {loading ? "Loading..." : "View Dashboard"}
                  </Button>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                </form>
              </CardContent>
            </Card>

            {/* Get API Key Card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Don't have an API key?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get started with our free tier and access powerful AI capabilities instantly.
                </p>
                <div className="space-y-3">
                  <Link href="/">
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Get Free API Key</Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      variant="outline"
                      className="w-full border-black text-black hover:bg-black hover:text-white"
                    >
                      View Pricing Plans
                    </Button>
                  </Link>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Free Tier includes:</strong>
                    <br />• 100 requests per day
                    <br />• Advanced AI model access
                    <br />• No credit card required
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{stats.plan}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.plan === "free" ? "100 requests/day" : "Custom limits"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Requests Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.requests_used}</div>
                  <p className="text-xs text-gray-500 mt-1">of {stats.requests_limit} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{getRemainingRequests()}</div>
                  <p className="text-xs text-gray-500 mt-1">requests left</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getUsagePercentage().toFixed(1)}%</div>
                  <p className="text-xs text-gray-500 mt-1">of daily limit</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily Usage</span>
                    <span className="text-sm text-gray-600">
                      {stats.requests_used} / {stats.requests_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getUsageColor()}`}
                      style={{ width: `${getUsagePercentage()}%` }}
                    ></div>
                  </div>
                  {getUsagePercentage() >= 80 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Usage Warning:</strong> You're approaching your daily limit. Consider upgrading to a
                        paid plan for higher limits.
                      </p>
                      <Link href="/pricing">
                        <Button size="sm" className="mt-2 bg-yellow-600 text-white hover:bg-yellow-700">
                          View Pricing Plans
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="text-lg font-semibold capitalize">{stats.plan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Created</p>
                      <p className="text-lg">{new Date(stats.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/playground">
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Test API in Playground
                      </Button>
                    </Link>
                    <Link href="/docs">
                      <Button variant="outline" className="w-full border-gray-300">
                        View Documentation
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button
                        variant="outline"
                        className="w-full border-black text-black hover:bg-black hover:text-white"
                      >
                        Upgrade Plan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API Key Section */}
            <Card>
              <CardHeader>
                <CardTitle>API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm break-all">{stats.api_key}</code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Keep this key secure and never share it publicly. Use it in the Authorization header of your API
                  requests.
                </p>
              </CardContent>
            </Card>

            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {`curl -X POST https://api.begins.site/v1/chat \\
  -H "Authorization: Bearer ${stats.api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, how are you?",
    "max_tokens": 1000
  }'`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
