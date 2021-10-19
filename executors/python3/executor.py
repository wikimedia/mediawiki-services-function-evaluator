import json
import sys

import os

from python3 import serialization


_RESULT_CACHE = {}


_FUNCTION_TEMPLATE = """
{implementation}


bound_values = dict()
for key, value in _BOUND_VALUES.items():
    bound_values[key] = _DESERIALIZE(value)


_RESULT_CACHE['{return_value}'] = _SERIALIZE(
    {function_name}(**bound_values),
    _RETURN_TYPE
)
"""


# TODO: Collapse this into function-schemata.
def _error(message):
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z5"},
        "Z5K2": {"Z1K1": "Z6", "Z6K1": message},
    }


def unit():
    """Creates a Z23 (Nothing).

    Returns:
        ZObject corresponding to Z23
    """
    # TODO(T282891): Use function-schemata version.
    return {"Z1K1": "Z9", "Z9K1": "Z23"}


def make_pair(good_result=None, bad_result=None):
    """Creates a Z22 containing goodResult and BadResult.

    Args:
        good_result: Z22K1 of the resulting Z22
        bad_result: Z22K2 of the resulting Z22
    Returns:
        Z22 encapsulating the arguments
    """
    # TODO(T282891): Use function-schemata version.
    Z1K1 = {"Z1K1": "Z9", "Z9K1": "Z22"}
    return {
        "Z1K1": Z1K1,
        "Z22K1": good_result if good_result is not None else unit(),
        "Z22K2": bad_result if bad_result is not None else unit(),
    }


def execute(Z7):
    # TODO: Handle input that fails to validate all at once instead of ad hoc.
    try:
        function_name = Z7["Z7K1"]["Z8K5"]["Z9K1"]
    except KeyError:
        return make_pair(None, _error("Z7K1 did not contain a valid Function."))

    # TODO: Ensure that these match declared arguments? (already done in orchestrator)
    # TODO(T289319): Handle local keys.
    argument_names = [key for key in Z7 if key.startswith(function_name)]
    bound_values = {
        argument_name: Z7[argument_name] for argument_name in argument_names
    }
    # TODO: This gets only the first implementation. What if a longer list is sent?
    try:
        implementation = Z7["Z7K1"]["Z8K4"]["Z10K1"]["Z14K3"]["Z16K2"]["Z6K1"]
    except KeyError:
        return make_pair(None, _error("Z8K4 did not contain a valid Implementation."))

    # TODO: Augment this key with a unique execution ID.
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
            {"_RESULT_CACHE": _RESULT_CACHE},
            {
                "_BOUND_VALUES": bound_values,
                # TODO: Pass serialization as native code.
                "_DESERIALIZE": serialization.deserialize,
                "_SERIALIZE": serialization.serialize,
                "_RETURN_TYPE": return_type,
            },
        )
    except Exception as e:
        return make_pair(None, _error(e.args[0]))
    else:
        # TODO: Expire cache after access.
        return make_pair(_RESULT_CACHE[return_value], None)


# TODO: If PYTHONPATH could be controlled in Blubber, then stream deps could
# be mocked in tests instead of injected.
def main(stdin=sys.stdin, stdout=sys.stdout):
    # TODO: Accept chunked input. Probably best just to run a service instead
    # of a subprocess?
    for line in stdin:
        the_input = json.loads(line)
        function_call = the_input.get("function_call")
        if function_call is not None:
            result = execute(function_call)
            stdout.write(json.dumps(result))


if __name__ == "__main__":
    main()
