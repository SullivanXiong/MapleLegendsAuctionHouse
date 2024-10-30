import cv2
import os
import numpy as np
import pygetwindow as gw
import time
from PIL import ImageGrab
from opencv_utils.fm import get_fm_from_template_name

FPS = 10
MAPLELEGENDS_WINDOW_NAME = 'MapleLegends'
THRESHOLD = 0.95

BLUE_BGR = (255, 0, 0)
GREEN_BGR = (0, 255, 0)
RED_BGR = (0, 0, 255)

STORE = 'StoreUI'
STORE_UI = ['AvailableItemWithQuantity']
STORE_THRESHOLD = 0.6
SOLD_BRIGHTNESS_THRESHOLD = 220

def grayscale_image(image):
    """ Convert an image to grayscale. """
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def is_sold(region):
    """ Determine if a region represents a 'sold' item by checking brightness.
    
        Args:
            region (numpy.ndarray): The region to analyze.
        
        Returns:
            bool: True if the region is likely 'sold', False if it is 'available'.
    """
    # Calculate average brightness in the region
    brightness = np.mean(region)
    return brightness > SOLD_BRIGHTNESS_THRESHOLD

def load_all_opencv_templates():
    """ Load all OpenCV templates from the templates directory dynamically. """
    templates_dir = './opencv_templates/'
    templates = {}
    shop_templates = {}
    for filename in os.listdir(templates_dir):
        if filename.endswith('.png') or filename.endswith('.jpg'):
            template_name = os.path.splitext(filename)[0]
            template_path = os.path.join(templates_dir, filename)
            
            if STORE_UI[0] in filename:
                shop_templates[template_name] = grayscale_image(cv2.imread(template_path))
            else:
                templates[template_name] = grayscale_image(cv2.imread(template_path))
    return templates, shop_templates

def screenshot_window(window_name=''):
    """ Take a screenshot of a specific window. """
    if window_name:
        window = gw.getWindowsWithTitle(window_name)[0]
        if window.left < 0 and window.top < 0:
            return None
        
        bbox = (window.left, window.top, window.right, window.bottom)
        screenshot = ImageGrab.grab(bbox)
    else:
        screenshot = ImageGrab.grab()
    
    return cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)

if __name__ == '__main__':
    templates, shop_templates = load_all_opencv_templates()
    print(f'Loaded {len(templates)} templates and {len(shop_templates)} shop templates.')
    
    while True:
        if cv2.waitKey(1) & 0xFF == ord('q'):
            cv2.destroyAllWindows()
            break
        
        # Take a screenshot and check if the window is accessible
        ss = screenshot_window(MAPLELEGENDS_WINDOW_NAME)
        if ss is not None:
            gray_ss = cv2.cvtColor(ss.copy(), cv2.COLOR_BGR2GRAY)
            # Iterate over each template
            for template_name, template in templates.items():
                res = cv2.matchTemplate(gray_ss, template, cv2.TM_CCOEFF_NORMED)
                
                # Check for the best match location and threshold
                min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
                # print(f'{template_name} found at {max_loc} with confidence {max_val}')
                
                # If the best match exceeds the threshold, process it as a valid match
                if max_val >= THRESHOLD:
                    # Draw a rectangle around the matched region
                    top_left = max_loc
                    bottom_right = (top_left[0] + template.shape[1], top_left[1] + template.shape[0])
                    cv2.rectangle(ss, top_left, bottom_right, (0, 0, 0), 2)
                    
                    if template_name == STORE:
                        ss_edges = cv2.Canny(gray_ss, 100, 200)
                        for shop_template_name, shop_template in shop_templates.items():
                            shop_edges = cv2.Canny(shop_template, 100, 200)
                            shop_res = cv2.matchTemplate(ss_edges, shop_edges, cv2.TM_CCOEFF_NORMED)
                            loc_y, loc_x = np.where(shop_res >= STORE_THRESHOLD)
                            shop_res = shop_res[shop_res >= STORE_THRESHOLD]
                            
                            left_diff = -30
                            top_diff = -20
                            right_diff = 200
                            bottom_diff = 40
                            for (x, y) in zip(loc_x, loc_y):
                                top_left = (x + left_diff, y + top_diff)
                                bottom_right = (top_left[0] + right_diff, top_left[1] + bottom_diff)
                                
                                
                                item_is_sold = is_sold(ss[top_left[1]:bottom_right[1], top_left[0]:bottom_right[0]])
                                if item_is_sold:
                                    pass
                                    cv2.rectangle(ss, top_left, bottom_right, RED_BGR, 2)
                                else:
                                    pass
                                    cv2.rectangle(ss, top_left, bottom_right, GREEN_BGR, 2)
                                    
                    if "FreeMarket" in template_name:
                        print(f'in fm {get_fm_from_template_name(template_name)}')
                        pass
                    
                cv2.imshow('MapleLegends_Matched', ss)
        
        # Control FPS
        time.sleep(1 / FPS)
        
