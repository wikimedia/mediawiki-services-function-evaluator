import json
import sys

_ = [line for line in sys.stdin]

sys.stdout.write("facinorous output")
sys.stderr.write(
    json.dumps(
        {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z5"},
            "Z5K2": {"Z1K1": "Z6", "Z6K1": "i am very bad too"},
        }
    )
)
