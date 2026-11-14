import numpy as np
from PIL import Image

ref = Image.open('rr-pressure-platform/UI IMAGE REFERENCE/HOME SCREEN.png')

# Right column: x: 1145 to 1660, y: 380 to 930
rc = ref.crop((1145, 380, 1660, 930))
rc.save('rr-pressure-platform/reports/debug_right_col.png')

arr = np.array(rc)
# Find border between card 1 (Model Performance) and card 2 (Key Insights):
# Check mean color along y:
for y in range(0, rc.size[1], 15):
    row = arr[y, 50:450]
    is_card = np.mean(row) < 254
    print(f'y={y+380}: mean={np.mean(row):.1f}, is_card={is_card}')

