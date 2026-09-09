#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

PATTERN = re.compile(r"^(?:[0-9A-Fa-f]{2}:){31}[0-9A-Fa-f]{2}$")

if len(sys.argv) != 2 or not PATTERN.fullmatch(sys.argv[1].strip()):
    print("Usage: python set-fingerprint.py AA:BB:...:FF")
    print("Provide the SHA-256 certificate fingerprint (32 colon-separated bytes).")
    sys.exit(1)

fingerprint = sys.argv[1].strip().upper()
assetlinks = Path(__file__).resolve().parent.parent / ".well-known" / "assetlinks.json"

data = json.loads(assetlinks.read_text(encoding="utf-8"))
data[0]["target"]["sha256_cert_fingerprints"] = [fingerprint]
assetlinks.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
print(f"Updated {assetlinks}")
print("Commit and deploy this file before testing the TWA.")
