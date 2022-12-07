import json
import logging
import sys

import os

from python3 import serialization
from python3 import utils
from python3 import ztypes
from python3 import wikifunctions


_RESULT_CACHE = {}


_FUNCTION_TEMPLATE = """
{implementation}


bound_values = dict()
for key, value in _BOUND_VALUES.items():
    bound_values[key] = _DESERIALIZE(value)


_RESULT_CACHE['{return_value}'] = _SERIALIZE(
    {function_name}(**bound_values)
)
"""


# TODO (T282891): Collapse this into function-schemata.
def _error(message):
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z5"},
        "Z5K2": {"Z1K1": "Z6", "Z6K1": message},
    }


def void():
    """Creates a Z24 (Void).

    Returns:
        ZObject corresponding to Z24
    """
    # TODO (T282891): Use function-schemata version.
    return {"Z1K1": "Z9", "Z9K1": "Z24"}


def execute(function_call, stdin=sys.stdin, stdout=sys.stdout):
    # TODO (T282891): Handle input that fails to validate all at once instead of ad hoc.
    try:
        function_name = function_call["functionName"]
    except KeyError:
        return utils.make_mapped_result_envelope(
            None, _error("Function call did not provide functionName.")
        )

    # TODO (T289319): Consider whether to reduce all keys to local keys.
    argument_names = []
    bound_values = {}
    for key, value in function_call.get("functionArguments", {}).items():
        argument_names.append(key)
        bound_values[key] = value
    try:
        implementation = function_call["codeString"]
    except KeyError:
        return utils.make_mapped_result_envelope(
            None, _error("Function call did not provide codeString.")
        )

    return_value = function_name + "K0"
    try:
        exec(
            _FUNCTION_TEMPLATE.format(
                function_name=function_name,
                argument_list=",".join(argument_names),
                implementation=implementation,
                return_value=return_value,
            ),
            {
                "_RESULT_CACHE": _RESULT_CACHE,
                "W": wikifunctions.Wikifunctions(stdin, stdout),
                "ZPair": ztypes.ZPair,
                "ZObject": ztypes.ZObject,
            },
            {
                "_BOUND_VALUES": bound_values,
                # TODO (T288555): Pass serialization as native code.
                "_DESERIALIZE": serialization.deserialize,
                "_SERIALIZE": serialization.serialize,
            },
        )
    except Exception as e:
        logging.exception(e)
        return utils.make_mapped_result_envelope(None, _error(e.args[0]))
    else:
        return utils.make_mapped_result_envelope(_RESULT_CACHE[return_value], None)


def main(stdin=sys.stdin, stdout=sys.stdout, stderr=sys.stderr):
    for line in stdin:
        function_call = json.loads(line)
        if function_call:
            result = execute(function_call, stdin, stdout)
            stdout.write(json.dumps(result))
            stdout.write("\n")
            stdout.flush()
            break
    stderr.write("end")
    stderr.write("\n")
    stderr.flush()


if __name__ == "__main__":
    main()
