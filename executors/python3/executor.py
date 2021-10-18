import json
import sys


###       ###
# Utilities #
###       ###
# TODO(T287507): Place in a separate source file, utils.py.
def _z10_to_list(Z10):
    result = []
    tail = Z10
    while tail is not None:
        result.append(tail.get('Z10K1'))
        tail = tail.get('Z10K2')
    return result


# TODO: All _is_zwhatev functions should use function-schemata.
def _is_zreference(Z9):
    try:
        return Z9.get('Z1K1') == 'Z9' and isinstance(Z9.get('Z9K1'), str)
    except AttributeError:
        return False


def _is_zfunction_call(Z7):
    try:
        return Z7.get('Z1K1', {}).get('Z9K1') == 'Z7'
    except AttributeError:
        return False


def _is_ztype(Z4):
    try:
        return Z4.get('Z1K1', {}).get('Z9K1') == 'Z4'
    except AttributeError:
        return False


def _is_zfunction(Z8):
    try:
        return Z8.get('Z1K1', {}).get('Z9K1') == 'Z8'
    except AttributeError:
        return False


def _get_zid(Z4):
    if _is_zfunction(Z4):
        return _get_zid(Z4.get('Z8K5', {}))
    if _is_zreference(Z4):
        return Z4['Z9K1']
    if _is_zfunction_call(Z4):
        Z7K1 = Z4.get('Z7K1', {})
        return _get_zid(Z7K1)
    if _is_ztype(Z4):
        return _get_zid(Z4['Z4K1'])
    if isinstance(Z4, str):
        # If Z4 is a string, original object was a Z6 or a Z9.
        return Z4
    # I guess this wasn't a very good ZObject.
    raise EvaluatorError('Could not determine type for {}'.format(Z4))


def _to_generator(iterable):
    for element in iterable:
        yield element


def _get_zobject_type(ZObject):
    """Determine the ZID corresponding to the type of a ZObject."""
    return _get_zid(ZObject.get('Z1K1'))


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
###           ###
# End Utilities #
###           ###


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
# TODO(T292788): Eliminate this function.
def _DESERIALIZE_Z10(Z10):
    result = []
    head = Z10.get('Z10K1')
    tail = Z10.get('Z10K2')
    if head is not None:
        result.append(deserialize(head))
        result.extend(_DESERIALIZE_Z10(tail))
    return result


def _DESERIALIZE_ZLIST(ZObject):
    result = []
    tail = ZObject
    while True:
        head = tail.get('K1')
        if head is None:
            break
        result.append(deserialize(head))
        tail = tail.get('K2')
    return result


_DESERIALIZE_Z6 = lambda Z6: Z6['Z6K1']
_DESERIALIZE_Z21 = lambda Z21: None
_DESERIALIZE_Z40 = lambda Z40: Z40['Z40K1']['Z9K1'] == 'Z41'
_DESERIALIZE_Z86 = lambda Z86: Z86['Z86K1']['Z6K1']
_DESERIALIZERS = {
    'Z6': _DESERIALIZE_Z6,
    'Z10': _DESERIALIZE_Z10,
    'Z21': _DESERIALIZE_Z21,
    'Z40': _DESERIALIZE_Z40,
    'Z86': _DESERIALIZE_Z86,
    # TODO(T292260): What's the real ZID, bub?
    'Z1010': _DESERIALIZE_ZLIST
}


def deserialize(ZObject):
    """Convert a ZObject into the corresponding Python type.
        Z6 -> str
        Z10 -> list
        Z21 -> None
        Z40 -> bool
    """
    ZID = _get_zobject_type(ZObject)
    deserializer = _DESERIALIZERS.get(ZID)
    if deserializer is None:
        raise EvaluatorError('Could not deserialize input ZObject type: {}'.format(ZID))
    return deserializer(ZObject)


# TODO(T292788): Eliminate this function.
def _SERIALIZE_Z10(iterable, _):
    def _empty_Z10():
        return { 'Z1K1': { 'Z1K1': 'Z9', 'Z9K1': 'Z10' } }
    result = current = _empty_Z10()
    for element in iterable:
        current['Z10K1'] = serialize(element)
        current['Z10K2'] = _empty_Z10()
        current = current['Z10K2']
    return result


def _serialize_zlist_internal(generator, expected_type):
    result = {
        'Z1K1': expected_type
    }
    try:
        element = next(generator)
    except StopIteration:
        pass
    else:
        expected_args = _z10_to_list(expected_type['Z4K2'])
        head_key = expected_args[0]
        result[head_key['Z3K2']['Z6K1']] = serialize(element, head_key['Z3K1'])
        tail_key = expected_args[1]
        result[tail_key['Z3K2']['Z6K1']] = _serialize_zlist_internal(generator, expected_type)
    return result


