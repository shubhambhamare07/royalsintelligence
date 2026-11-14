import os

dest_dir = r'C:\Users\Shubham\OneDrive\Desktop\secretRR\rr-pressure-platform\site\public\assets\flags'
os.makedirs(dest_dir, exist_ok=True)

flags = {
    'in.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="30" height="20">
  <rect width="900" height="200" fill="#FF9933"/>
  <rect y="200" width="900" height="200" fill="#FFFFFF"/>
  <rect y="400" width="900" height="200" fill="#138808"/>
  <circle cx="450" cy="300" r="75" fill="none" stroke="#000080" stroke-width="6"/>
  <circle cx="450" cy="300" r="15" fill="#000080"/>
  <g stroke="#000080" stroke-width="2">
    <line x1="450" y1="225" x2="450" y2="375"/>
    <line x1="375" y1="300" x2="525" y2="300"/>
    <line x1="397" y1="247" x2="503" y2="353"/>
    <line x1="397" y1="353" x2="503" y2="247"/>
    <line x1="421" y1="228" x2="479" y2="372"/>
    <line x1="479" y1="228" x2="421" y2="372"/>
    <line x1="378" y1="271" x2="522" y2="329"/>
    <line x1="378" y1="329" x2="522" y2="271"/>
  </g>
</svg>''',

    'lk.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" width="30" height="20">
  <rect width="1000" height="500" fill="#FFBE29"/>
  <rect x="30" y="30" width="940" height="440" fill="#000000" opacity="0.1"/>
  <rect x="60" y="40" width="130" height="420" fill="#005A36"/>
  <rect x="210" y="40" width="130" height="420" fill="#EB7400"/>
  <rect x="360" y="40" width="580" height="420" fill="#8D153A"/>
  <!-- Lion symbol stylized -->
  <circle cx="650" cy="230" r="80" fill="#FFBE29"/>
  <path d="M 600,280 Q 650,220 700,280 L 680,320 L 620,320 Z" fill="#FFBE29"/>
  <rect x="710" y="190" width="10" height="80" fill="#FFBE29" transform="rotate(30 710 190)"/>
  <!-- Corner leaves -->
  <polygon points="380,60 410,70 390,100" fill="#FFBE29"/>
  <polygon points="920,60 890,70 910,100" fill="#FFBE29"/>
  <polygon points="380,440 410,430 390,400" fill="#FFBE29"/>
  <polygon points="920,440 890,430 910,400" fill="#FFBE29"/>
</svg>''',

    'za.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="30" height="20">
  <clipPath id="c"><rect width="900" height="600"/></clipPath>
  <g clip-path="url(#c)">
    <rect width="900" height="600" fill="#007749"/>
    <path d="M0,0 L900,0 L900,200 L0,200 Z" fill="#E03C31"/>
    <path d="M0,400 L900,400 L900,600 L0,600 Z" fill="#001489"/>
    <path d="M0,0 L450,300 L0,600 Z" fill="#000000"/>
    <path d="M0,0 L450,300 L0,600" fill="none" stroke="#FFB81C" stroke-width="80"/>
    <path d="M0,0 L450,300 L0,600" fill="#000000"/>
    <path d="M0,200 L300,200 L600,0 L900,0" fill="none" stroke="#FFFFFF" stroke-width="60"/>
    <path d="M0,400 L300,400 L600,600 L900,600" fill="none" stroke="#FFFFFF" stroke-width="60"/>
    <path d="M0,300 L450,300 L900,300" fill="none" stroke="#007749" stroke-width="120"/>
    <path d="M0,0 L450,300 L0,600" fill="none" stroke="#007749" stroke-width="120"/>
    <path d="M0,0 L400,267 L0,533" fill="none" stroke="#FFB81C" stroke-width="40"/>
    <path d="M0,0 L360,240 L0,480" fill="#000000"/>
  </g>
</svg>''',

    'wi.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="30" height="20">
  <rect width="900" height="600" fill="#7B002C"/>
  <circle cx="450" cy="300" r="160" fill="#FFC72C"/>
  <circle cx="450" cy="300" r="130" fill="#00843D"/>
  <!-- Cricket wickets and palm tree -->
  <rect x="425" y="240" width="10" height="90" fill="#FFFFFF"/>
  <rect x="445" y="240" width="10" height="90" fill="#FFFFFF"/>
  <rect x="465" y="240" width="10" height="90" fill="#FFFFFF"/>
  <rect x="420" y="235" width="60" height="8" fill="#FFFFFF"/>
  <!-- Palm fronds -->
  <path d="M 450,220 Q 420,180 390,200 Q 430,200 450,220" fill="#FFFFFF"/>
  <path d="M 450,220 Q 480,180 510,200 Q 470,200 450,220" fill="#FFFFFF"/>
  <path d="M 450,220 Q 450,160 450,170" fill="none" stroke="#FFFFFF" stroke-width="8"/>
</svg>''',

    'au.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="30" height="20">
  <rect width="1200" height="600" fill="#00008B"/>
  <!-- Union Jack Canton -->
  <g>
    <rect width="600" height="300" fill="#00247D"/>
    <path d="M0,0 L600,300 M600,0 L0,300" stroke="#FFFFFF" stroke-width="60"/>
    <path d="M0,0 L600,300 M600,0 L0,300" stroke="#CF142B" stroke-width="20"/>
    <path d="M300,0 L300,300 M0,150 L600,150" stroke="#FFFFFF" stroke-width="100"/>
    <path d="M300,0 L300,300 M0,150 L600,150" stroke="#CF142B" stroke-width="60"/>
  </g>
  <!-- Commonwealth Star -->
  <polygon points="300,400 315,445 360,445 325,470 338,515 300,490 262,515 275,470 240,445 285,445" fill="#FFFFFF"/>
  <!-- Southern Cross Stars -->
  <polygon points="900,100 906,120 926,120 910,132 916,152 900,140 884,152 890,132 874,120 894,120" fill="#FFFFFF"/>
  <polygon points="1000,240 1005,255 1020,255 1008,265 1012,280 1000,270 988,280 992,265 980,255 995,255" fill="#FFFFFF"/>
  <polygon points="900,450 906,470 926,470 910,482 916,502 900,490 884,502 890,482 874,470 894,470" fill="#FFFFFF"/>
  <polygon points="800,280 805,295 820,295 808,305 812,320 800,310 788,320 792,305 780,295 795,295" fill="#FFFFFF"/>
  <polygon points="950,330 954,342 966,342 956,350 960,362 950,354 940,362 944,350 934,342 946,342" fill="#FFFFFF"/>
</svg>''',

    'nz.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="30" height="20">
  <rect width="1200" height="600" fill="#00247D"/>
  <!-- Union Jack Canton -->
  <g>
    <rect width="600" height="300" fill="#00247D"/>
    <path d="M0,0 L600,300 M600,0 L0,300" stroke="#FFFFFF" stroke-width="60"/>
    <path d="M0,0 L600,300 M600,0 L0,300" stroke="#CC142B" stroke-width="20"/>
    <path d="M300,0 L300,300 M0,150 L600,150" stroke="#FFFFFF" stroke-width="100"/>
    <path d="M300,0 L300,300 M0,150 L600,150" stroke="#CC142B" stroke-width="60"/>
  </g>
  <!-- NZ Red Stars with White Borders -->
  <polygon points="900,100 906,120 926,120 910,132 916,152 900,140 884,152 890,132 874,120 894,120" fill="#CC142B" stroke="#FFFFFF" stroke-width="6"/>
  <polygon points="1000,220 1005,235 1020,235 1008,245 1012,260 1000,250 988,260 992,245 980,235 995,235" fill="#CC142B" stroke="#FFFFFF" stroke-width="5"/>
  <polygon points="900,420 906,440 926,440 910,452 916,472 900,460 884,472 890,452 874,440 894,440" fill="#CC142B" stroke="#FFFFFF" stroke-width="6"/>
  <polygon points="820,260 825,275 840,275 828,285 832,300 820,290 808,300 812,285 800,275 815,275" fill="#CC142B" stroke="#FFFFFF" stroke-width="5"/>
</svg>''',

    'af.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="30" height="20">
  <rect width="300" height="600" fill="#000000"/>
  <rect x="300" width="300" height="600" fill="#D32011"/>
  <rect x="600" width="300" height="600" fill="#007A3D"/>
  <!-- Central Emblem -->
  <circle cx="450" cy="300" r="100" fill="none" stroke="#FFFFFF" stroke-width="8"/>
  <path d="M 410,340 L 410,280 L 450,250 L 490,280 L 490,340 Z" fill="none" stroke="#FFFFFF" stroke-width="6"/>
  <path d="M 450,220 L 450,250" stroke="#FFFFFF" stroke-width="6"/>
  <circle cx="450" cy="300" r="15" fill="#FFFFFF"/>
</svg>'''
}

for fname, svg_content in flags.items():
    p = os.path.join(dest_dir, fname)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f'Wrote {fname}')

