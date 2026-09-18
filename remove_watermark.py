import cv2
import glob
import numpy as np

def remove_gemini_watermark():
    # Coords of the watermark in the 1280x720 video frames
    # The star is located at center ~(1159, 599)
    y0, y1, x0, x1 = 530, 670, 1050, 1250

    # Build local mask for the 4-point sparkle star
    crop_h, crop_w = y1 - y0, x1 - x0
    mask = np.zeros((crop_h, crop_w), dtype=np.uint8)

    # Star geometry relative to crop
    cx, cy = 109, 69
    pts = np.array([
        [cx, cy - 23],
        [cx + 7, cy - 7],
        [cx + 23, cy],
        [cx + 7, cy + 7],
        [cx, cy + 23],
        [cx - 7, cy + 7],
        [cx - 23, cy],
        [cx - 7, cy - 7]
    ], dtype=np.int32)
    cv2.fillPoly(mask, [pts], 255)
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))

    frames = sorted(glob.glob("frames/frame_*.jpg"))
    print(f"Cleaning watermark from {len(frames)} frames...")

    for fpath in frames:
        img = cv2.imread(fpath)
        sub = img[y0:y1, x0:x1]
        clean_sub = cv2.inpaint(sub, mask, 4, cv2.INPAINT_TELEA)
        img[y0:y1, x0:x1] = clean_sub
        cv2.imwrite(fpath, img, [cv2.IMWRITE_JPEG_QUALITY, 96])

    print("All frames cleaned successfully!")

if __name__ == "__main__":
    remove_gemini_watermark()
