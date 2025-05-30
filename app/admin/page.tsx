"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navigation from "@/components/navigation"

interface AdminStats {
  users: {
    total: number
    by_plan: Record<string, number>
  }
  usage: {
    requests_today: number
    tokens_today: number
  }
  timestamp: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [adminKey, setAdminKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)

    // Check if admin key exists in session storage
    const savedKey = sessionStorage.getItem("begins_admin_key")
    if (savedKey) {
      setAdminKey(savedKey)
      setIsAuthenticated(true)

      // Fetch stats with the saved key
      const fetchWithSavedKey = async () => {
        try {
          const response = await fetch("/api/admin/stats", {
            headers: {
              Authorization: `Bearer ${savedKey}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to fetch admin statistics")
          }

          const data = await response.json()
          setStats(data)
        } catch (err) {
          setIsAuthenticated(false)
          sessionStorage.removeItem("begins_admin_key")
        } finally {
          setLoading(false)
        }
      }

      fetchWithSavedKey()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch admin statistics")
      }

      const data = await response.json()
      setStats(data)
      setIsAuthenticated(true)
      // Save admin key to session storage
      sessionStorage.setItem("begins_admin_key", adminKey)
    } catch (err: any) {
      setError(err.message || "An error occurred")
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminKey) {
      fetchStats()
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Admin Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="admin-key" className="text-sm font-medium">
                    Admin Key
                  </label>
                  <input
                    id="admin-key"
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Login"}
                </button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <button
                onClick={() => {
                  setIsAuthenticated(false)
                  sessionStorage.removeItem("begins_admin_key")
                }}
                className="text-black hover:opacity-70 transition-opacity"
              >
                Logout
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading statistics...</div>
            ) : stats ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{stats.users.total}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Requests Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{stats.usage.requests_today}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tokens Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">{stats.usage.tokens_today.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Users by Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {Object.entries(stats.users.by_plan).map(([plan, count]) => (
                        <div key={plan} className="p-4 border rounded-md">
                          <div className="text-lg font-medium capitalize">{plan}</div>
                          <div className="text-3xl font-bold">{count}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="text-sm text-gray-500">Last updated: {new Date(stats.timestamp).toLocaleString()}</div>
              </div>
            ) : (
              <div className="text-center py-12">No data available</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
