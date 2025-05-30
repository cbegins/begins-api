"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Navigation from "@/components/navigation"

export default function PlaygroundPage() {
  const [stats, setStats] = useState<{
    tokens_used: number
    response_time: number
    cached: boolean
    remaining_requests: number
  } | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResponse("")
    setStats(null)

    const startTime = Date.now()

    try {
      // Updated to use the correct endpoint
      const response = await fetch("/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()
      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      setResponse(data.response)
      setStats({
        tokens_used: data.tokens_used,
        response_time: responseTime,
        cached: data.cached || false,
        remaining_requests: data.remaining_requests,
      })
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">API Playground</h1>
        <p className="text-lg mb-8">Test the Begins API directly in your browser.</p>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Request</CardTitle>
              <CardDescription>Enter your API key and message</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="api-key" className="text-sm font-medium">
                    API Key
                  </label>
                  <Input
                    id="api-key"
                    placeholder="begins_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-black text-white" disabled={loading}>
                  {loading ? "Sending..." : "Send Request"}
                </Button>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
              <CardDescription>AI-generated response will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-gray-50 p-4 rounded-md">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse">Loading...</div>
                  </div>
                ) : response ? (
                  <div className="whitespace-pre-wrap">{response}</div>
                ) : (
                  <div className="text-gray-400 text-center h-full flex items-center justify-center">
                    Response will appear here
                  </div>
                )}
              </div>
            </CardContent>
            {stats && (
              <CardFooter className="flex flex-col items-start">
                <div className="text-sm text-gray-600 space-y-1 w-full">
                  <div className="flex justify-between">
                    <span>Tokens used:</span>
                    <span>{stats.tokens_used}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response time:</span>
                    <span>{stats.response_time}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cached:</span>
                    <span>{stats.cached ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining requests:</span>
                    <span>{stats.remaining_requests}</span>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Code Example</h2>
          <Card>
            <CardContent className="pt-6">
              <pre className="text-sm overflow-x-auto bg-gray-50 p-4 rounded-md">
                {`// JavaScript Example
const response = await fetch('https://api.begins.site/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey || "YOUR_API_KEY"}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: "${message || "Your message here"}"
  })
});

const data = await response.json();
console.log(data.response);`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
