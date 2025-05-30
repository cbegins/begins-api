"use client"

import { useEffect } from "react"
import Navigation from "@/components/navigation"

export default function PrivacyPage() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong>Account Information:</strong> Email address when you sign up for an API key
              </li>
              <li>
                <strong>Usage Data:</strong> API requests, response times, and usage statistics
              </li>
              <li>
                <strong>Technical Data:</strong> IP addresses, user agents, and request metadata
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Provide and maintain our API service</li>
              <li>Monitor usage and enforce rate limits</li>
              <li>Improve our service and develop new features</li>
              <li>Communicate with you about your account and service updates</li>
              <li>Prevent abuse and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Data Storage and Security</h2>
            <p>
              We store your data securely using industry-standard practices. Your API requests and responses are logged
              temporarily for monitoring and debugging purposes. We implement appropriate technical and organizational
              measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in operating our service (under strict confidentiality)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Retention</h2>
            <p>
              We retain your account information for as long as your account is active. Usage logs and analytics data
              are retained for up to 12 months for service improvement purposes. You may request deletion of your
              account and associated data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
            <p>
              Our website uses minimal cookies for essential functionality. We do not use tracking cookies or
              third-party analytics. API usage is logged for service operation but does not involve personal tracking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you become aware that a child has provided us with personal
              information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy
              Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
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
