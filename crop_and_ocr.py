from PIL import Image

shot = Image.open('rr-pressure-platform/reports/browser_home_screen_1672x941.png')

# Sidebar: x=0..225, y=0..941
shot.crop((0, 0, 225, 941)).save('rr-pressure-platform/reports/crop_sidebar_test.png')

# Header: x=225..1672, y=0..56
shot.crop((225, 0, 1672, 56)).save('rr-pressure-platform/reports/crop_header_test.png')

# Hero: x=225..1672, y=56..200
shot.crop((225, 56, 1672, 200)).save('rr-pressure-platform/reports/crop_hero_test.png')

# Stat cards: x=225..1672, y=200..280
shot.crop((225, 200, 1672, 280)).save('rr-pressure-platform/reports/crop_stats_test.png')

# Player cards: x=240..1180, y=280..930
shot.crop((240, 280, 1180, 930)).save('rr-pressure-platform/reports/crop_cards_test.png')

# Right column: x=1180..1665, y=280..930
shot.crop((1180, 280, 1665, 930)).save('rr-pressure-platform/reports/crop_right_test.png')

print('All test crops saved!')

