import cv2
import os

def extract_frames(video_path="Create_a_cinematic_photoreali.mp4", output_dir="frames", quality=96):
    os.makedirs(output_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Video Source: {video_path}")
    print(f"Resolution: {width}x{height} | FPS: {fps} | Total Frames: {total_frames}")
    
    frame_idx = 1
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        filename = f"frame_{frame_idx:04d}.jpg"
        filepath = os.path.join(output_dir, filename)
        cv2.imwrite(filepath, frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
        frame_idx += 1
        
    cap.release()
    print(f"Successfully extracted {frame_idx - 1} frames to {output_dir}/")

if __name__ == "__main__":
    extract_frames()
