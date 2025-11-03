# Quick Start: Email Notifications

## 🚀 Setup in 5 Minutes

### 1. Generate Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Create app password for "Mail"
3. Copy the 16-character password

### 2. Configure Backend

Create `backend/.env` file:

```env
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=imagelabenforcers@gmail.com
EMAIL_TO=shyam2003raj666@gmail.com
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Test Email (Optional)

```bash
npm test
```

### 5. Run the System

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## ✅ Done!

The system will now send email alerts when:
- Weapon detected with **≥50% confidence**
- Maximum 1 email per minute per weapon type

## 📧 Email Details

- **From:** imagelabenforcers@gmail.com
- **To:** shyam2003raj666@gmail.com
- **Trigger:** Confidence ≥ 50%
- **Cooldown:** 60 seconds

## 🔧 Troubleshooting

**Email not sending?**
- Check `.env` file exists in `backend/` folder
- Verify App Password is correct (no spaces)
- Run `npm test` to test email configuration
- Check backend console for error messages

**Need detailed help?**
- See `backend/EMAIL_SETUP.md` for complete guide

## 📝 Example Email

When a weapon is detected, you'll receive:

```
Subject: 🚨 THREAT ALERT: Gun Detected (95.00% confidence)

Professional HTML email with:
✓ Weapon type and confidence
✓ Location and timestamp
✓ Threat level indicator
✓ Visual confidence bar
✓ Recommended actions
```

---

**That's it! You're ready to receive threat alerts via email.** 🎉
