import json
import sys


###        ###
# Exceptions #
###        ###
# TODO(T287507): Place in a separate source file, exceptions.py.
class EvaluatorError(Exception):
    pass
###            ###
# End Exceptions #
###            ###


###           ###
# Serialization #
###           ###
# TODO(T287507): Place in a separate source file, serialization.py.
def _DESERIALIZE_Z10(Z10):
    result = []
    head = Z10.get('Z10K1')
    tail = Z10.get('Z10K2')
    if head is not None:
        result.append(deserialize(head))
        result.extend(_DESERIALIZE_Z10(tail))
    return result


_DESERIALIZE_Z6 = lambda Z6: Z6['Z6K1']
_DESERIALIZE_Z21 = lambda Z21: None
_DESERIALIZE_Z40 = lambda Z40: Z40['Z40K1']['Z9K1'] == 'Z41'
_DESERIALIZERS = {
    'Z6': _DESERIALIZE_Z6,
    'Z10': _DESERIALIZE_Z10,
    'Z21': _DESERIALIZE_Z21,
    'Z40': _DESERIALIZE_Z40,
}


def _get_ZObject_type(ZObject):
    """Determine the ZID corresponding to the type of a ZObject."""
    Z1K1 = ZObject.get('Z1K1')
    try:
        # Z1K1 for most types is a Z9.
        return Z1K1.get('Z9K1')
    except AttributeError:
        # Z1K1 is either str or None, so original object was a Z6, a Z9, or not
        # a very good ZObject.
        return Z1K1


def deserialize(ZObject):
    """Convert a ZObject into the corresponding Python type.
        Z6 -> str
        Z10 -> list
        Z21 -> None
        Z40 -> bool
    """
    ZID = _get_ZObject_type(ZObject)
    deserializer = _DESERIALIZERS.get(ZID)
    if deserializer is None:
        raise EvaluatorError('Could not deserialize input ZObject type: {}'.format(ZID))
    return deserializer(ZObject)


def _SERIALIZE_Z10(iterable):
    def _empty_Z10():
        return { 'Z1K1': { 'Z1K1': 'Z9', 'Z9K1': 'Z10' } }
    result = current = _empty_Z10()
    for element in iterable:
        current['Z10K1'] = serialize(element)
        current['Z10K2'] = _empty_Z10()
        current = current['Z10K2']
    return result


def _SERIALIZE_Z21(nothing):
    return { 'Z1K1': { 'Z1K1': 'Z9', 'Z9K1': 'Z21' } }


def _SERIALIZE_Z40(boolean):
    ZID = 'Z41' if boolean else 'Z42'
    return {
        'Z1K1': { 'Z1K1': 'Z9', 'Z9K1': 'Z40' },
        'Z40K1': { 'Z1K1': 'Z9', 'Z9K1': ZID },
    }


_SERIALIZE_Z6 = lambda string: {'Z1K1': 'Z6', 'Z6K1': string}
_SERIALIZERS = {
    'Z6': _SERIALIZE_Z6,
    'Z10': _SERIALIZE_Z10,
    'Z21': _SERIALIZE_Z21,
    'Z40': _SERIALIZE_Z40,
}


# TODO: Consider just inferring the type from Z7.Z7K1.Z8K2.
def _get_python_type(py_object):
    """Infer the type of a Python object and try to find the corresponding ZID."""
    if isinstance(py_object, str):
        return 'Z6'
    if isinstance(py_object, bool):
        return 'Z40'
    try:
        iterator = iter(py_object)
        return 'Z10'
    except TypeError:
        pass
    if py_object is None:
        return 'Z21'


def serialize(py_object):
    """Convert a Python object into the corresponding ZObject type.
        str -> Z6
        list -> Z10
        None -> Z21
        bool -> Z40
    """
    ZID = _get_python_type(py_object)
    serializer = _SERIALIZERS.get(ZID)
    if ZID is None or serializer is None:
        raise EvaluatorError('Could not serialize input python object: {}'.format(repr(py_object)))
    return serializer(py_object)
###               ###
# End Serialization #
###               ###


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


# TODO: Collapse this into function-schemata.
def _error(message):
    return {
        "Z1K1": { "Z1K1": "Z9", "Z9K1": "Z5" },
        "Z5K2": { "Z1K1": "Z6", "Z6K1": message },
    }


def _write_zobject(zobject, stream):
    stream.write(json.dumps(zobject))


def execute(Z7, stdout=sys.stdout, stderr=sys.stderr):
    # stderr.write(','.join(sys.path))
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
    try:
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
                # TODO: Pass serialization as native code.
                '_DESERIALIZE': deserialize,
                '_SERIALIZE': serialize
            }
        )
    except EvaluatorError as e:
        _write_zobject(_error(e.args[0]), stderr)
    else:
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
