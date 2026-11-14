import json

data = json.load(open('rr-pressure-platform/outputs/FROZEN_RANKINGS.json'))
print('=== TOP 10 BATTERS ===')
for b in data['top_10_batters']:
    print(f"#{b['rank']} ID:{b['player_id']} {b['player_name']} (Rating: {b['rating']})")

print('\n=== TOP 10 BOWLERS ===')
for b in data['top_10_bowlers']:
    print(f"#{b['rank']} ID:{b['player_id']} {b['player_name']} (Rating: {b['rating']})")

