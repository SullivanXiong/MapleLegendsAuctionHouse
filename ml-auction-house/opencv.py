import cv2
import numpy as np
import time
import opencv_utils.const as const
from opencv_utils.fm import template_matcher
from opencv_utils.util import screenshot_maplelegends, load_all_opencv_templates

if __name__ == '__main__':
    templates, shop_templates = load_all_opencv_templates()
    
    while True:
        start_time = time.time()
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            cv2.destroyAllWindows()
            break
        
        # Take a screenshot and check if the window is accessible
        ss = screenshot_maplelegends()
        if ss is not None:
            # Convert to grayscale for template matching
            gray_ss = cv2.cvtColor(ss.copy(), cv2.COLOR_BGR2GRAY)

            # Match templates
            for template_name, template in templates.items():
                template_matcher(ss, gray_ss, template_name, template, shop_templates)
                    
            cv2.imshow('MapleLegends OpenCV', ss)
        
        # Cap the frame rate to the specified FPS
        elapsed_time = time.time() - start_time
        # Control FPS
        time.sleep(max(1 / const.FPS - elapsed_time, 0))
