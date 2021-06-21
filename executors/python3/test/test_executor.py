import io
import json
import os
import re
import sys
import unittest
from unittest.mock import patch

# This is a kludge due to how env variables work in Blubber; would be better if
# PYTHONPATH could be controlled directly.
from .. import executor


_DATA_DIR = os.path.join(os.path.dirname(__file__), 'test_data')


def _read_test_json(file_name):
    with open(os.path.join(_DATA_DIR, file_name), 'r') as inp:
        return json.load(inp)


class ExecutorTest(unittest.TestCase):

    def setUp(self):
        self._stdin = io.StringIO()
        self._stdout = io.StringIO()
        self._stderr = io.StringIO()

    def _run_test(self, zobject, expected_result=None, expected_stderr=None):
        executor.execute(zobject, self._stdout, self._stderr)
        if expected_result is not None:
            self._stdout.seek(0)
            self.assertEqual(expected_result, json.loads(self._stdout.read().strip()))
        if expected_stderr is not None:
            self._stderr.seek(0)
            self.assertEqual(expected_stderr, json.loads(self._stderr.read().strip()))

    def test_runs_function_call(self):
        Z7 = _read_test_json('python3_add.json')
        expected = _read_test_json('python3_add_expected.json')['Z22K1']
        self._run_test(Z7, expected_result=expected)

    def test_runs_lambda(self):
        Z7 = _read_test_json('python3_add_lambda.json')
        expected = _read_test_json('python3_add_expected.json')['Z22K1']
        self._run_test(Z7, expected_result=expected)

    def test_no_Z8(self):
        Z7 = _read_test_json('python3_no_Z8.json')
        expected = _read_test_json('python3_no_Z8_expected.json')['Z22K2']
        self._run_test(Z7, expected_stderr=expected)

    def test_no_Z14(self):
        Z7 = _read_test_json('python3_no_Z14.json')
        expected = _read_test_json('python3_no_Z14_expected.json')['Z22K2']
        self._run_test(Z7, expected_stderr=expected)

    def test_main(self):
        Z7 = _read_test_json('python3_add.json')
        Z7_full = {'function_call': Z7}
        Z7_string = json.dumps(Z7_full)
        expected = _read_test_json('python3_add_expected.json')['Z22K1']
        self._stdin.write(Z7_string + '\n')
        self._stdin.seek(0)
        executor.main(self._stdin, self._stdout, self._stderr)
        self._stdin.close()
        self._stdout.seek(0)
        self.assertEqual(expected, json.loads(self._stdout.read().strip()))


if __name__ == '__main__':
    unittest.main()
