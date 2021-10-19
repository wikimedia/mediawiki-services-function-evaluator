import io
import json
import os
import re
import sys
import unittest
from unittest.mock import patch

# TODO(T282795): This is a kludge due to how env variables work in Blubber;
# would be better if PYTHONPATH could be controlled directly.
from .. import executor


_DATA_DIR = os.path.join(os.path.dirname(__file__), "test_data")


def _read_test_json(file_name):
    with open(os.path.join(_DATA_DIR, file_name), "r") as inp:
        return json.load(inp)


# TODO(T292808): Re-enable test of python3_compound_type.json.
class ExecutorTest(unittest.TestCase):
    def setUp(self):
        super().setUp()
        self.maxDiff = None

    def _run_test(self, zobject, expected_result):
        actual = executor.execute(zobject)
        self.assertEqual(expected_result, actual)

    def test_runs_function_call(self):
        Z7 = _read_test_json("python3_add.json")
        expected = _read_test_json("add_expected.json")
        self._run_test(Z7, expected)

    def test_runs_lambda(self):
        Z7 = _read_test_json("python3_add_lambda.json")
        expected = _read_test_json("add_expected.json")
        self._run_test(Z7, expected)

    def test_list_o_lists_o_strings_input(self):
        Z7 = _read_test_json("list_list_string_input.json")
        Z7["Z1000K1"] = _read_test_json("list_list_strings.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "list_list_string_input_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("string_in_lists.json")
        self._run_test(Z7, expected)

    def test_list_o_lists_o_strings_output(self):
        Z7 = _read_test_json("list_list_string_output.json")
        Z7["Z1000K1"] = _read_test_json("string_in_lists.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "list_list_string_output_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("list_list_strings.json")
        Z7["Z7K1"]["Z8K2"] = expected["Z22K1"]["Z1K1"]
        self._run_test(Z7, expected)

    def test_undeserializable_type(self):
        Z7 = _read_test_json("python3_unsupported_input.json")
        expected = _read_test_json("unsupported_input_expected.json")
        self._run_test(Z7, expected)

    def test_unserializable_type(self):
        Z7 = _read_test_json("python3_unsupported_output.json")
        expected = _read_test_json("python3_unsupported_output_expected.json")
        self._run_test(Z7, expected)

    def test_no_Z8(self):
        Z7 = _read_test_json("python3_no_Z8.json")
        expected = _read_test_json("no_Z8_expected.json")
        self._run_test(Z7, expected)

    def test_no_Z14(self):
        Z7 = _read_test_json("python3_no_Z14.json")
        expected = _read_test_json("no_Z14_expected.json")
        self._run_test(Z7, expected)


class MainTest(unittest.TestCase):
    def setUp(self):
        self._stdin = io.StringIO()
        self._stdout = io.StringIO()

    def test_main_add(self):
        Z7 = _read_test_json("python3_add.json")
        Z7_full = {"function_call": Z7}
        Z7_string = json.dumps(Z7_full)
        expected = _read_test_json("add_expected.json")
        self._stdin.write(Z7_string + "\n")
        self._stdin.seek(0)
        executor.main(self._stdin, self._stdout)
        self._stdin.close()
        self._stdout.seek(0)
        self.assertEqual(expected, json.loads(self._stdout.read().strip()))

    def test_main_syntax_failure(self):
        Z7 = _read_test_json("python3_syntax_failure.json")
        Z7_full = {"function_call": Z7}
        Z7_string = json.dumps(Z7_full)
        expected = _read_test_json("python3_syntax_failure_expected.json")
        self._stdin.write(Z7_string + "\n")
        self._stdin.seek(0)
        executor.main(self._stdin, self._stdout)
        self._stdin.close()
        self._stdout.seek(0)
        self.assertEqual(expected, json.loads(self._stdout.read().strip()))


if __name__ == "__main__":
    unittest.main()
