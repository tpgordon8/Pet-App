# Firebase Email Trigger Setup Guide

## Overview

The Tailr app includes email invitation functionality that uses the Firebase Trigger Email extension. This document provides step-by-step instructions to configure email sending in the Firebase Console.

## Prerequisites

- Firebase project: `petlog-c4c1e`
- Firebase Console access: https://console.firebase.google.com/project/petlog-c4c1e
- Admin permissions on the Firebase project

## Setup Instructions

### Step 1: Install the Trigger Email Extension

1. **Navigate to Firebase Console**
   - Go to https://console.firebase.google.com/project/petlog-c4c1e
   - Click on "Extensions" in the left sidebar
   - Click "Install Extension" or "Browse Extensions"

2. **Find and Install "Trigger Email"**
   - Search for "Trigger Email" (by Firebase)
   - Click "Install"
   - Review the extension details and billing information
   - Click "Install extension"

3. **Configure Extension Settings**

   During installation, you'll be prompted to configure:

   **a. Extension Configuration**
   - Cloud Functions location: `us-central1` (or your preferred region)
   - SMTP connection URI: See Step 2 below for SMTP setup
   - Email documents collection: `mail`
   - Default FROM address: Your desired sender email (e.g., `noreply@tailr.app` or `hello@tailr.app`)
   - Default REPLY-TO address: Your support email (optional)
   - Users collection: Leave blank (not using Firebase Auth users collection)
   - Templates collection: `mail_templates` (we'll set this up in Step 3)

   **b. Advanced Configuration**
   - Testing options: OFF (unless you want to enable test mode)
   - Enable logging: ON (recommended for debugging)

4. **Grant Necessary Permissions**
   - The extension will request permissions to:
     - Access your Realtime Database
     - Send emails via SMTP
     - Write logs to Cloud Logging
   - Click "Grant" to proceed

### Step 2: Configure SMTP Settings

You need an SMTP server to send emails. Choose one of these options:

#### Option A: Gmail (For Testing/Low Volume)

1. **Create an App Password** (if using Gmail)
   - Go to your Google Account settings
   - Enable 2-Step Verification (if not already enabled)
   - Go to "App passwords" section
   - Generate a new app password for "Mail"
   - Copy the 16-character password

2. **SMTP Connection URI Format**
   ```
   smtps://username:password@smtp.gmail.com:465
   ```

   Replace `username` with your Gmail address and `password` with the app password.

   Example:
   ```
   smtps://tailr.app@gmail.com:abcdwxyzefgh1234@smtp.gmail.com:465
   ```

#### Option B: SendGrid (Recommended for Production)

1. **Create SendGrid Account**
   - Sign up at https://sendgrid.com
   - Verify your sender identity
   - Create an API key

2. **SMTP Connection URI Format**
   ```
   smtps://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:465
   ```

#### Option C: AWS SES (For High Volume)

1. **Set up AWS SES**
   - Create AWS account
   - Set up SES in your region
   - Verify your domain or email
   - Create SMTP credentials

2. **SMTP Connection URI Format**
   ```
   smtps://USERNAME:PASSWORD@email-smtp.us-east-1.amazonaws.com:465
   ```

### Step 3: Create Email Templates

The app uses a template called `household-invite`. Create this in the Firebase Realtime Database:

1. **Navigate to Realtime Database**
   - Go to Firebase Console → Realtime Database
   - Click on the `petlog-c4c1e-default-rtdb` database

2. **Create Templates Collection**
   - Click the "+" icon at the root level
   - Add new key: `mail_templates`
   - Click the "+" icon under `mail_templates`
   - Add new key: `household-invite`

3. **Add Template Structure**
   ```json
   {
     "mail_templates": {
       "household-invite": {
         "subject": "You're invited to join {{householdName}} on Tailr!",
         "html": "<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background:#8B9A7D;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0}.content{background:#f9fafb;padding:30px;border:1px solid #e5e7eb}.button{display:inline-block;background:#8B9A7D;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;margin:20px 0}.footer{text-align:center;color:#6b7280;font-size:12px;margin-top:30px}</style></head><body><div class='header'><h1>🐾 Tailr</h1></div><div class='content'><h2>Hi {{recipientName}}!</h2><p>{{inviterName}} has invited you to join their household <strong>{{householdName}}</strong> on Tailr, the pet activity tracking app.</p><p>With Tailr, you can:</p><ul><li>📝 Track daily activities (food, walks, bathroom breaks)</li><li>🏥 Record medical visits and vaccinations</li><li>📊 View activity insights and trends</li><li>🔄 Real-time sync across all devices</li></ul><p>Click the button below to join:</p><a href='{{inviteLink}}' class='button'>Join {{householdName}}</a><p>Or use this household code: <strong>{{householdCode}}</strong></p><p>See you soon!</p></div><div class='footer'><p>Tailr - Pet Activity Logger</p><p>If you didn't expect this invitation, you can safely ignore this email.</p></div></body></html>",
         "text": "Hi {{recipientName}}!\n\n{{inviterName}} has invited you to join their household {{householdName}} on Tailr.\n\nJoin now: {{inviteLink}}\n\nOr use household code: {{householdCode}}\n\nTailr - Pet Activity Logger"
       }
     }
   }
   ```

4. **Save the Template**
   - Click the "✓" checkmark to save

### Step 4: Update Database Rules (Optional)

If you want to allow users to write to the `mail` collection, update your database rules:

1. Go to Firebase Console → Realtime Database → Rules
2. Add this rule to allow authenticated users to create mail documents:

```json
{
  "rules": {
    "mail": {
      "$mailId": {
        ".write": "auth != null",
        ".read": false
      }
    }
  }
}
```

**Note:** The Trigger Email extension will automatically handle reading and processing documents from the `mail` collection.

### Step 5: Test the Email Functionality

1. **Run the Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to the App**
   - Open http://localhost:3000 in your browser
   - Complete onboarding if needed
   - Go to Settings (gear icon)
   - Click "Invite Member"

3. **Send a Test Invite**
   - Enter a test email address
   - Enter a name
   - Click "Send Invite"

4. **Monitor the Email Delivery**
   - Go to Firebase Console → Realtime Database
   - Navigate to the `mail` collection
   - You should see a new document with status changing from `pending` → `processing` → `success`
   - Check the recipient's inbox for the email

### Step 6: Monitor and Debug

1. **Check Extension Logs**
   - Go to Firebase Console → Extensions
   - Click on "Trigger Email"
   - Click "Logs" tab
   - Look for any errors or warnings

2. **Check Cloud Functions Logs**
   - Go to Firebase Console → Functions
   - Find the `ext-firestore-send-email-*` functions
   - Check execution logs

3. **Common Issues and Solutions**

   **Problem:** Emails not sending
   - **Solution:** Verify SMTP credentials are correct
   - Check extension logs for authentication errors
   - Ensure SMTP URI format is correct

   **Problem:** Emails going to spam
   - **Solution:** Set up SPF, DKIM, and DMARC records for your domain
   - Use a verified sender address
   - Consider using SendGrid or AWS SES

   **Problem:** Template not found
   - **Solution:** Verify template exists in `mail_templates/household-invite`
   - Check template name spelling matches exactly

## Email Delivery Status

The extension automatically updates the status field in each mail document:

- `pending`: Email queued, not yet processed
- `processing`: Extension is sending the email
- `success`: Email sent successfully
- `error`: Email failed to send (check delivery.error field)

## Cost Considerations

- **Firebase Extensions:** Free (included in Firebase)
- **Cloud Functions:** Pay-per-invocation (free tier: 2M invocations/month)
- **SMTP Service:**
  - Gmail: Free (500 emails/day limit)
  - SendGrid: Free tier (100 emails/day)
  - AWS SES: $0.10 per 1,000 emails

## Security Best Practices

1. **Never commit SMTP credentials to git**
   - Keep them in Firebase Console configuration only

2. **Use App Passwords for Gmail**
   - Don't use your actual Gmail password

3. **Restrict Email Sending**
   - Add rate limiting to prevent abuse
   - Validate recipient emails before sending

4. **Monitor Usage**
   - Set up billing alerts
   - Review email logs regularly

## Additional Resources

- [Firebase Trigger Email Extension Documentation](https://firebase.google.com/products/extensions/firestore-send-email)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)

## Support

If you encounter issues:
1. Check Firebase Console → Extensions → Trigger Email → Logs
2. Review Cloud Functions logs
3. Verify SMTP credentials
4. Test with a different SMTP provider

---

**Last Updated:** 2026-03-16
**Project:** Tailr (petlog-c4c1e)
**Contact:** [Your email/support contact]
