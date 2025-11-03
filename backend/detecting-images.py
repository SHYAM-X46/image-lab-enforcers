import cv2
from ultralytics import YOLO
import argparse
import torch
from torch.serialization import add_safe_globals
from ultralytics.nn.tasks import DetectionModel
from torch.nn.modules.container import Sequential, ModuleList, ModuleDict

# Allowlist Ultralytics DetectionModel for PyTorch safe loading (torch 2.6+)
add_safe_globals([DetectionModel, Sequential, ModuleList, ModuleDict])

# Ensure legacy checkpoints load: default torch.load to weights_only=False (trusted local checkpoint)
_orig_torch_load = torch.load
def _torch_load_patched(*args, **kwargs):
    kwargs.setdefault('weights_only', False)
    return _orig_torch_load(*args, **kwargs)
torch.load = _torch_load_patched

def detect_objects_in_photo(image_path):
    image_orig = cv2.imread(image_path)
    
    yolo_model = YOLO('./runs/detect/Normal_Compressed/weights/best.pt')
    
    results = yolo_model(image_orig)

    for result in results:
        classes = result.names
        cls = result.boxes.cls
        conf = result.boxes.conf
        detections = result.boxes.xyxy

        for pos, detection in enumerate(detections):
            if conf[pos] >= 0.5:
                xmin, ymin, xmax, ymax = detection
                label = f"{classes[int(cls[pos])]} {conf[pos]:.2f}" 
                color = (0, int(cls[pos]), 255)
                cv2.rectangle(image_orig, (int(xmin), int(ymin)), (int(xmax), int(ymax)), color, 2)
                cv2.putText(image_orig, label, (int(xmin), int(ymin) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)

    result_path = "./imgs/Test/teste.jpg"
    cv2.imwrite(result_path, image_orig)
    return result_path

def detect_objects_in_video(video_path):
    yolo_model = YOLO('./runs/detect/Normal_Compressed/weights/best.pt')
    video_capture = cv2.VideoCapture(video_path)
    width = int(video_capture.get(3))
    height = int(video_capture.get(4))
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    result_video_path = "detected_objects_video2.avi"
    out = cv2.VideoWriter(result_video_path, fourcc, 20.0, (width, height))

    while True:
        ret, frame = video_capture.read()
        if not ret:
            break
        results = yolo_model(frame)

        for result in results:
            classes = result.names
            cls = result.boxes.cls
            conf = result.boxes.conf
            detections = result.boxes.xyxy

            for pos, detection in enumerate(detections):
                if conf[pos] >= 0.5:
                    xmin, ymin, xmax, ymax = detection
                    label = f"{classes[int(cls[pos])]} {conf[pos]:.2f}" 
                    color = (0, int(cls[pos]), 255)
                    cv2.rectangle(frame, (int(xmin), int(ymin)), (int(xmax), int(ymax)), color, 2)
                    cv2.putText(frame, label, (int(xmin), int(ymin) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)

        out.write(frame)
    video_capture.release()
    out.release()

    return result_video_path

def detect_objects_and_plot(path_orig):
    image_orig = cv2.imread(path_orig)
    
    yolo_model = YOLO('./runs/detect/Normal_Compressed/weights/best.pt')
    
    results = yolo_model(image_orig)

    for result in results:
        classes = result.names
        cls = result.boxes.cls
        conf = result.boxes.conf
        detections = result.boxes.xyxy

        for pos, detection in enumerate(detections):
            if conf[pos] >= 0.5:
                xmin, ymin, xmax, ymax = detection
                label = f"{classes[int(cls[pos])]} {conf[pos]:.2f}" 
                color = (0, int(cls[pos]), 255)
                cv2.rectangle(image_orig, (int(xmin), int(ymin)), (int(xmax), int(ymax)), color, 2)
                cv2.putText(image_orig, label, (int(xmin), int(ymin) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)
    
    cv2.imshow("Teste", image_orig)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def detect_objects_realtime(camera_index=0, save_video=False):
    """
    Realtime weapon detection using webcam.
    Press 'q' to quit.
    
    Args:
        camera_index: Camera device index (0 for default webcam)
        save_video: If True, saves the annotated video to file
    """
    import os
    yolo_model = YOLO('./runs/detect/Normal_Compressed/weights/best.pt')
    cap = cv2.VideoCapture(camera_index)
    
    if not cap.isOpened():
        print(f"Error: Could not open camera {camera_index}")
        return None
    
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 20
    
    out = None
    result_video_path = None
    if save_video:
        result_video_path = os.path.abspath("realtime_detection.avi")
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(result_video_path, fourcc, fps, (width, height))
        
        if not out.isOpened():
            print(f"Warning: Could not initialize video writer. Video will not be saved.")
            out = None
        else:
            print(f"Recording video to: {result_video_path}")
    
    print("Starting realtime detection...")
    print("Press 'q' to quit")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to read frame")
            break
        
        results = yolo_model(frame)
        
        for result in results:
            classes = result.names
            cls = result.boxes.cls
            conf = result.boxes.conf
            detections = result.boxes.xyxy
            
            for pos, detection in enumerate(detections):
                if conf[pos] >= 0.5:
                    xmin, ymin, xmax, ymax = detection
                    label = f"{classes[int(cls[pos])]} {conf[pos]:.2f}"
                    color = (0, int(cls[pos]), 255)
                    cv2.rectangle(frame, (int(xmin), int(ymin)), (int(xmax), int(ymax)), color, 2)
                    cv2.putText(frame, label, (int(xmin), int(ymin) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)
        
        if out is not None:
            out.write(frame)
        
        cv2.imshow("Realtime Weapon Detection", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("Quitting...")
            break
    
    cap.release()
    if out is not None:
        out.release()
        import os
        if os.path.exists(result_video_path):
            file_size = os.path.getsize(result_video_path) / (1024 * 1024)  # MB
            print(f"\nVideo saved successfully!")
            print(f"Location: {result_video_path}")
            print(f"Size: {file_size:.2f} MB")
        else:
            print(f"\nWarning: Video file was not created at {result_video_path}")
    cv2.destroyAllWindows()
    
    return result_video_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Weapon Detection System using YOLOv8")
    parser.add_argument("--image", type=str, help="Path to an input image")
    parser.add_argument("--video", type=str, help="Path to an input video")
    parser.add_argument("--webcam", action="store_true", help="Use webcam for realtime detection")
    parser.add_argument("--camera", type=int, default=0, help="Camera device index (default: 0)")
    parser.add_argument("--show", action="store_true", help="Show annotated image in a window instead of saving")
    parser.add_argument("--save-video", action="store_true", help="Save realtime detection video to file")
    args = parser.parse_args()

    # Count how many modes are selected
    modes = sum([bool(args.image), bool(args.video), args.webcam])
    if modes > 1:
        print("Error: Provide only one of --image, --video, or --webcam")
        raise SystemExit(1)
    
    if modes == 0:
        print("Error: Please provide --image, --video, or --webcam")
        parser.print_help()
        raise SystemExit(2)

    if args.image:
        if args.show:
            detect_objects_and_plot(args.image)
        else:
            out_path = detect_objects_in_photo(args.image)
            print(f"Annotated image saved to: {out_path}")
    elif args.video:
        out_video = detect_objects_in_video(args.video)
        print(f"Annotated video saved to: {out_video}")
    elif args.webcam:
        detect_objects_realtime(camera_index=args.camera, save_video=args.save_video)