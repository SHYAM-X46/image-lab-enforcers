const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const EMAIL_CONFIG = {
    from: process.env.EMAIL_FROM || 'imagelabenforcers@gmail.com',
    to: process.env.EMAIL_TO || 'shyam2003raj666@gmail.com',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
};

// Validate email password
if (!process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  WARNING: EMAIL_PASSWORD not set in environment variables!');
    console.warn('Email notifications will not work without a valid Gmail App Password.');
    console.warn('Please create a .env file and set EMAIL_PASSWORD=your-app-password');
}

// Create transporter
const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: {
        user: EMAIL_CONFIG.from,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('Email transporter error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

/**
 * Send threat detection email
 * @param {Object} detection - Detection object with class, confidence, timestamp
 */
async function sendThreatAlert(detection) {
    const { class: weaponClass, confidence, timestamp, location = 'CCTV-1' } = detection;
    
    const confidencePercent = (confidence * 100).toFixed(2);
    
    const mailOptions = {
        from: `"Weapon Detection System" <${EMAIL_CONFIG.from}>`,
        to: EMAIL_CONFIG.to,
        subject: `🚨 THREAT ALERT: ${weaponClass} Detected (${confidencePercent}% confidence)`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        border-radius: 10px 10px 0 0;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .alert-icon {
                        font-size: 48px;
                        margin-bottom: 10px;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 30px;
                        border: 1px solid #ddd;
                        border-top: none;
                    }
                    .alert-box {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .threat-high {
                        background: #f8d7da;
                        border-left-color: #dc3545;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #666;
                    }
                    .detail-value {
                        color: #333;
                    }
                    .confidence-bar {
                        width: 100%;
                        height: 30px;
                        background: #e0e0e0;
                        border-radius: 15px;
                        overflow: hidden;
                        margin: 10px 0;
                    }
                    .confidence-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #ff6b6b 0%, #ee5a6f 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                    }
                    .footer {
                        background: #333;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 0 0 10px 10px;
                        font-size: 12px;
                    }
                    .action-required {
                        background: #dc3545;
                        color: white;
                        padding: 15px;
                        border-radius: 5px;
                        text-align: center;
                        font-weight: bold;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="alert-icon">🚨</div>
                    <h1>WEAPON DETECTION ALERT</h1>
                    <p style="margin: 5px 0 0 0;">Immediate Attention Required</p>
                </div>
                
                <div class="content">
                    <div class="alert-box ${confidence >= 0.8 ? 'threat-high' : ''}">
                        <h2 style="margin-top: 0; color: #721c24;">⚠️ Threat Detected</h2>
                        <p style="margin: 0;">A potential weapon has been detected by the AI surveillance system.</p>
                    </div>
                    
                    <h3>Detection Details:</h3>
                    
                    <div class="detail-row">
                        <span class="detail-label">Detected Object:</span>
                        <span class="detail-value"><strong>${weaponClass}</strong></span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Confidence Level:</span>
                        <span class="detail-value"><strong>${confidencePercent}%</strong></span>
                    </div>
                    
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidencePercent}%;">
                            ${confidencePercent}%
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${location}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Timestamp:</span>
                        <span class="detail-value">${new Date(timestamp).toLocaleString()}</span>
                    </div>
                    
                    <div class="detail-row" style="border-bottom: none;">
                        <span class="detail-label">Threat Level:</span>
                        <span class="detail-value" style="color: ${confidence >= 0.8 ? '#dc3545' : confidence >= 0.6 ? '#ffc107' : '#28a745'};">
                            <strong>${confidence >= 0.8 ? 'HIGH' : confidence >= 0.6 ? 'MEDIUM' : 'LOW'}</strong>
                        </span>
                    </div>
                    
                    ${confidence >= 0.8 ? `
                    <div class="action-required">
                        ⚠️ HIGH THREAT - IMMEDIATE ACTION REQUIRED
                    </div>
                    ` : ''}
                    
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">
                        <strong>Recommended Actions:</strong><br>
                        1. Review the live feed immediately<br>
                        2. Verify the threat with security personnel<br>
                        3. Follow your organization's security protocols<br>
                        4. Contact law enforcement if necessary
                    </p>
                </div>
                
                <div class="footer">
                    <p style="margin: 0;">AI-Based Weapon Detection System</p>
                    <p style="margin: 5px 0 0 0;">This is an automated alert. Do not reply to this email.</p>
                </div>
            </body>
            </html>
        `,
        text: `
WEAPON DETECTION ALERT

A potential weapon has been detected by the AI surveillance system.

Detection Details:
- Detected Object: ${weaponClass}
- Confidence Level: ${confidencePercent}%
- Location: ${location}
- Timestamp: ${new Date(timestamp).toLocaleString()}
- Threat Level: ${confidence >= 0.8 ? 'HIGH' : confidence >= 0.6 ? 'MEDIUM' : 'LOW'}

${confidence >= 0.8 ? 'HIGH THREAT - IMMEDIATE ACTION REQUIRED' : ''}

Recommended Actions:
1. Review the live feed immediately
2. Verify the threat with security personnel
3. Follow your organization's security protocols
4. Contact law enforcement if necessary

---
AI-Based Weapon Detection System
This is an automated alert. Do not reply to this email.
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Threat alert email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending threat alert email:', error);
        return { success: false, error: error.message };
    }
}

// Export the function
module.exports = {
    sendThreatAlert,
    transporter,
};

// Test function (uncomment to test)
// if (require.main === module) {
//     sendThreatAlert({
//         class: 'Gun',
//         confidence: 0.95,
//         timestamp: new Date().toISOString(),
//         location: 'CCTV-1'
//     }).then(result => {
//         console.log('Test email result:', result);
//         process.exit(0);
//     });
// }
