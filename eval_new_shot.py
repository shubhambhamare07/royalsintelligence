import numpy as np
from PIL import Image

shot = Image.open('rr-pressure-platform/reports/browser_home_screen_1672x941.png')
print('Screenshot size:', shot.size)
arr = np.array(shot)

# 1. Check bottom rows:
# Row 930 to 940: should be pure white background [255, 255, 255]
print('Row 935 mean:', np.mean(arr[935, 230:1650], axis=0))
print('Row 940 mean:', np.mean(arr[940, 230:1650], axis=0))

# 2. Check RR logo in sidebar top-left:
# x: 10..50, y: 10..50
rr_crop = shot.crop((10, 10, 50, 50))
rr_crop.save('rr-pressure-platform/reports/eval_rr_logo.png')
print('RR logo crop saved (non-white pixels:', np.sum(np.array(rr_crop) < 250), ')')

# 3. Check Left column (Top 10 Rankings):
# Where does panel start and end vertically?
# x=300, y=200..900:
for y in range(250, 930, 20):
    p = arr[y, 300]
    if np.mean(p) < 254:
        pass
# Card 1 bounds:
card1_crop = shot.crop((245, 290, 420, 700))
card1_crop.save('rr-pressure-platform/reports/eval_card1_new.png')
print('Card 1 crop saved')

# 4. Check Right column (Model Performance & Key Insights):
# Crop right column completely:
right_crop = shot.crop((1160, 270, 1660, 850))
right_crop.save('rr-pressure-platform/reports/eval_right_new.png')
print('Right column crop saved')

print('All evaluation crops saved!')

