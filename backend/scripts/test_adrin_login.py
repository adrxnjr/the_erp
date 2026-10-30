import urllib.request
import json

data = json.dumps({"username": "adrin", "password": "123", "portal_type": "staff"}).encode("utf-8")
req = urllib.request.Request("http://localhost:8000/api/v1/auth/login", data=data, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        print("[SUCCESS] Logged in as:", body.get("username"))
        print("Roles:", body.get("roles"))
        print("Full Name:", body.get("full_name"))
        print("Token Type:", body.get("token_type"))
except Exception as e:
    print("[ERROR]:", e)
