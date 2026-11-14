import os
import shutil

src_dir = r'C:\Users\Shubham\OneDrive\Desktop\secretRR\ASSETS\TOP 10'
dest_dir = r'C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\site\public\assets\players\top10'
os.makedirs(dest_dir, exist_ok=True)

file_mapping = {
    'PATHUM NISSANKA .webp': 'pathum-nissanka.webp',
    'HEINRICH CLASSEN.webp': 'heinrich-klaasen.webp',
    'ANDRE RUSSEL.webp': 'andre-russell.webp',
    'SHASHANK SINGH.webp': 'shashank-singh.webp',
    'DINESH KARTHIK.png': 'dinesh-karthik.png',
    'KUSAL MENDIS.png': 'kusal-mendis.png',
    'JITESH SHARMA.webp': 'jitesh-sharma.webp',
    'RASHID KHAN.webp': 'rashid-khan.webp',
    'SURYAKUMAR YADAV.webp': 'suryakumar-yadav.webp',
    'DARYL MITCHELL.png': 'daryl-mitchell.png',
    'MATHEESHA PATHIRANA.webp': 'matheesha-pathirana.webp',
    'KRUNAL PANDYA.webp': 'krunal-pandya.webp',
    'SUNIL NARINE.webp': 'sunil-narine.webp',
    'JOSH HAZLEWOOD.webp': 'josh-hazlewood.webp',
    'AXAR PATEL.webp': 'axar-patel.webp',
    'KULDEEP YADAV.webp': 'kuldeep-yadav.webp',
    'BHUVNESHWAR KUMAR.webp': 'bhuvneshwar-kumar.webp',
    'PAT COMMINS.webp': 'pat-cummins.webp',
    'NATHAN ELIS.png': 'nathan-ellis.png',
    'RASIKH.webp': 'rasikh-salam.webp',
}

for src_name, dest_name in file_mapping.items():
    src_path = os.path.join(src_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
        print(f'Copied {src_name} -> {dest_name} ({os.path.getsize(dest_path)} bytes)')
    else:
        print(f'ERROR: Missing {src_name}')

