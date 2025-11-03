# Email Notification Setup Guide

This guide will help you set up email notifications for the weapon detection system.

## Overview

When the system detects a weapon with **confidence ≥ 50%**, it automatically sends an email alert to the configured recipient.

**Email Configuration:**
- **From:** imagelabenforcers@gmail.com
- **To:** shyam2003raj666@gmail.com
- **Threshold:** 50% confidence
- **Cooldown:** 60 seconds (prevents spam)

---

## Prerequisites

1. **Node.js** installed (v14 or higher)
2. **Gmail account** with 2-Step Verification enabled
3. **Gmail App Password** (not your regular password)

---

## Step 1: Generate Gmail App Password

### Why App Password?
Gmail requires App Passwords for third-party applications when 2-Step Verification is enabled.

### How to Generate:

1. **Go to Google Account Security:**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled):
   - Click "2-Step Verification"
   - Follow the setup process

3. **Generate App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - Or search for "App passwords" in your Google Account settings
   - Select app: **Mail**
   - Select device: **Windows Computer** (or your device)
   - Click **Generate**

4. **Copy the 16-character password:**
   - It will look like: `abcd efgh ijkl mnop`
   - Remove spaces: `abcdefghijklmnop`
   - **Save this password securely!**

---

## Step 2: Install Node.js Dependencies

Open terminal in the `backend` folder and run:

```bash
cd backend
npm install
```

This will install:
- `nodemailer` - Email sending library
- `dotenv` - Environment variable management

---

## Step 3: Configure Environment Variables

### Option A: Create .env file (Recommended)

1. Create a file named `.env` in the `backend` folder:

```bash
# In backend folder
touch .env
```

2. Add your configuration to `.env`:

```env
# Gmail App Password (16 characters, no spaces)
EMAIL_PASSWORD=abcdefghijklmnop

# Email addresses
EMAIL_FROM=imagelabenforcers@gmail.com
EMAIL_TO=shyam2003raj666@gmail.com

# Detection settings
CONFIDENCE_THRESHOLD=0.5
EMAIL_COOLDOWN_SECONDS=60
```

3. **IMPORTANT:** Never commit `.env` to version control!
   - It's already in `.gitignore`

### Option B: Set Environment Variables (Windows)

```powershell
$env:EMAIL_PASSWORD="your-app-password-here"
$env:EMAIL_FROM="imagelabenforcers@gmail.com"
$env:EMAIL_TO="shyam2003raj666@gmail.com"
```

### Option B: Set Environment Variables (Linux/Mac)

```bash
export EMAIL_PASSWORD="your-app-password-here"
export EMAIL_FROM="imagelabenforcers@gmail.com"
export EMAIL_TO="shyam2003raj666@gmail.com"
```

---

## Step 4: Test Email Configuration

Test the email system before running the full application:

```bash
cd backend
npm test
```

Or manually test:

```bash
node send_email.js '{"class":"Gun","confidence":0.95,"timestamp":"2024-01-01T00:00:00Z","location":"CCTV-1"}'
```

**Expected Output:**
```
Email server is ready to send messages
✅ Threat alert email sent successfully: <message-id>
Email sent successfully
```

**If you see errors:**
- Check your App Password is correct
- Verify 2-Step Verification is enabled
- Ensure no spaces in the password
- Check your internet connection

---

## Step 5: Run the System

Start the backend server:

```bash
cd backend
python app.py
```

The email notification system is now active!

---

## How It Works

### Detection Flow:

1. **Camera captures frame** → YOLO detects weapon
2. **Confidence check:** Is it ≥ 50%?
3. **Cooldown check:** Has 60 seconds passed since last alert for this weapon type?
4. **Send email:** Beautiful HTML email with detection details
5. **Log:** Record in detection logs

### Email Features:

✅ **Professional HTML design** with color-coded threat levels
✅ **Detailed information:** Weapon type, confidence, location, timestamp
✅ **Threat level indicators:** High (≥80%), Medium (≥60%), Low (<60%)
✅ **Confidence bar visualization**
✅ **Recommended actions** for security personnel
✅ **Plain text fallback** for email clients that don't support HTML

### Cooldown System:

- Prevents email spam
- One email per weapon type per 60 seconds
- Example: If "Gun" detected at 10:00:00, next email for "Gun" can be sent at 10:01:00
- Different weapon types have independent cooldowns

---

## Customization

### Change Email Addresses

Edit `.env` file:
```env
EMAIL_FROM=your-sender@gmail.com
EMAIL_TO=recipient@example.com
```

### Change Confidence Threshold

Edit `.env` file:
```env
CONFIDENCE_THRESHOLD=0.7  # 70% threshold
```

Or edit `backend/app.py` line 46:
```python
email_service = EmailNotificationService(threshold=0.7)  # 70% threshold
```

### Change Cooldown Period

Edit `.env` file:
```env
EMAIL_COOLDOWN_SECONDS=120  # 2 minutes
```

Or edit `backend/email_service.py` line 15:
```python
self.cooldown_seconds = 120  # 2 minutes
```

### Customize Email Template

Edit `backend/email_notifier.js` starting at line 45 to modify:
- Email subject
- HTML template
- Colors and styling
- Content and messaging

---

## Troubleshooting

### "Email transporter error: Invalid login"
- **Solution:** Check your App Password is correct
- Ensure you're using App Password, not regular Gmail password
- Verify 2-Step Verification is enabled

### "Error: getaddrinfo ENOTFOUND smtp.gmail.com"
- **Solution:** Check your internet connection
- Verify firewall isn't blocking SMTP (port 587)

### "Node.js not found"
- **Solution:** Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Cannot find module 'nodemailer'"
- **Solution:** Run `npm install` in the backend folder

### Emails not being sent
- Check backend console for error messages
- Verify confidence threshold is being met (≥50%)
- Check cooldown period hasn't blocked the email
- Test with `npm test` command

### "EMAIL_PASSWORD not set"
- **Solution:** Create `.env` file with EMAIL_PASSWORD
- Or set environment variable before running

---

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use App Passwords** instead of regular passwords
3. **Rotate App Passwords** periodically
4. **Limit email recipients** to authorized personnel only
5. **Monitor email logs** for suspicious activity
6. **Use HTTPS** in production environments

---

## Email Example

When a weapon is detected, recipients receive an email like this:

```
Subject: 🚨 THREAT ALERT: Gun Detected (95.00% confidence)

[Professional HTML email with:]
- Alert header with warning icon
- Detection details (weapon type, confidence, location, time)
- Visual confidence bar
- Threat level indicator
- Recommended actions
- System branding
```

---

## Support

If you encounter issues:

1. Check the backend console for error messages
2. Test email configuration with `npm test`
3. Verify all prerequisites are met
4. Review this guide carefully
5. Check Gmail security settings

---

## Summary Checklist

- [ ] Node.js installed
- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated
- [ ] `.env` file created with EMAIL_PASSWORD
- [ ] Dependencies installed (`npm install`)
- [ ] Email tested successfully (`npm test`)
- [ ] Backend server running (`python app.py`)
- [ ] Frontend running (`npm run dev`)

**You're all set! The system will now send email alerts for weapon detections above 50% confidence.** 🎉
