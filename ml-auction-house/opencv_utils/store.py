import cv2
import numpy as np
import opencv_utils.const as const
import pytesseract

def is_sold(region):
    """ Determine if a region represents a 'sold' item by checking brightness.
    
        Args:
            region (numpy.ndarray): The region to analyze.
        
        Returns:
            bool: True if the region is likely 'sold', False if it is 'available'.
    """
    # Calculate average brightness in the region
    brightness = np.mean(region)
    return brightness > const.SOLD_BRIGHTNESS_THRESHOLD


def preprocess_for_ocr(region):
    """ Preprocess image to enhance OCR accuracy. """
    # Resize for better OCR accuracy
    region = cv2.resize(region, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Convert to grayscale
    gray_region = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray_region, (3, 3), 0)
    
    # Apply binary thresholding for better contrast
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    return binary


def extract_text_from_region(region):
    """ Extract text from the given region using Tesseract OCR. """
    # Convert to grayscale if not already in grayscale
    processed_binary = preprocess_for_ocr(region)
    text = pytesseract.image_to_string(processed_binary, config='--psm 6')  # PSM 6 assumes a uniform block of text
    return text.strip()
