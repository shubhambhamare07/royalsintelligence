import os
from PIL import Image
import numpy as np

src_teams = r'C:\Users\Shubham\OneDrive\Desktop\secretRR\ASSETS\IPL TEAM LOGO'
dest_dir = r'C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\site\public\assets\teams\user_logos'
os.makedirs(dest_dir, exist_ok=True)

logo_mapping = {
    'Chennai-Super-Kings-Logo.png': 'csk.png',
    'DELHI CAPITALS LOGO.jpg': 'dc.png',
    'GT LOGO.jpg': 'gt.png',
    'Kolkata-Knight-Riders-Logo.png': 'kkr.png',
    'LSG LOGO.jpg': 'lsg.png',
    'Mumbai-Indians-Logo.png': 'mi.png',
    'PBKS LOGO.jpg': 'pbks.png',
    'Rajasthan-Royals-Logo.png': 'rr.png',
    'Royal-Challengers-Bengaluru-Logo.jpg': 'rcb.png',
    'SRH LOGO.jpg': 'srh.png',
}

for src_name, dest_name in logo_mapping.items():
    p = os.path.join(src_teams, src_name)
    im = Image.open(p).convert('RGBA')
    arr = np.array(im)
    
    # If transparent, find non-transparent pixels (alpha > 10)
    # If white background, find non-white pixels (any channel < 245 or alpha > 10)
    if 'png' in src_name.lower() and np.min(arr[:, :, 3]) < 50:
        # Transparent PNG
        mask = arr[:, :, 3] > 10
    else:
        # JPG / white background
        # Check if pixel is not near-white (sum of RGB < 735)
        rgb_sum = np.sum(arr[:, :, :3].astype(int), axis=-1)
        mask = rgb_sum < 740

    y_indices, x_indices = np.where(mask)
    if len(y_indices) > 0:
        min_y, max_y = y_indices.min(), y_indices.max()
        min_x, max_x = x_indices.min(), x_indices.max()
        # Add 2% padding
        pad_y = max(1, int((max_y - min_y) * 0.02))
        pad_x = max(1, int((max_x - min_x) * 0.02))
        min_y = max(0, min_y - pad_y)
        max_y = min(arr.shape[0] - 1, max_y + pad_y)
        min_x = max(0, min_x - pad_x)
        max_x = min(arr.shape[1] - 1, max_x + pad_x)
        
        cropped = im.crop((min_x, min_y, max_x + 1, max_y + 1))
        
        # If it was a white background JPG, convert pure white to transparent or keep clean white
        # If keeping on white card, transparent is even cleaner:
        c_arr = np.array(cropped)
        if 'jpg' in src_name.lower():
            # make near-white transparent
            white_mask = (c_arr[:, :, 0] > 240) & (c_arr[:, :, 1] > 240) & (c_arr[:, :, 2] > 240)
            c_arr[white_mask, 3] = 0
            cropped = Image.fromarray(c_arr)

        out_path = os.path.join(dest_dir, dest_name)
        cropped.save(out_path, format='PNG')
        print(f'Processed {dest_name}: original {im.size} -> cropped {cropped.size}')
    else:
        print(f'Warning: no mask found for {src_name}')

