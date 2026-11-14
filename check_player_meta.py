import json

rankings = json.load(open('rr-pressure-platform/outputs/FROZEN_RANKINGS.json'))
players_idx = json.load(open('rr-pressure-platform/site/public/data/players_index.json'))

pid_map = {p['player_id']: p for p in players_idx}

print('=== BATTERS METADATA ===')
for b in rankings['top_10_batters']:
    pid = int(b['player_id'])
    info = pid_map.get(pid, {})
    print(f"#{b['rank']}: {b['player_name']} (ID: {pid}) -> Franchise: {info.get('franchise_teams')} / National: {info.get('national_teams')}")

print('\n=== BOWLERS METADATA ===')
for b in rankings['top_10_bowlers']:
    pid = int(b['player_id'])
    info = pid_map.get(pid, {})
    print(f"#{b['rank']}: {b['player_name']} (ID: {pid}) -> Franchise: {info.get('franchise_teams')} / National: {info.get('national_teams')}")
