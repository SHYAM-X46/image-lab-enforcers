from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
from ultralytics import YOLO
import torch
from torch.serialization import add_safe_globals
from ultralytics.nn.tasks import DetectionModel
from torch.nn.modules.container import Sequential, ModuleList, ModuleDict
import asyncio
from typing import Optional, List, Dict
import uvicorn
from datetime import datetime
from collections import deque
from email_service import EmailNotificationService

# Allowlist Ultralytics DetectionModel for PyTorch safe loading (torch 2.6+)
add_safe_globals([DetectionModel, Sequential, ModuleList, ModuleDict])

# Ensure legacy checkpoints load: default torch.load to weights_only=False (trusted local checkpoint)
_orig_torch_load = torch.load
def _torch_load_patched(*args, **kwargs):
    kwargs.setdefault('weights_only', False)
    return _orig_torch_load(*args, **kwargs)
torch.load = _torch_load_patched

app = FastAPI(title="Weapon Detection API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
camera: Optional[cv2.VideoCapture] = None
yolo_model: Optional[YOLO] = None
is_streaming = False
detection_logs: deque = deque(maxlen=100)  # Store last 100 detections
recent_detections: List[Dict] = []  # Current detections in frame
total_detections = 0
start_time = datetime.now()
email_service = EmailNotificationService(threshold=0.5)  # 50% confidence threshold

def initialize_model():
    """Initialize YOLO model"""
    global yolo_model
    if yolo_model is None:
        print("Loading YOLO model...")
        yolo_model = YOLO('./runs/detect/Normal_Compressed/weights/best.pt')
        print("YOLO model loaded successfully!")

def initialize_camera(camera_index: int = 0) -> bool:
    """Initialize camera"""
    global camera
    if camera is None or not camera.isOpened():
        print(f"Initializing camera {camera_index}...")
        camera = cv2.VideoCapture(camera_index)
        if not camera.isOpened():
            print(f"Error: Could not open camera {camera_index}")
            return False
        # Set camera properties for better performance
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera.set(cv2.CAP_PROP_FPS, 30)
        print("Camera initialized successfully!")
    return True

def detect_and_annotate_frame(frame):
    """Run YOLO detection on frame and annotate it"""
    global yolo_model
    
    if yolo_model is None:
        initialize_model()
    
    results = yolo_model(frame, verbose=False)
    
    detections_list = []
    
    for result in results:
        classes = result.names
        cls = result.boxes.cls
        conf = result.boxes.conf
        detections = result.boxes.xyxy
        
        for pos, detection in enumerate(detections):
            if conf[pos] >= 0.5:
                xmin, ymin, xmax, ymax = detection
                class_name = classes[int(cls[pos])]
                confidence = float(conf[pos])
                label = f"{class_name} {confidence:.2f}"
                
                # Color based on class
                color = (0, min(int(cls[pos]) * 50, 255), 255)
                
                # Draw bounding box
                cv2.rectangle(frame, (int(xmin), int(ymin)), (int(xmax), int(ymax)), color, 2)
                
                # Draw label background
                label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(frame, (int(xmin), int(ymin) - label_size[1] - 10), 
                            (int(xmin) + label_size[0], int(ymin)), color, -1)
                
                # Draw label text
                cv2.putText(frame, label, (int(xmin), int(ymin) - 5), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
                
                detections_list.append({
                    'class': class_name,
                    'confidence': confidence,
                    'bbox': [float(xmin), float(ymin), float(xmax), float(ymax)]
                })
    
    # Update global detection tracking
    global total_detections, recent_detections, detection_logs, email_service
    if detections_list:
        recent_detections = detections_list
        for det in detections_list:
            total_detections += 1
            timestamp = datetime.now().isoformat()
            log_entry = {
                'id': str(total_detections),
                'timestamp': timestamp,
                'object': det['class'],
                'confidence': det['confidence'],
                'location': 'CCTV-1',
                'status': 'high' if det['confidence'] >= 0.8 else 'medium' if det['confidence'] >= 0.6 else 'low',
                'email_sent': False
            }
            detection_logs.append(log_entry)
            
            # Send email alert if confidence is above threshold (50%)
            email_data = {
                'class': det['class'],
                'confidence': det['confidence'],
                'timestamp': timestamp,
                'location': 'CCTV-1'
            }
            result = email_service.send_alert(email_data)
            if isinstance(result, dict) and result.get('success'):
                # update the same log entry to reflect email sent
                log_entry['email_sent'] = True
    else:
        recent_detections = []
    
    return frame, detections_list

async def generate_frames():
    """Generate frames from camera with YOLO detection"""
    global camera, is_streaming
    
    initialize_model()
    
    if not initialize_camera():
        return
    
    is_streaming = True
    print("Starting frame generation...")
    
    try:
        while is_streaming:
            success, frame = camera.read()
            if not success:
                print("Failed to read frame from camera")
                await asyncio.sleep(0.1)
                continue
            
            # Run detection and annotation
            annotated_frame, _ = detect_and_annotate_frame(frame)
            
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if not ret:
                continue
            
            frame_bytes = buffer.tobytes()
            
            # Yield frame in multipart format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # Small delay to control frame rate (~30 FPS)
            await asyncio.sleep(0.033)
    except Exception as e:
        print(f"Error in frame generation: {e}")
    finally:
        print("Frame generation stopped")

@app.get("/api/video_feed")
async def video_feed():
    """Video streaming endpoint"""
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.post("/api/start_stream")
async def start_stream():
    """Start the video stream"""
    global is_streaming
    
    if not is_streaming:
        initialize_model()
        if initialize_camera():
            is_streaming = True
            return {"status": "success", "message": "Stream started"}
        else:
            return {"status": "error", "message": "Failed to initialize camera"}
    
    return {"status": "success", "message": "Stream already running"}

@app.post("/api/stop_stream")
async def stop_stream():
    """Stop the video stream"""
    global is_streaming, camera
    
    is_streaming = False
    
    if camera is not None:
        camera.release()
        camera = None
    
    return {"status": "success", "message": "Stream stopped"}

@app.get("/api/status")
async def status():
    """Get streaming status"""
    return {
        "is_streaming": is_streaming,
        "model_loaded": yolo_model is not None,
        "camera_active": camera is not None and camera.isOpened()
    }

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/api/detections")
async def get_detections():
    """Get current detections in the frame"""
    return {
        "detections": recent_detections,
        "count": len(recent_detections)
    }

@app.get("/api/logs")
async def get_logs():
    """Get detection logs"""
    return {
        "logs": list(detection_logs),
        "total": len(detection_logs)
    }

@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics"""
    global total_detections, start_time, is_streaming
    
    # Calculate uptime
    uptime = datetime.now() - start_time
    uptime_hours = uptime.total_seconds() / 3600
    
    # Determine threat level based on recent detections
    threat_level = "Low"
    if recent_detections:
        max_confidence = max([d['confidence'] for d in recent_detections])
        if max_confidence >= 0.8:
            threat_level = "High"
        elif max_confidence >= 0.6:
            threat_level = "Medium"
    
    return {
        "total_detections": total_detections,
        "active_cameras": 1 if is_streaming else 0,
        "uptime_hours": round(uptime_hours, 2),
        "threat_level": threat_level,
        "current_detections": len(recent_detections)
    }

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup"""
    print("Starting FastAPI server...")
    print("Server will be available at http://localhost:8000")
    print("Video feed endpoint: http://localhost:8000/api/video_feed")
    print("API docs: http://localhost:8000/docs")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown"""
    global camera, is_streaming
    print("\nShutting down...")
    is_streaming = False
    if camera is not None:
        camera.release()
        camera = None
    cv2.destroyAllWindows()

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
