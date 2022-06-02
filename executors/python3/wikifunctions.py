"""Module that handles reentrant websocket calls to orchestrator.

This needs a lot of work. stdin needs to be captured somewhere in order to
route different results to the appropriate calls. Threaded approach with
a central handler for stdin could help. Probably also need asyncio here.
"""


import json
import sys
from python3 import serialization


class Wikifunctions:
    def __init__(self, stdin, stdout):
        self._stdin = stdin
        self._stdout = stdout

    def Call(self, function_zid, **kwargs):
        Z7 = {"Z1K1": "Z7", "Z7K1": function_zid}
        for key, value in kwargs.items():
            Z7[key] = serialization.serialize(value)
        self._stdout.write("call " + json.dumps(Z7) + "\n")
        # flush() is crucial to ensure that the call be made promptly.
        self._stdout.flush()
        while True:
            for line in self._stdin:
                if not line.strip():
                    continue
                return serialization.deserialize(json.loads(line))
