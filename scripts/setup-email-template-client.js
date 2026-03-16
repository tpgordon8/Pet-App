#!/usr/bin/env node

/**
 * Setup Email Template in Firestore
 * Creates the household-invite email template for Firebase Email Trigger extension
 * Uses Firebase Client SDK (no service account needed)
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

// Firebase configuration (from src/firebase/config.js)
const firebaseConfig = {
  apiKey: "AIzaSyBPYWL8FZ3XHLZnRtN7kwewpC8_zKJXbDY",
  authDomain: "petlog-c4c1e.firebaseapp.com",
  databaseURL: "https://petlog-c4c1e-default-rtdb.firebaseio.com",
  projectId: "petlog-c4c1e",
  storageBucket: "petlog-c4c1e.appspot.com",
  messagingSenderId: "1049726949302",
  appId: "1:1049726949302:web:8a7f6c9f0e1d2b3c4a5e6f"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Email template content
const emailTemplate = {
  subject: "You've been invited to join a pet household on Tailr",

  html: `<!DOCTYPE html>
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
</html>`,

  text: `You've been invited to join a pet household on Tailr!

Hi there,

{{inviterName}} has invited you to join their pet household on Tailr.

Tailr helps you track daily activities, medical records, and care coordination for your pets - all in real-time across devices.

Accept your invitation here:
{{inviteUrl}}

This invitation will expire in 7 days.

---
© 2026 Tailr - Pet Activity Logger`
}

async function setupEmailTemplate() {
  try {
    console.log('📧 Creating email template in Firestore...')

    // Create the mail_templates collection and household-invite document
    const templateRef = doc(db, 'mail_templates', 'household-invite')
    await setDoc(templateRef, emailTemplate)

    console.log('✅ Email template created successfully!')
    console.log('\nTemplate details:')
    console.log('  Collection: mail_templates')
    console.log('  Document ID: household-invite')
    console.log('  Subject:', emailTemplate.subject)
    console.log('\n✨ Done! The Firebase Email Trigger extension can now use this template.')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating email template:', error)
    console.log('\n💡 Note: Make sure Firestore security rules allow writes to mail_templates')
    process.exit(1)
  }
}

setupEmailTemplate()
