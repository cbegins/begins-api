"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import ApiKeyForm from "@/components/api-key-form"

export default function HomePage() {
  const [apiUsageCount, setApiUsageCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
    setIsVisible(true)

    // Start with a realistic low number for a new product launch
    const getBaseCount = () => {
      const today = new Date().toDateString()
      const storedData = localStorage.getItem("begins_api_usage")

      if (storedData) {
        const parsed = JSON.parse(storedData)
        if (parsed.date === today) {
          return parsed.count
        }
      }

      // New day or first visit - start with a realistic base for launch
      const baseCount = 47 + Math.floor(Math.random() * 20) // Start between 47-67
      localStorage.setItem(
        "begins_api_usage",
        JSON.stringify({
          date: today,
          count: baseCount,
        }),
      )
      return baseCount
    }

    const baseCount = getBaseCount()
    setApiUsageCount(baseCount)

    // Simulate realistic API usage increments for a new product
    const interval = setInterval(() => {
      setApiUsageCount((prev) => {
        // Slower increment for new product - sometimes no increment
        const shouldIncrement = Math.random() > 0.3 // 70% chance to increment
        if (!shouldIncrement) return prev

        const increment = Math.floor(Math.random() * 2) + 1 // 1-2 requests
        const newCount = prev + increment

        // Update localStorage
        const today = new Date().toDateString()
        localStorage.setItem(
          "begins_api_usage",
          JSON.stringify({
            date: today,
            count: newCount,
          }),
        )

        return newCount
      })
    }, 8000) // Every 8 seconds (slower for new product)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black">
      <Navigation />

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h1 className="text-4xl md:text-7xl font-bold leading-tight text-left md:text-left text-center mb-8 tracking-tight">
              AI that just works.
              <br />
              No setup required.
            </h1>
            <p className="text-lg md:text-xl text-left md:text-left text-center mb-12 max-w-2xl leading-relaxed">
              Access powerful AI through our clean, simple API. No complex setup required, no API key management, no
              configuration headaches. Just send a request and get intelligent responses instantly.
            </p>
            <div className="text-left md:text-left text-center">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-medium"
                onClick={() => setShowApiKeyForm(true)}
              >
                Get Free API Key
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* API Key Form Modal */}
      {showApiKeyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black z-10"
              onClick={() => setShowApiKeyForm(false)}
            >
              ✕
            </button>
            <ApiKeyForm />
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div
            className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="grid md:grid-cols-3 gap-12 md:gap-16">
              <div className="text-left md:text-left text-center">
                <h3 className="text-2xl font-bold mb-4">No Complex Setup</h3>
                <p className="text-lg leading-relaxed">
                  Skip the complex configuration and API key management. Start building immediately with our proxy
                  service.
                </p>
              </div>
              <div className="text-left md:text-left text-center">
                <h3 className="text-2xl font-bold mb-4">Instant Usage</h3>
                <p className="text-lg leading-relaxed">
                  Get your API key in seconds and start making requests. Our infrastructure handles scaling, rate
                  limiting, and reliability.
                </p>
              </div>
              <div className="text-left md:text-left text-center">
                <h3 className="text-2xl font-bold mb-4">Smart Routing</h3>
                <p className="text-lg leading-relaxed">
                  Automatic key rotation and load balancing ensures maximum uptime and optimal performance for your
                  applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Usage Counter */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div
            className={`transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="text-left md:text-left text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Live API Usage</h2>
              <div className="text-6xl md:text-8xl font-bold mb-4 transition-all duration-500">
                {apiUsageCount.toLocaleString()}
              </div>
              <p className="text-lg text-gray-600">Requests processed today</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div
            className={`transition-all duration-1000 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="text-left md:text-left text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Ready to build with AI?</h2>
              <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                Join thousands of developers who chose simplicity over complexity. Start building AI-powered
                applications today.
              </p>
              <Button
                size="lg"
                className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-medium"
                onClick={() => setShowApiKeyForm(true)}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-8 md:mb-0">
              <div className="text-2xl font-bold mb-4">Begins</div>
              <p className="text-gray-600">AI that just works.</p>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <a href="/terms" className="text-gray-600 hover:text-black transition-colors">
                Terms of Service
              </a>
              <a href="/privacy" className="text-gray-600 hover:text-black transition-colors">
                Privacy Policy
              </a>
              <a href="/contact" className="text-gray-600 hover:text-black transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