def _SERIALIZE_ZLIST(iterable, expected_type):
    return _serialize_zlist_internal(_to_generator(iterable), expected_type)


def _SERIALIZE_Z21(nothing, _):
    return { 'Z1K1': { 'Z1K1': 'Z9', 'Z9K1': 'Z21' } }


def _SERIALIZE_Z40(boolean, _):
    ZID = 'Z41' if boolean else 'Z42'
    return {
        'Z1K1': { 'Z1K1': 'Z9', 'Z9K1': 'Z40' },
        'Z40K1': { 'Z1K1': 'Z9', 'Z9K1': ZID },
    }


def _SERIALIZE_Z86(code_point, _):
    return {
        'Z1K1': { 'Z1K1': 'Z9', 'Z9K1': 'Z86' },
        'Z86K1': _SERIALIZE_Z6(code_point)
    }


_SERIALIZE_Z6 = lambda string, _: {'Z1K1': 'Z6', 'Z6K1': string}
_SERIALIZERS = {
    'Z6': _SERIALIZE_Z6,
    # TODO(T292788): Eliminate Z10.
    'Z10': _SERIALIZE_Z10,
    'Z21': _SERIALIZE_Z21,
    'Z40': _SERIALIZE_Z40,
    'Z86': _SERIALIZE_Z86,
    # TODO(T292260): What's the real ZID, bub?
    'Z1010': _SERIALIZE_ZLIST
}


def serialize(py_object, expected_type):
    """Convert a Python object into the corresponding ZObject type.
        str -> Z6
        list -> Z10
        None -> Z21
        bool -> Z40
    """
    ZID = _get_zid(expected_type)
    serializer = _SERIALIZERS.get(ZID)
    if ZID is None or serializer is None:
        raise EvaluatorError('Could not serialize input python object: {}'.format(repr(py_object)))
    try:
        return serializer(py_object, expected_type)
    except:
        raise EvaluatorError('Could not serialize input python object: {}'.format(repr(py_object)))
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
    {function_name}(**bound_values),
    _RETURN_TYPE
)
"""


# TODO: Collapse this into function-schemata.
def _error(message):
    return {
        "Z1K1": { "Z1K1": "Z9", "Z9K1": "Z5" },
        "Z5K2": { "Z1K1": "Z6", "Z6K1": message },
    }


def unit():
    """Creates a Z23 (Nothing).

    Returns:
        ZObject corresponding to Z23
    """
    # TODO(T282891): Use function-schemata version.
    return { "Z1K1": "Z9", "Z9K1": "Z23" }


def make_pair(good_result=None, bad_result=None):
    """Creates a Z22 containing goodResult and BadResult.

    Args:
        good_result: Z22K1 of the resulting Z22
        bad_result: Z22K2 of the resulting Z22
    Returns:
        Z22 encapsulating the arguments
    """
    # TODO(T282891): Use function-schemata version.
    Z1K1 = {
        "Z1K1": "Z9",
        "Z9K1": "Z22"
    }
    return {
        "Z1K1": Z1K1,
        "Z22K1": good_result if good_result is not None else unit(),
        "Z22K2": bad_result if bad_result is not None else unit()
    }


def execute(Z7):
    # TODO: Handle input that fails to validate all at once instead of ad hoc.
    try:
        function_name = Z7["Z7K1"]["Z8K5"]["Z9K1"]
    except KeyError:
        return make_pair(
            None,
            _error("Z7K1 did not contain a valid Function."))

    # TODO: Ensure that these match declared arguments? (already done in orchestrator)
    # TODO(T289319): Handle local keys.
    argument_names = [key for key in Z7 if key.startswith(function_name)]
    bound_values = {
        argument_name: Z7[argument_name]
        for argument_name in argument_names
    }
    # TODO: This gets only the first implementation. What if a longer list is sent?
    try:
        implementation = Z7["Z7K1"]["Z8K4"]["Z10K1"]["Z14K3"]["Z16K2"]["Z6K1"]
    except KeyError:
        return make_pair(
            None,
            _error("Z8K4 did not contain a valid Implementation."))

    # TODO: Augment this key with a unique execution ID.
    return_value = function_name + "K0"
    return_type = Z7['Z7K1']['Z8K2']
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
                '_SERIALIZE': serialize,
                '_RETURN_TYPE': return_type
            }
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


if __name__ == '__main__':
    main()
