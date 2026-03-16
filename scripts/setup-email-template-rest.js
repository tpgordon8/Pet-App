#!/usr/bin/env node

/**
 * Setup Email Template in Firestore using REST API
 * Creates the household-invite email template for Firebase Email Trigger extension
 * Uses Firestore REST API (no authentication needed with open rules)
 */

// Firebase configuration
const PROJECT_ID = 'petlog-c4c1e'
const API_KEY = 'AIzaSyBPYWL8FZ3XHLZnRtN7kwewpC8_zKJXbDY'

// Email template content
const emailTemplate = {
  fields: {
    subject: {
      stringValue: "You've been invited to join a pet household on Tailr"
    },
    html: {
      stringValue: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b9a7f 0%, #6b7a5f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #8b9a7f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 Tailr</h1>
      <p>Pet Activity Tracking Made Easy</p>
    </div>
    <div class="content">
      <h2>You've been invited!</h2>
      <p>Hi there,</p>
      <p><strong>{{inviterName}}</strong> has invited you to join their pet household on Tailr.</p>
      <p>Tailr helps you track daily activities, medical records, and care coordination for your pets - all in real-time across devices.</p>
      <a href="{{inviteUrl}}" class="button">Accept Invitation</a>
      <p><small>Or copy this link: {{inviteUrl}}</small></p>
    </div>
    <div class="footer">
      <p>This invitation will expire in 7 days.</p>
      <p>&copy; 2026 Tailr - Pet Activity Logger</p>
    </div>
  </div>
</body>
</html>`
    },
    text: {
      stringValue: `You've been invited to join a pet household on Tailr!

Hi there,

{{inviterName}} has invited you to join their pet household on Tailr.

Tailr helps you track daily activities, medical records, and care coordination for your pets - all in real-time across devices.

Accept your invitation here:
{{inviteUrl}}

This invitation will expire in 7 days.

---
© 2026 Tailr - Pet Activity Logger`
    }
  }
}

async function setupEmailTemplate() {
  try {
    console.log('📧 Creating email template in Firestore via REST API...')

    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/mail_templates/household-invite?key=${API_KEY}`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailTemplate)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error, null, 2)}`)
    }

    const result = await response.json()

    console.log('✅ Email template created successfully!')
    console.log('\nTemplate details:')
    console.log('  Collection: mail_templates')
    console.log('  Document ID: household-invite')
    console.log('  Subject:', emailTemplate.fields.subject.stringValue)
    console.log('\n✨ Done! The Firebase Email Trigger extension can now use this template.')

  } catch (error) {
    console.error('❌ Error creating email template:', error.message)
    console.log('\n💡 Troubleshooting:')
    console.log('  1. Make sure Firestore is enabled in Firebase Console')
    console.log('  2. Deploy Firestore rules: firebase deploy --only firestore:rules')
    console.log('  3. Check that rules allow writes to mail_templates collection')
    process.exit(1)
  }
}

setupEmailTemplate()
