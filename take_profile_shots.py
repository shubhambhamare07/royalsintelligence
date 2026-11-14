import subprocess
import time
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
user_data = r"C:\Users\Shubham\AppData\Local\Temp\chrome_profile_test"
reports_dir = r"C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\reports"
os.makedirs(reports_dir, exist_ok=True)

targets = [
    ("profile_6931_nissanka.png", "http://localhost:3000/player/6931"),
    ("profile_8661_pathirana.png", "http://localhost:3000/player/8661"),
    ("profile_4260_klaasen.png", "http://localhost:3000/player/4260"),
    ("home_screen_verified.png", "http://localhost:3000/"),
]

for out_name, url in targets:
    out_file = os.path.join(reports_dir, out_name)
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--user-data-dir={user_data}",
        "--window-size=1672,941",
        f"--screenshot={out_file}",
        url
    ]
    print(f"Capturing {url} -> {out_name}...")
    subprocess.run(cmd, check=True)
    time.sleep(1)

print("All screenshots captured successfully!")

