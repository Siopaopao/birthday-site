import urllib.request
import json

for passcode in ['diane2024', 'chloe2024']:
    req = urllib.request.Request(
        'http://localhost:8000/private/unlock',
        data=json.dumps({'passcode': passcode}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    try:
        resp = urllib.request.urlopen(req)
        print(f'✓ {passcode}: SUCCESS (status {resp.status})')
    except urllib.error.HTTPError as e:
        print(f'✗ {passcode}: Status {e.code} - {e.read().decode()}')
