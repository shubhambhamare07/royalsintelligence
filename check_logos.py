import os
from PIL import Image
import numpy as np

src_teams = r'C:\Users\Shubham\OneDrive\Desktop\secretRR\ASSETS\IPL TEAM LOGO'
for f in os.listdir(src_teams):
    p = os.path.join(src_teams, f)
    im = Image.open(p)
    arr = np.array(im)
    print(f'{f}: size={im.size}, corners: top-left={arr[0,0]}, top-right={arr[0,-1]}, bottom-left={arr[-1,0]}')

