import numpy as np
from PIL import Image

src_path = r'C:\Users\Shubham\.gemini\antigravity\brain\259132f1-3e7c-4538-a771-02ab90504faa\cricket_stadium_hero_1794604409475.jpg'
dest_path = r'C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\site\public\assets\brand\hero-stadium-generated.png'

im = Image.open(src_path).convert('RGBA')
w, h = im.size
arr = np.array(im)

# Alpha gradient: 0 at x=0 to 1 at x=w*0.45, 1 from x=w*0.45 to w
fade_stop = int(w * 0.45)
alpha_ramp = np.ones((h, w), dtype=np.float32)
for x in range(fade_stop):
    # Smooth cosine curve
    t = x / fade_stop
    val = 0.5 - 0.5 * np.cos(t * np.pi)
    alpha_ramp[:, x] = val

arr[:, :, 3] = (arr[:, :, 3].astype(np.float32) * alpha_ramp).astype(np.uint8)

faded_im = Image.fromarray(arr)
faded_im.save(dest_path)
print('Successfully saved faded hero stadium image to', dest_path)

