#!/usr/bin/env node

const { sendThreatAlert } = require('./email_notifier');

// Get detection data from command line argument
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Error: No detection data provided');
    console.error('Usage: node send_email.js \'{"class":"Gun","confidence":0.95,"timestamp":"...","location":"CCTV-1"}\'');
    process.exit(1);
}

try {
    const detection = JSON.parse(args[0]);
    
    // Validate detection data
    if (!detection.class || detection.confidence === undefined) {
        console.error('Error: Invalid detection data. Required fields: class, confidence');
        process.exit(1);
    }
    
    // Send the alert
    sendThreatAlert(detection)
        .then(result => {
            if (result.success) {
                console.log('Email sent successfully');
                process.exit(0);
            } else {
                console.error('Failed to send email:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            process.exit(1);
        });
        
} catch (error) {
    console.error('Error parsing detection data:', error.message);
    process.exit(1);
}
