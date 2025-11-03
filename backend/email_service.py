import subprocess
import json
import os
from datetime import datetime
from typing import Dict, Optional

class EmailNotificationService:
    """Service to send email notifications for threat detections"""
    
    def __init__(self, threshold: float = 0.5):
        """
        Initialize email notification service
        
        Args:
            threshold: Confidence threshold for sending alerts (default: 0.5 = 50%)
        """
        self.threshold = threshold
        self.last_alert_time = {}
        self.cooldown_seconds = 60  # Prevent spam - send max 1 email per minute per detection type
        
    def should_send_alert(self, detection_class: str, confidence: float) -> bool:
        """
        Check if an alert should be sent based on confidence and cooldown
        
        Args:
            detection_class: Type of weapon detected
            confidence: Detection confidence (0-1)
            
        Returns:
            bool: True if alert should be sent
        """
        # Check confidence threshold
        if confidence < self.threshold:
            return False
        
        # Check cooldown
        current_time = datetime.now()
        if detection_class in self.last_alert_time:
            time_diff = (current_time - self.last_alert_time[detection_class]).total_seconds()
            if time_diff < self.cooldown_seconds:
                return False
        
        return True
    
    def send_alert(self, detection: Dict) -> Optional[Dict]:
        """
        Send email alert for a detection
        
        Args:
            detection: Dictionary with keys: class, confidence, timestamp, location
            
        Returns:
            Dict with success status or None if not sent
        """
        detection_class = detection.get('class', 'Unknown')
        confidence = detection.get('confidence', 0)
        
        if not self.should_send_alert(detection_class, confidence):
            return None
        
        try:
            # Prepare detection data
            detection_data = {
                'class': detection_class,
                'confidence': confidence,
                'timestamp': detection.get('timestamp', datetime.now().isoformat()),
                'location': detection.get('location', 'CCTV-1')
            }
            
            # Call Node.js email script
            script_path = os.path.join(os.path.dirname(__file__), 'send_email.js')
            result = subprocess.run(
                ['node', script_path, json.dumps(detection_data)],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                print(f"✅ Email alert sent for {detection_class} detection ({confidence*100:.1f}% confidence)")
                self.last_alert_time[detection_class] = datetime.now()
                return {'success': True, 'message': 'Email sent successfully'}
            else:
                print(f"❌ Failed to send email: {result.stderr}")
                return {'success': False, 'error': result.stderr}
                
        except subprocess.TimeoutExpired:
            print("❌ Email sending timed out")
            return {'success': False, 'error': 'Timeout'}
        except FileNotFoundError:
            print("❌ Node.js not found. Please install Node.js to enable email notifications.")
            return {'success': False, 'error': 'Node.js not installed'}
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return {'success': False, 'error': str(e)}
