import os

flags = {
    'bd.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><rect width="1000" height="600" fill="#006a4e"/><circle cx="450" cy="300" r="200" fill="#f42a41"/></svg>',
    'ca.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500"><rect width="250" height="500" fill="#d80621"/><rect x="250" width="500" height="500" fill="#ffffff"/><rect x="750" width="250" height="500" fill="#d80621"/><path d="M500 120 L520 220 L560 210 L540 260 L600 270 L580 310 L610 330 L550 350 L530 400 L505 380 L500 440 L495 440 L495 380 L470 400 L450 350 L390 330 L420 310 L400 270 L460 260 L440 220 L480 220 Z" fill="#d80621"/></svg>',
    'eng.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300"><rect width="500" height="300" fill="#ffffff"/><rect x="210" width="80" height="300" fill="#cf081f"/><rect y="110" width="500" height="80" fill="#cf081f"/></svg>',
    'gb-eng.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300"><rect width="500" height="300" fill="#ffffff"/><rect x="210" width="80" height="300" fill="#cf081f"/><rect y="110" width="500" height="80" fill="#cf081f"/></svg>',
    'hk.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect width="600" height="400" fill="#de2910"/><circle cx="300" cy="200" r="80" fill="#ffffff"/></svg>',
    'ie.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><rect width="200" height="300" fill="#169b62"/><rect x="200" width="200" height="300" fill="#ffffff"/><rect x="400" width="200" height="300" fill="#ff883e"/></svg>',
    'jp.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="900" height="600" fill="#ffffff"/><circle cx="450" cy="300" r="180" fill="#bc002d"/></svg>',
    'kw.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><rect width="600" height="100" fill="#007a3d"/><rect y="100" width="600" height="100" fill="#ffffff"/><rect y="200" width="600" height="100" fill="#ce1126"/><polygon points="0,0 200,100 200,200 0,300" fill="#000000"/></svg>',
    'np.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><polygon points="0,0 300,220 120,220 340,500 0,500" fill="#dc143c" stroke="#003893" stroke-width="20"/></svg>',
    'nl.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="900" height="200" fill="#ae1c28"/><rect y="200" width="900" height="200" fill="#ffffff"/><rect y="400" width="900" height="200" fill="#21468b"/></svg>',
    'om.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><rect width="600" height="100" fill="#ffffff"/><rect y="100" width="600" height="100" fill="#db161e"/><rect y="200" width="600" height="100" fill="#008000"/><rect width="150" height="300" fill="#db161e"/></svg>',
    'pk.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><rect width="225" height="600" fill="#ffffff"/><rect x="225" width="675" height="600" fill="#01411c"/><circle cx="562" cy="300" r="160" fill="#ffffff"/><circle cx="600" cy="270" r="150" fill="#01411c"/><polygon points="600,230 610,250 635,250 615,265 625,290 600,275 575,290 585,265 565,250 590,250" fill="#ffffff"/></svg>',
    'sco.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300"><rect width="500" height="300" fill="#005eb8"/><line x1="0" y1="0" x2="500" y2="300" stroke="#ffffff" stroke-width="60"/><line x1="500" y1="0" x2="0" y2="300" stroke="#ffffff" stroke-width="60"/></svg>',
    'sg.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect width="600" height="200" fill="#ed2939"/><rect y="200" width="600" height="200" fill="#ffffff"/></svg>',
    'ae.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><rect width="600" height="100" fill="#00732f"/><rect y="100" width="600" height="100" fill="#ffffff"/><rect y="200" width="600" height="100" fill="#000000"/><rect width="150" height="300" fill="#ff0000"/></svg>',
    'us.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 350"><rect width="650" height="350" fill="#b22234"/><rect y="27" width="650" height="27" fill="#ffffff"/><rect y="81" width="650" height="27" fill="#ffffff"/><rect y="135" width="650" height="27" fill="#ffffff"/><rect y="189" width="650" height="27" fill="#ffffff"/><rect y="243" width="650" height="27" fill="#ffffff"/><rect y="297" width="650" height="27" fill="#ffffff"/><rect width="260" height="189" fill="#3c3b6e"/></svg>',
    'zw.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300"><rect width="600" height="300" fill="#006400"/><rect y="43" width="600" height="214" fill="#ffd700"/><rect y="86" width="600" height="128" fill="#d40000"/><rect y="129" width="600" height="42" fill="#000000"/><polygon points="0,0 200,150 0,300" fill="#ffffff" stroke="#000000" stroke-width="3"/></svg>'
}

out_dir = 'rr-pressure-platform/site/public/assets/flags'
os.makedirs(out_dir, exist_ok=True)
for fname, content in flags.items():
    with open(os.path.join(out_dir, fname), 'w', encoding='utf-8') as f:
        f.write(content)

print(f'Wrote {len(flags)} country flags to {out_dir}')

