import json
import sys


_RESULT_CACHE = {}


_FUNCTION_TEMPLATE = """
{implementation}


bound_values = dict()
for key, value in _BOUND_VALUES.items():
    bound_values[key] = Z6_to_string(value)


_RESULT_CACHE['{return_value}'] = string_to_Z6(
    {function_name}(**bound_values)
)
"""


# TODO: Collapse this into function-schemata.
def _error(message):
    return {
        "Z1K1": { "Z1K1": "Z9", "Z9K1": "Z5" },
        "Z5K2": { "Z1K1": "Z6", "Z6K1": message },
    }


def _write_zobject(zobject, stream):
    stream.write(json.dumps(zobject))


def execute(Z7, stdout=sys.stdout, stderr=sys.stderr):
    # TODO: Handle input that fails to validate all at once instead of ad hoc.
    try:
        function_name = Z7["Z7K1"]["Z8K5"]["Z9K1"]
    except KeyError:
        _write_zobject(_error("Z7K1 did not contain a valid Function."), stderr)
        return

    # TODO: Ensure that these match declared arguments? (already done in orchestrator)
    argument_names = [key for key in Z7 if key.startswith(function_name)]
    bound_values = {
        argument_name: Z7[argument_name]
        for argument_name in argument_names
    }
    # TODO: This gets only the first implementation. What if a longer list is sent?
    try:
        implementation = Z7["Z7K1"]["Z8K4"]["Z10K1"]["Z14K3"]["Z16K2"]["Z6K1"]
    except KeyError:
        _write_zobject(_error("Z8K4 did not contain a valid Implementation."), stderr)
        return

    # TODO: Augment this key with a unique execution ID.
    return_value = function_name + "K0"
    exec(
        _FUNCTION_TEMPLATE.format(
            function_name=function_name,
            argument_list=','.join(argument_names),
            implementation=implementation,
            return_value=return_value
        ),
        {'_RESULT_CACHE': _RESULT_CACHE},
        {
            '_BOUND_VALUES': bound_values,
            # TODO: Pass deserialization as native code.
            'Z6_to_string': lambda Z6: Z6['Z6K1'],
            'string_to_Z6': lambda string: {'Z1K1': 'Z6', 'Z6K1': string}
        }
    )
    # TODO: Expire cache after access.
    _write_zobject(_RESULT_CACHE[return_value], stdout)


# TODO: If PYTHONPATH could be controlled in Blubber, then stream deps could
# be mocked in tests instead of injected.
def main(stdin=sys.stdin, stdout=sys.stdout, stderr=sys.stderr):
    # TODO: Accept chunked input. Probably best just to run a service instead
    # of a subprocess?
    for line in stdin:
        the_input = json.loads(line)
        function_call = the_input.get("function_call")
        if function_call is not None:
            execute(function_call, stdout, stderr)


if __name__ == '__main__':
    main()
