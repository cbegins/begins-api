"use client"

import { useEffect } from "react"
import Navigation from "@/components/navigation"

export default function ContactPage() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <p className="text-lg mb-8 leading-relaxed">
              Have questions about our API service? Need help with integration? Want to discuss enterprise plans? We're
              here to help.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Contact Email</h3>
                <p className="text-lg">
                  <a href="mailto:contact@begins.site" className="text-blue-600 hover:underline">
                    contact@begins.site
                  </a>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  For all inquiries including general questions, technical support, and business partnerships
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Response Time</h3>
                <p className="text-gray-600">
                  We typically respond within 24 hours during business days. For urgent technical issues, please include
                  "URGENT" in your subject line.
                </p>
              </div>

            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Documentation</h3>
                <p className="text-gray-600 mb-2">Complete API reference and integration guides</p>
                <a href="/docs" className="text-blue-600 hover:underline">
                  View Documentation →
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">API Playground</h3>
                <p className="text-gray-600 mb-2">Test our API directly in your browser</p>
                <a href="/playground" className="text-blue-600 hover:underline">
                  Try Playground →
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Pricing</h3>
                <p className="text-gray-600 mb-2">View our simple, transparent pricing plans</p>
                <a href="/pricing" className="text-blue-600 hover:underline">
                  See Pricing →
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2">Dashboard</h3>
                <p className="text-gray-600 mb-2">Monitor your API usage and manage your account</p>
                <a href="/dashboard" className="text-blue-600 hover:underline">
                  Go to Dashboard →
                </a>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Need Help Getting Started?</h3>
              <p className="text-gray-600 mb-4">
                Check out our documentation or try the API playground to get familiar with our service.
              </p>
              <div className="space-y-2">
                <a href="/docs" className="block text-blue-600 hover:underline">
                  → Read the Documentation
                </a>
                <a href="/playground" className="block text-blue-600 hover:underline">
                  → Try the API Playground
                </a>
                <a href="/" className="block text-blue-600 hover:underline">
                  → Get Your Free API Key
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
