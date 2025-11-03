# Weapon Detection Backend

FastAPI backend server for real-time weapon detection using YOLOv8 and webcam streaming.

## Features

- Real-time webcam streaming with YOLO object detection
- RESTful API endpoints for stream control
- CORS enabled for frontend integration
- Automatic model loading and camera initialization
- **Email notifications for threat alerts (≥50% confidence)**
- Detection logging and statistics tracking

## Prerequisites

- Python 3.8 or higher
- Webcam/camera device
- YOLO model weights at `./runs/detect/Normal_Compressed/weights/best.pt`

## Installation

### Step 1: Install Python Dependencies

```bash
# Create virtual environment (optional but recommended)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

### Step 2: Install Node.js Dependencies (for email notifications)

```bash
npm install
```

### Step 3: Configure Email Notifications

1. Create `.env` file in the backend folder:
```env
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=imagelabenforcers@gmail.com
EMAIL_TO=shyam2003raj666@gmail.com
```

2. See `EMAIL_SETUP.md` for detailed instructions on generating Gmail App Password

### Step 4: Run the Server

```bash
python app.py
```

Server will start on `http://localhost:8000`

## API Endpoints

### GET `/api/video_feed`
Streams live webcam feed with YOLO detection annotations.

**Response:** Multipart MJPEG stream

### POST `/api/start_stream`
Starts the webcam stream.

**Response:**
```json
{
  "status": "success",
  "message": "Stream started"
}
```

### POST `/api/stop_stream`
Stops the webcam stream.

**Response:**
```json
{
  "status": "success",
  "message": "Stream stopped"
}
```

### GET `/api/status`
Get current streaming status.

**Response:**
```json
{
  "is_streaming": true,
  "model_loaded": true,
  "camera_active": true
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Configuration

- **Server Port:** 8000 (default)
- **Host:** 0.0.0.0 (accessible from all network interfaces)
- **Camera Index:** 0 (default webcam)
- **Detection Threshold:** 0.5 (50% confidence)

To change the camera index, modify the `camera_index` parameter in `app.py`.

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

### Camera Not Found
- Ensure your webcam is connected and not in use by another application
- Try changing the camera index in the code (0, 1, 2, etc.)

### Model Not Found
- Verify the YOLO model weights exist at `./runs/detect/Normal_Compressed/weights/best.pt`
- Check the model path in `app.py`

### Port Already in Use
- Change the port in `app.py` (line with `uvicorn.run`)
- Or kill the process using port 8000

### CORS Issues
- The server is configured to allow all origins (`*`)
- For production, update the `allow_origins` list in `app.py`

## Performance Tips

- The server runs at ~30 FPS by default
- Adjust frame delay in `generate_frames()` for different frame rates
- Lower camera resolution for better performance
- Use GPU acceleration if available (CUDA-enabled PyTorch)

## Integration with Frontend

The frontend should connect to:
- Video stream: `http://localhost:8000/api/video_feed`
- Control endpoints: `http://localhost:8000/api/*`

Make sure both backend and frontend servers are running simultaneously.
