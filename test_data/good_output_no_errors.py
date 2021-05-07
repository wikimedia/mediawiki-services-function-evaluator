import json
import sys

_ = [line for line in sys.stdin]
sys.stdout.write(json.dumps({
    "Z1K1": "Z6", "Z6K1": "well-behaved"
}))
