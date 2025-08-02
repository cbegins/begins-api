import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, apiKey: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("Email service not configured, skipping welcome email")
    return
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@begins.site",
      to: email,
      subject: "Welcome to Begins AI - Your API Key is Ready!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000; margin-bottom: 24px;">Welcome to Begins AI!</h1>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Thank you for signing up! Your API key has been generated and is ready to use.
          </p>
          
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0;">Your API Key:</h3>
            <code style="font-family: monospace; font-size: 14px; word-break: break-all;">${apiKey}</code>
          </div>
          
          <h3>Quick Start:</h3>
          <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 12px;">curl -X POST https://api.begins.site/v1/chat \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, how are you?"}'</pre>
          
          <p style="margin-top: 24px;">
            <strong>Free Tier Includes:</strong><br>
            • 100 requests per day<br>
            • Advanced AI model access<br>
            • Community support
          </p>
          
          <p style="margin-top: 24px;">
            <a href="https://begins.site/docs" style="color: #0066cc;">📖 Read Documentation</a> |
            <a href="https://begins.site/playground" style="color: #0066cc;">🎮 Try Playground</a> |
            <a href="https://begins.site/dashboard" style="color: #0066cc;">📊 View Dashboard</a>
          </p>
          
          <p style="margin-top: 32px; font-size: 14px; color: #666;">
            Questions? Reply to this email or contact us at contact@begins.site
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send welcome email:", error)
  }
}

export async function sendUsageAlert(email: string, usagePercentage: number, plan: string) {
  if (!process.env.RESEND_API_KEY) return

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@begins.site",
      to: email,
      subject: `Begins AI - ${usagePercentage}% of your ${plan} plan used`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000;">Usage Alert</h1>
          
          <p>You've used ${usagePercentage}% of your ${plan} plan limit.</p>
          
          ${
            usagePercentage >= 90
              ? `
            <div style="background: #fee; border: 1px solid #fcc; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <strong>⚠️ Warning:</strong> You're approaching your limit. Consider upgrading to avoid service interruption.
            </div>
          `
              : ""
          }
          
          <p>
            <a href="https://begins.site/dashboard" style="color: #0066cc;">View Dashboard</a> |
            <a href="https://begins.site/pricing" style="color: #0066cc;">Upgrade Plan</a>
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send usage alert:", error)
  }
}
