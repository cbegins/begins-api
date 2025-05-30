"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import ApiKeyForm from "@/components/api-key-form"

export default function PricingPage() {
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  const handlePaidPlanClick = () => {
    setShowPaymentPopup(true)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navigation />

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

      {/* Payment System Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Payment System Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              We're currently working on integrating our payment system. Pro and Unlimited plans will be available soon!
            </p>
            <p className="text-sm text-gray-500 mb-6">
              For now, enjoy our free tier with 100 requests per day. We'll notify you when paid plans are ready.
            </p>
            <div className="flex space-x-4">
              <Button
                className="flex-1 bg-black text-white hover:bg-gray-800"
                onClick={() => {
                  setShowPaymentPopup(false)
                  setShowApiKeyForm(true)
                }}
              >
                Get Free API Key
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowPaymentPopup(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Simple, transparent pricing</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees, no complex billing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="border border-gray-200 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <div className="text-4xl font-bold mb-6">₹0</div>
              <ul className="space-y-3 mb-8">
                <li>100 requests per day</li>
                <li>Advanced AI model access</li>
                <li>Basic rate limiting</li>
                <li>Community support</li>
              </ul>
              <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={() => setShowApiKeyForm(true)}>
                Get Started
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="border-2 border-black p-8 rounded-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-1 text-sm font-medium rounded">
                Coming Soon
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="text-4xl font-bold mb-2">₹10</div>
              <div className="text-gray-600 mb-6">per week</div>
              <ul className="space-y-3 mb-8">
                <li>2,000 requests per week</li>
                <li>Advanced AI model access</li>
                <li>Priority rate limiting</li>
                <li>Email support</li>
                <li>Usage analytics</li>
              </ul>
              <Button className="w-full bg-gray-400 text-white" onClick={handlePaidPlanClick}>
                Coming Soon
              </Button>
            </div>

            {/* Unlimited Tier */}
            <div className="border border-gray-200 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Unlimited</h3>
              <div className="text-4xl font-bold mb-2">₹99</div>
              <div className="text-gray-600 mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                <li>Unlimited requests</li>
                <li>100 req/min rate cap</li>
                <li>All model access</li>
                <li>Priority support</li>
                <li>Advanced analytics</li>
                <li>Custom integrations</li>
              </ul>
              <Button className="w-full bg-gray-400 text-white" onClick={handlePaidPlanClick}>
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Enterprise Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-6">Need something custom?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              For enterprises and high-volume applications, we offer custom plans with dedicated support, SLAs, and
              volume discounts.
            </p>
            <a href="/contact">
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                Contact Sales
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
