from python3 import exceptions
from python3 import utils


# TODO(T292788): Eliminate this function.
def _DESERIALIZE_Z10(Z10):
    result = []
    head = Z10.get("Z10K1")
    tail = Z10.get("Z10K2")
    if head is not None:
        result.append(deserialize(head))
        result.extend(_DESERIALIZE_Z10(tail))
    return result


def _DESERIALIZE_ZLIST(ZObject):
    result = []
    tail = ZObject
    while True:
        head = tail.get("K1")
        if head is None:
            break
        result.append(deserialize(head))
        tail = tail.get("K2")
    return result


class ZPair:
    def __init__(self, K1, K2, original_Z1K1=None):
        self._Z1K1 = original_Z1K1
        self._K1 = K1
        self._K2 = K2

    @property
    def K1(self):
        return self._K1

    @property
    def K2(self):
        return self._K2

    @property
    def Z1K1(self):
        return self._Z1K1


# TODO(T290898): This can serve as a model for default deserialization--all
# local keys can be deserialized and set as members.
def _DESERIALIZE_ZPAIR(Z_object):
    return ZPair(
        deserialize(Z_object["K1"]), deserialize(Z_object["K2"]), Z_object["Z1K1"]
    )


_DESERIALIZE_Z6 = lambda Z6: Z6["Z6K1"]
_DESERIALIZE_Z21 = lambda Z21: None
_DESERIALIZE_Z40 = lambda Z40: Z40["Z40K1"]["Z9K1"] == "Z41"
_DESERIALIZE_Z86 = lambda Z86: Z86["Z86K1"]["Z6K1"]
_DESERIALIZERS = {
    "Z6": _DESERIALIZE_Z6,
    "Z10": _DESERIALIZE_Z10,
    "Z21": _DESERIALIZE_Z21,
    "Z40": _DESERIALIZE_Z40,
    "Z86": _DESERIALIZE_Z86,
    "Z882": _DESERIALIZE_ZPAIR,
    # TODO(T292260): What's the real ZID, bub?
    "Z1010": _DESERIALIZE_ZLIST,
}


def deserialize(ZObject):
    """Convert a ZObject into the corresponding Python type.
    Z6 -> str
    Z10 -> list
    Z21 -> None
    Z40 -> bool
    """
    ZID = utils.get_zobject_type(ZObject)
    deserializer = _DESERIALIZERS.get(ZID)
    if deserializer is None:
        raise exceptions.EvaluatorError(
            "Could not deserialize input ZObject type: {}".format(ZID)
        )
    return deserializer(ZObject)


def _SERIALIZE_Z1(anything, _):
    ZID = utils.get_python_type(anything)
    if ZID is None:
        raise exceptions.EvaluatorError(
            "Could not serialize input python object: {}".format(repr(anything))
        )
    return serialize(anything, {"Z1K1": "Z9", "Z9K1": ZID})


# TODO(T292788): Eliminate this function.
def _SERIALIZE_Z10(iterable, _):
    def _empty_Z10():
        return {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}}

    result = current = _empty_Z10()
    for element in iterable:
        current["Z10K1"] = serialize(element, {"Z1K1": "Z9", "Z9K1": "Z1"})
        current["Z10K2"] = _empty_Z10()
        current = current["Z10K2"]
    return result


def _serialize_zlist_internal(generator, expected_type):
    result = {"Z1K1": expected_type}
    try:
        element = next(generator)
    except StopIteration:
        pass
    else:
        expected_args = utils.z10_to_list(expected_type["Z4K2"])
        head_key = expected_args[0]
        result[head_key["Z3K2"]["Z6K1"]] = serialize(element, head_key["Z3K1"])
        tail_key = expected_args[1]
        result[tail_key["Z3K2"]["Z6K1"]] = _serialize_zlist_internal(
            generator, expected_type
        )
    return result


def _to_generator(iterable):
    for element in iterable:
        yield element


def _SERIALIZE_ZLIST(iterable, expected_type):
    return _serialize_zlist_internal(_to_generator(iterable), expected_type)


def _SERIALIZE_ZPAIR(the_pair, expected_type):
    result = {"Z1K1": expected_type}
    expected_args = utils.z10_to_list(expected_type["Z4K2"])
    for expected_arg in expected_args:
        the_key = expected_arg["Z3K2"]["Z6K1"]
        subtype = expected_arg["Z3K1"]
        result[the_key] = serialize(getattr(the_pair, the_key), subtype)
    return result


def _SERIALIZE_Z21(nothing, _):
    return {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z21"}}


def _SERIALIZE_Z40(boolean, _):
    ZID = "Z41" if boolean else "Z42"
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"},
        "Z40K1": {"Z1K1": "Z9", "Z9K1": ZID},
    }


def _SERIALIZE_Z86(code_point, _):
    return {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z86"}, "Z86K1": _SERIALIZE_Z6(code_point)}


_SERIALIZE_Z6 = lambda string, _: {"Z1K1": "Z6", "Z6K1": string}
_SERIALIZERS = {
    "Z1": _SERIALIZE_Z1,
    "Z6": _SERIALIZE_Z6,
    # TODO(T292788): Eliminate Z10.
    "Z10": _SERIALIZE_Z10,
    "Z21": _SERIALIZE_Z21,
    "Z40": _SERIALIZE_Z40,
    "Z86": _SERIALIZE_Z86,
    "Z882": _SERIALIZE_ZPAIR,
    # TODO(T292260): What's the real ZID, bub?
    "Z1010": _SERIALIZE_ZLIST,
}


def serialize(py_object, expected_type):
    """Convert a Python object into the corresponding ZObject type.
    str -> Z6
    list -> Z10
    None -> Z21
    bool -> Z40
    """
    ZID = utils.get_zid(expected_type)
    serializer = _SERIALIZERS.get(ZID)
    if ZID is not None and serializer is not None:
        try:
            return serializer(py_object, expected_type)
        except Exception as e:
            pass
    raise exceptions.EvaluatorError(
        "Could not serialize input python object: {}".format(repr(py_object))
    )
