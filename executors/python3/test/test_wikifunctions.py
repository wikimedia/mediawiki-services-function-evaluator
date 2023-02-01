import io
import json
import re
import threading
import unittest

# TODO (T322096): This is a kludge due to how env variables work in Blubber;
# would be better if PYTHONPATH could be controlled directly.
from .. import wikifunctions


class WikifunctionsTest(unittest.TestCase):
    maxDiff = None

    def setUp(self):
        self._stdin = io.StringIO()
        self._stdout = io.StringIO()

    def test_call(self):
        results = []

        # Prepare stdin to be read during the function call.
        self._stdin.write(json.dumps({"Z1K1": "Z6", "Z6K1": "thread string cord"}))
        self._stdin.write("\n")
        self._stdin.write("\n")
        self._stdin.seek(0)

        # Call Wikifunctions.Call in a separate thread.
        def make_call():
            W = wikifunctions.Wikifunctions(self._stdin, self._stdout)
            results.append(W.Call("Z801", Z801K1=True))

        call_thread = threading.Thread(target=make_call)
        call_thread.start()
        call_thread.join()

        # Thread has now exited; read the stdout produced therein.
        self._stdout.seek(0)
        actual_stdout = self._stdout.read()
        self.assertTrue(actual_stdout.startswith("call "))
        serialized_function_call = re.sub(r"^call ", r"", actual_stdout)
        actual_function_call = json.loads(serialized_function_call)
        expected_function_call = {
            "Z1K1": "Z7",
            "Z7K1": "Z801",
            "Z801K1": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"},
                "Z40K1": {"Z1K1": "Z9", "Z9K1": "Z41"},
            },
        }

        # stdout should contain "call " + the expected function call.
        self.assertEqual(expected_function_call, actual_function_call)

        # stdin should have received the serialized string.
        self.assertEqual("thread string cord", results[0])
