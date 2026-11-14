import numpy as np
from PIL import Image

shot = Image.open('rr-pressure-platform/reports/browser_home_screen_1672x941.png')
print('Screenshot size:', shot.size)

arr = np.array(shot)

# 1. Inspect bottom margin: rows 920 to 940
# In row 935, is it clean background (no scrollbar)?
print('Row 935 mean color:', np.mean(arr[935, 230:1660, :], axis=0))
print('Row 940 mean color:', np.mean(arr[940, 230:1660, :], axis=0))

# 2. Inspect sidebar brand and items:
# Check item 1 (Executive Home) around y=70..100
# Check item 16 (Model Validation) around y=680..730
print('Item 1 (Home) active pink pixels:', np.sum((arr[60:110, 0:225, 0] > 200) & (arr[60:110, 0:225, 1] < 50)))
print('Item 16 (Model Validation) area mean color:', np.mean(arr[670:710, 0:225, :]))

# 3. Inspect player card 1 (Pathum Nissanka)
# Card 1 x: approx 245 to 395
# Flag at top right of Card 1:
flag_crop = shot.crop((370, 240, 410, 265))
flag_crop.save('rr-pressure-platform/reports/eval_flag1.png')

# Photo crop:
photo_crop = shot.crop((245, 260, 420, 580))
photo_crop.save('rr-pressure-platform/reports/eval_photo1.png')

# Logo crop:
logo_crop = shot.crop((290, 580, 375, 620))
logo_crop.save('rr-pressure-platform/reports/eval_logo1.png')

# Rating crop:
rating_crop = shot.crop((250, 640, 415, 695))
rating_crop.save('rr-pressure-platform/reports/eval_rating1.png')

# Save full dashboard overview crop
dash_crop = shot.crop((225, 56, 1672, 941))
dash_crop.save('rr-pressure-platform/reports/eval_dashboard.png')

print('Evaluation crops saved successfully')

