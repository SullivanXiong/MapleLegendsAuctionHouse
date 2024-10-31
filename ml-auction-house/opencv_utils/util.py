import cv2
import numpy as np
import opencv_utils.const as const
import os
import pygetwindow as gw
import re
from PIL import ImageGrab

TITLE_PATTERN = r"^MapleLegends \([A-Za-z]{3,4} \d{1,2} \d{4}\)$"


def grayscale_image(image):
    """ Convert an image to grayscale.
    
        Args:
            image (numpy.ndarray): The image to convert.
        
        Returns:
            numpy.ndarray: The grayscale image.
    """
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def load_all_opencv_templates():
    """ Load all OpenCV templates from the templates directory dynamically. """
    templates_dir = './opencv_templates/'
    templates = {}
    shop_templates = {}
    for filename in os.listdir(templates_dir):
        if filename.endswith('.png') or filename.endswith('.jpg'):
            template_name = os.path.splitext(filename)[0]
            template_path = os.path.join(templates_dir, filename)
            
            if const.STORE_UI[0] in filename:
                shop_templates[template_name] = grayscale_image(cv2.imread(template_path))
            else:
                templates[template_name] = grayscale_image(cv2.imread(template_path))
    return templates, shop_templates


def screenshot_maplelegends():
    """ Take a screenshot of the active maplelegends instance.
    
        Returns:
            numpy.ndarray: The screenshot OR None if the window is not accessible.
    """
    window = gw.getActiveWindow()
    window_title = window.title
    if (not re.match(TITLE_PATTERN, window_title)):
        return None

    bbox = (window.left, window.top, window.right, window.bottom)
    screenshot = ImageGrab.grab(bbox)
    
    return cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
