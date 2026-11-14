import os
from PIL import Image

paths = [
    r'C:\Users\Shubham\OneDrive\Desktop\secretRR\ASSETS\IPL TEAM LOGO\Rajasthan-Royals-Logo.png',
    r'C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\site\public\assets\teams\rr_official.png',
    r'C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\site\public\assets\teams\rr.svg',
    r'C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\site\public\assets\brand\rr-crest.svg',
    r'C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\site\public\assets\brand\rr-crest-reference.png',
]

for p in paths:
    if os.path.exists(p):
        sz = os.path.getsize(p)
        print(f'{p}: size={sz} bytes')
        if not p.endswith('.svg'):
            im = Image.open(p)
            print(f'   image dimensions: {im.size}, mode: {im.mode}')
    else:
        print(f'{p}: NOT FOUND')

