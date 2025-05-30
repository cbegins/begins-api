"use client"

import { useEffect } from "react"
import Navigation from "@/components/navigation"

export default function TermsPage() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Begins API service, you accept and agree to be bound by the terms and provision
              of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p>
              Begins provides an AI API service that allows developers to integrate artificial intelligence capabilities
              into their applications. The service is provided "as is" and we reserve the right to modify or discontinue
              the service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. API Usage and Limitations</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must use a valid API key for all requests</li>
              <li>Rate limits apply based on your subscription plan</li>
              <li>You may not abuse, overload, or attempt to circumvent our systems</li>
              <li>You are responsible for all activity that occurs under your API key</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Prohibited Uses</h2>
            <p>You may not use our service for:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Illegal activities or content that violates applicable laws</li>
              <li>Generating harmful, abusive, or offensive content</li>
              <li>Attempting to reverse engineer or replicate our service</li>
              <li>Reselling or redistributing our API without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Privacy and Data</h2>
            <p>
              We respect your privacy and handle data according to our Privacy Policy. We may log API requests for
              monitoring, debugging, and improving our service. We do not store or use your input data for training
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Payment and Billing</h2>
            <p>
              Paid plans are billed according to the pricing displayed on our website. All fees are non-refundable
              unless required by law. We reserve the right to change pricing with 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p>
              Begins shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of the service. Our total liability shall not exceed the amount paid by you in the
              12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
            <p>
              We may terminate or suspend your access to the service at any time for violation of these terms or for any
              other reason. You may terminate your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of significant changes via
              email or through our service. Continued use of the service constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:contact@begins.site" className="text-blue-600 hover:underline">
                contact@begins.site
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
