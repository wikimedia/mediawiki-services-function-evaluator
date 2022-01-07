import io
import json
import os
import re
import sys
import unittest
from unittest.mock import patch

# TODO(T282795): This is a kludge due to how env variables work in Blubber;
# would be better if PYTHONPATH could be controlled directly.
from . import utils as test_utils
from .. import executor


_DATA_DIR = os.path.join(os.path.dirname(__file__), "test_data")


def _read_test_json(file_name):
    with open(os.path.join(_DATA_DIR, file_name), "r") as inp:
        return json.load(inp)


class ExecutorTest(unittest.TestCase):

    maxDiff = None

    def _run_test(self, zobject, expected_result):
        actual = executor.execute(zobject)
        self.assertEqual(
            test_utils.without_z1k1s(expected_result), test_utils.without_z1k1s(actual)
        )

    def test_runs_function_call(self):
        Z7 = _read_test_json("python3_add.json")
        expected = _read_test_json("add_expected.json")
        self._run_test(Z7, expected)

    def test_runs_function_call_with_generics(self):
        Z7 = _read_test_json("python3_add_with_generics.json")
        expected = _read_test_json("add_expected.json")
        self._run_test(Z7, expected)

    def test_runs_lambda(self):
        Z7 = _read_test_json("python3_add_lambda.json")
        expected = _read_test_json("add_expected.json")
        self._run_test(Z7, expected)

    def test_various_types(self):
        Z7 = _read_test_json("python3_compound_type.json")
        expected = _read_test_json("compound_type_expected.json")
        self._run_test(Z7, expected)

    def test_various_types_generic(self):
        Z7 = _read_test_json("python3_compound_type_generic.json")
        expected = _read_test_json("compound_type_expected.json")
        self._run_test(Z7, expected)

    def test_list_o_lists_o_strings_input(self):
        Z7 = _read_test_json("generic_type_input.json")
        Z7["Z1000K1"] = _read_test_json("list_list_strings.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "list_list_string_input_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("string_in_lists.json")
        self._run_test(Z7, expected)

    def test_list_o_lists_o_strings_output(self):
        Z7 = _read_test_json("generic_type_output.json")
        Z7["Z1000K1"] = _read_test_json("string_in_lists.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "list_list_string_output_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("list_list_strings.json")
        Z7["Z7K1"]["Z8K2"] = expected["Z22K1"]["Z1K1"]
        self._run_test(Z7, expected)

    def test_list_o_lists_o_strings_output_unspecified(self):
        Z7 = _read_test_json("generic_type_output.json")
        Z7["Z1000K1"] = _read_test_json("string_in_lists.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "list_list_string_output_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("list_list_strings.json")
        Z7["Z7K1"]["Z8K2"] = {"Z1K1": "Z9", "Z9K1": "Z1"}
        self._run_test(Z7, expected)

    def test_pair_string_pair_string_string_input(self):
        Z7 = _read_test_json("generic_type_input.json")
        Z7["Z1000K1"] = _read_test_json("pair_string_pair_string_string.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "pair_string_pair_string_string_input_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("string_in_pairs.json")
        self._run_test(Z7, expected)

    def test_pair_string_pair_string_string_output(self):
        Z7 = _read_test_json("generic_type_output.json")
        Z7["Z1000K1"] = _read_test_json("string_in_pairs.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "pair_string_pair_string_string_output_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("pair_string_pair_string_string.json")
        Z7["Z7K1"]["Z8K2"] = expected["Z22K1"]["Z1K1"]
        self._run_test(Z7, expected)

    def test_pair_string_pair_string_string_output_unspecified(self):
        Z7 = _read_test_json("generic_type_output.json")
        Z7["Z1000K1"] = _read_test_json("string_in_pairs.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "pair_string_pair_string_string_output_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("pair_string_pair_string_string.json")
        Z7["Z7K1"]["Z8K2"] = {"Z1K1": "Z9", "Z9K1": "Z1"}
        self._run_test(Z7, expected)

    def test_map_string_string(self):
        Z7 = _read_test_json("map_string_string_Z7.json")
        Z7["Z1802K1"] = _read_test_json("map_string_bool.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "map_string_string_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("map_string_string.json")
        self._run_test(Z7, expected)

    def test_map_string_string_unspecified(self):
        Z7 = _read_test_json("map_string_string_Z7.json")
        Z7["Z1802K1"] = _read_test_json("map_string_bool.json")
        Z7["Z7K1"]["Z8K4"] = _read_test_json(
            "map_string_string_python3_implementation.json"
        )
        expected = _read_test_json("result_envelope_template.json")
        expected["Z22K1"] = _read_test_json("map_string_string.json")
        Z7["Z7K1"]["Z8K2"] = {"Z1K1": "Z9", "Z9K1": "Z1"}
        self._run_test(Z7, expected)

    def test_user_defined_input(self):
        Z7 = _read_test_json("python3_user_defined_input.json")
        Z7["Z1000K1"] = _read_test_json("user_defined_input_Z1000K1.json")
        expected = _read_test_json("user_defined_input_expected.json")
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
        self.assertEqual(
            test_utils.without_z1k1s(expected),
            test_utils.without_z1k1s(json.loads(self._stdout.read().strip())),
        )

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
        self.assertEqual(
            test_utils.without_z1k1s(expected),
            test_utils.without_z1k1s(json.loads(self._stdout.read().strip())),
        )


if __name__ == "__main__":
    unittest.main()
