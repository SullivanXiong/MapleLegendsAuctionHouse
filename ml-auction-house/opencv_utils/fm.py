import cv2
import numpy as np
import opencv_utils.const as const
from opencv_utils.store import is_sold, extract_text_from_region


def get_fm_from_template_name(template_name):
    return (template_name.split('FreeMarket')[-1]).split('.')[0]


def template_matcher(ss, gray_ss, template_name, template, shop_templates):
    match_result = cv2.matchTemplate(gray_ss, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(match_result)
    
    if max_val >= const.THRESHOLD:
        # Draw a rectangle around the matched region
        mt_top_left = max_loc
        mt_bottom_right = (mt_top_left[0] + template.shape[1], mt_top_left[1] + template.shape[0])
        cv2.rectangle(ss, mt_top_left, mt_bottom_right, (0, 0, 0), 2)
        
        if template_name == const.STORE:
            ss_edges = cv2.Canny(gray_ss, 100, 200)
            shop_template_matcher(ss, ss_edges, shop_templates)
            
        if "FreeMarket" in template_name:
            print(f'in fm {get_fm_from_template_name(template_name)}')
            pass
        
    return ss


def shop_template_matcher(ss, ss_edges, shop_templates):
    for _, shop_template in shop_templates.items():
        shop_edges = cv2.Canny(shop_template, 100, 200)
        shop_res = cv2.matchTemplate(ss_edges, shop_edges, cv2.TM_CCOEFF_NORMED)
        loc_y, loc_x = np.where(shop_res >= const.STORE_THRESHOLD)
        shop_res = shop_res[shop_res >= const.STORE_THRESHOLD]
        
        # TODO: Separate the regions for the item, name, and price
        # TODO: Figure out if it's a scroll. If it is, extract the full scroll name when hovered.
        # TODO: drop duplicate overlapping regions
        # TODO: Limit template region matching after I find the shop match.
        #       I should be able to reasonably figure out where the shop is
        #       relative to the shop text match.
        # TODO: concurrency for the template matching
        # TODO: Memoize the template matching results to reduce OCR and OpenCV.
        #       This calls for complexity in the data structure to store the
        #       in a sqlite instance, as well as cleaning up the data in the
        #       cases where
        #       1. The shop is reopened
        #       2. The shop has been tidied up
        #       3. Items have been sold
        #       We will also need to compress the data to reduce the size of
        #       the database.
        #       When not processing Shop data (i.e. in the FM), we should do
        #       other work in parallel such as saving the data to the database,
        #       or updating the database with new data from other users of the
        #       mesh network.
        
        left_diff = 10
        top_diff = -20
        right_diff = 160
        bottom_diff = 40
        for (x, y) in zip(loc_x, loc_y):
            top_left = (x + left_diff, y + top_diff)
            bottom_right = (top_left[0] + right_diff, top_left[1] + bottom_diff)
            
            item_region = ss[top_left[1]:bottom_right[1], top_left[0]:bottom_right[0]]
            item_is_sold = is_sold(item_region)
            item_text = extract_text_from_region(item_region)
            print(f'{item_text} {"(Sold)" if item_is_sold else ""}')
            if item_is_sold:
                pass
                cv2.rectangle(ss, top_left, bottom_right, const.RED_BGR, 2)
            else:
                pass
                cv2.rectangle(ss, top_left, bottom_right, const.GREEN_BGR, 2)