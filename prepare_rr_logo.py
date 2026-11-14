import os
from PIL import Image
import numpy as np

src = r'C:\Users\Shubham\OneDrive\Desktop\secretRR\ASSETS\IPL TEAM LOGO\Rajasthan-Royals-Logo.png'
dest = r'C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\site\public\assets\brand\rajasthan-royals-official.png'

im = Image.open(src).convert('RGBA')
arr = np.array(im)

# Find bounding box of non-transparent content (alpha > 10)
mask = arr[:, :, 3] > 10
y_indices, x_indices = np.where(mask)

if len(y_indices) > 0:
    min_y, max_y = y_indices.min(), y_indices.max()
    min_x, max_x = x_indices.min(), x_indices.max()
    cropped = im.crop((min_x, min_y, max_x + 1, max_y + 1))
    cropped.save(dest, format='PNG')
    print(f'Saved official RR logo: {dest} (size: {cropped.size})')
else:
    print('Failed to find mask')

