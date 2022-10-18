import json
import logging
import sys

import os

from python3 import serialization
from python3 import utils
from python3 import ztypes


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


def execute(Z7):
    # TODO (T282891): Handle input that fails to validate all at once instead of ad hoc.
    try:
        function_name = Z7["Z7K1"]["Z8K5"]["Z9K1"]
    except KeyError:
        return utils.make_mapped_result_envelope(
            None, _error("Z7K1 did not contain a valid Function.")
        )

    # TODO (T289319): Consider whether to reduce all keys to local keys.
    argument_names = [key for key in Z7 if key.startswith(function_name)]
    bound_values = {
        argument_name: Z7[argument_name] for argument_name in argument_names
    }
    try:
        implementations = utils.convert_zlist_to_list(Z7["Z7K1"]["Z8K4"])
        implementation = implementations[0]["Z14K3"]["Z16K2"]["Z6K1"]
    except KeyError:
        return utils.make_mapped_result_envelope(
            None, _error("Z8K4 did not contain a valid Implementation.")
        )

    return_value = function_name + "K0"
    return_type = Z7["Z7K1"]["Z8K2"]
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


def main(stdin=sys.stdin, stdout=sys.stdout):
    for line in stdin:
        the_input = json.loads(line)
        function_call = the_input.get("function_call")
        if function_call is not None:
            result = execute(function_call)
            stdout.write(json.dumps(result))


if __name__ == "__main__":
    main()
