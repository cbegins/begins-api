"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"

const codeExamples = {
  curl: `curl -X POST https://api.begins.site/v1/chat -H "Authorization: Bearer YOUR_API_KEY_HERE" -H "Content-Type: application/json" -d "{\"message\": \"Hello, how are you?\"}"`,

  javascript: `const fetch = require("node-fetch"); // or native fetch in Node 18+

fetch("https://api.begins.site/v1/chat", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY_HERE",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ message: "Hello, how are you?" })
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);`,

  python: `import requests

response = requests.post(
    "https://api.begins.site/v1/chat",
    headers={
        "Authorization": "Bearer YOUR_API_KEY_HERE",
        "Content-Type": "application/json"
    },
    json={"message": "Hello, how are you?"}
)

print(response.json())`,
}

export default function DocsPage() {
  const [activeExample, setActiveExample] = useState("curl")

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black">
      <Navigation />

      <div className="flex">
        {/* Sidebar Navigation - Made Sticky */}
        <aside className="w-64 min-h-screen border-r border-gray-200 p-8 sticky top-0 overflow-y-auto">
          <nav className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Getting Started</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#introduction" className="text-gray-600 hover:text-black">
                    Introduction
                  </a>
                </li>
                <li>
                  <a href="#authentication" className="text-gray-600 hover:text-black">
                    Authentication
                  </a>
                </li>
                <li>
                  <a href="#quick-start" className="text-gray-600 hover:text-black">
                    Quick Start
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">API Reference</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#chat-endpoint" className="text-gray-600 hover:text-black">
                    Chat Endpoint
                  </a>
                </li>
                <li>
                  <a href="#rate-limits" className="text-gray-600 hover:text-black">
                    Rate Limits
                  </a>
                </li>
                <li>
                  <a href="#error-codes" className="text-gray-600 hover:text-black">
                    Error Codes
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Examples</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#code-examples" className="text-gray-600 hover:text-black">
                    Code Examples
                  </a>
                </li>
                <li>
                  <a href="#use-cases" className="text-gray-600 hover:text-black">
                    Use Cases
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-12 max-w-4xl">
          <section id="introduction" className="mb-16">
            <h1 className="text-4xl font-bold mb-6">Documentation</h1>
            <p className="text-lg mb-6 leading-relaxed">
              The Begins API provides simple access to powerful AI capabilities. No complex setup required - just get
              your API key and start building.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Base URL</h3>
              <code className="text-sm bg-white px-3 py-1 rounded border">https://api.begins.site/v1</code>
            </div>
          </section>

          <section id="authentication" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Authentication</h2>
            <p className="text-lg mb-6 leading-relaxed">
              All API requests require authentication using your Begins API key in the Authorization header.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold mb-2">Header Format</h3>
              <code className="text-sm bg-white px-3 py-1 rounded border block">
                Authorization: Bearer YOUR_BEGINS_API_KEY
              </code>
            </div>
          </section>

          <section id="quick-start" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
            <ol className="list-decimal list-inside space-y-4 text-lg">
              <li>Get your free API key from the homepage</li>
              <li>Make your first request to the chat endpoint</li>
              <li>Start building amazing AI-powered applications</li>
            </ol>
          </section>

          <section id="chat-endpoint" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Chat Endpoint</h2>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">POST /v1/chat</h3>
              <p className="text-lg mb-4">Send a message and receive an AI-generated response.</p>
            </div>

            <div className="mb-6">
              <h4 className="font-bold mb-2">Request Body</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {`{
  "message": "Your prompt or question",
  "max_tokens": 1000,
  "temperature": 0.7
}`}
                </pre>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold mb-2">Response</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {`{
  "response": "AI-generated response text",
  "tokens_used": 150,
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                </pre>
              </div>
            </div>
          </section>

          <section id="code-examples" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Code Examples</h2>

            <div className="mb-6">
              <div className="flex space-x-4 mb-4">
                {Object.keys(codeExamples).map((lang) => (
                  <Button
                    key={lang}
                    variant={activeExample === lang ? "default" : "outline"}
                    onClick={() => setActiveExample(lang)}
                    className={activeExample === lang ? "bg-black text-white" : ""}
                  >
                    {lang === "curl" ? "cURL" : lang === "javascript" ? "JavaScript" : "Python"}
                  </Button>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                  {codeExamples[activeExample as keyof typeof codeExamples]}
                </pre>
              </div>
            </div>
          </section>

          <section id="rate-limits" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Rate Limits</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold">Free Tier</h3>
                <p>100 requests per day</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold">Pro Plan</h3>
                <p>2,000 requests per week</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold">Unlimited Plan</h3>
                <p>No daily limits (rate capped at 100 req/min)</p>
              </div>
            </div>
          </section>

          <section id="error-codes" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Error Codes</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold">400 - Bad Request</h3>
                <p>Invalid request format or missing required fields</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold">401 - Unauthorized</h3>
                <p>Invalid or missing API key</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold">429 - Rate Limited</h3>
                <p>Too many requests - rate limit exceeded</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold">500 - Server Error</h3>
                <p>Internal server error - please try again</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
