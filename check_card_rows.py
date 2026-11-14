import numpy as np
from PIL import Image

card = Image.open('rr-pressure-platform/reports/debug_card1_full.png')
w, h = card.size
arr = np.array(card)

# Let's find rows with text:
# Text pixels are dark (mean RGB < 120)
for y in range(0, h, 10):
    row = arr[y, :]
    dark_px = np.sum(np.mean(row, axis=-1) < 120)
    pink_px = np.sum((row[:, 0] > 200) & (row[:, 1] < 100))
    if dark_px > 5 or pink_px > 5:
        print(f'y={y+400}: dark_px={dark_px}, pink_px={pink_px}')

