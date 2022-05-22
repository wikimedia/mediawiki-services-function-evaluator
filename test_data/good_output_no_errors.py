import json
import sys

_ = [line for line in sys.stdin]
sys.stdout.write(
    json.dumps(
        {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z22"},
            "Z22K1": {"Z1K1": "Z6", "Z6K1": "well-behaved"},
            "Z22K2": {"Z1K1": "Z9", "Z9K1": "Z24"},
        }
    )
)
