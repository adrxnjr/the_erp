import urllib.request
import json

tests = [
    ('adrin', '123', 'staff'),
    ('viceadmin', '123', 'staff'),
    ('coordinator1', '123', 'staff'),
    ('staff', '123', 'staff'),
    ('staff3', '123', 'staff'),
    ('teacher1', '123', 'staff'),
    ('principal', '123', 'staff'),
    ('parent1', '123', 'parent_student'),
    ('student1', '123', 'parent_student'),
]

for u, p, portal in tests:
    data = json.dumps({'username': u, 'password': p, 'portal_type': portal}).encode()
    req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/login', data=data, headers={'Content-Type': 'application/json'})
    try:
        res = urllib.request.urlopen(req)
        body = json.loads(res.read().decode())
        print(f"[OK] {u} ({portal}) -> {body.get('full_name')} | roles: {body.get('roles')}")
    except Exception as e:
        print(f"[FAIL] {u} ({portal}) -> {e}")
