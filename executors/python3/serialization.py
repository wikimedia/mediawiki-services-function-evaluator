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


# TODO(T290898): This can serve as a model for default deserialization--all
# local keys can be deserialized and set as members.
def _DESERIALIZE_ZPAIR(Z_object):
    return utils.ZPair(
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
    "Z881": _DESERIALIZE_ZLIST,
    "Z882": _DESERIALIZE_ZPAIR,
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


def _serialize_zlist_internal(elements, expected_type):
    def _empty_list():
        return {"Z1K1": expected_type}

    expected_args = utils.z10_to_list(expected_type["Z4K2"])
    head_key = expected_args[0]["Z3K2"]["Z6K1"]
    tail_key = expected_args[1]["Z3K2"]["Z6K1"]
    result = _empty_list()
    tail = result
    for element in elements:
        tail[head_key] = element
        tail = tail.setdefault(tail_key, _empty_list())
    return result


def _SERIALIZE_ZLIST(iterable, expected_type):
    expected_args = utils.z10_to_list(expected_type["Z4K2"])
    head_type = expected_args[0]["Z3K1"]
    elements = [serialize(element, head_type) for element in iterable]
    return _serialize_zlist_internal(elements, expected_type)


def _serialize_zpair_internal(expected_type, **kwargs):
    result = {"Z1K1": expected_type}
    for key, value in kwargs.items():
        result[key] = value
    return result


def _SERIALIZE_ZPAIR(the_pair, expected_type):
    expected_args = utils.z10_to_list(expected_type["Z4K2"])
    kwargs = {}
    for expected_arg in expected_args:
        the_key = expected_arg["Z3K2"]["Z6K1"]
        subtype = expected_arg["Z3K1"]
        kwargs[the_key] = serialize(getattr(the_pair, the_key), subtype)
    return _serialize_zpair_internal(expected_type, **kwargs)


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


def _z3_for(key_type, key_label):
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
        "Z3K1": key_type,
        "Z3K2": {"Z1K1": "Z6", "Z6K1": key_label},
        "Z3K3": {"Z1K1": "Z12", "Z12K1": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}}},
    }


def _z4_for_zlist(element_type):
    Z4K1 = {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
        "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
        "Z881K1": element_type,
    }
    argument_declarations = [_z3_for(element_type, "K1"), _z3_for(Z4K1, "K2")]
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z4"},
        "Z4K1": Z4K1,
        "Z4K2": utils.list_to_z10(argument_declarations),
        "Z4K3": {"Z1K1": "Z9", "Z9K1": "Z1000"},
    }


def _z4_for_zpair(first_type, second_type):
    Z4K1 = {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
        "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z882"},
        "Z882K1": first_type,
        "Z882K2": second_type,
    }
    argument_declarations = [_z3_for(first_type, "K1"), _z3_for(second_type, "K2")]
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z4"},
        "Z4K1": Z4K1,
        "Z4K2": utils.list_to_z10(argument_declarations),
        "Z4K3": {"Z1K1": "Z9", "Z9K1": "Z1000"},
    }


def _soup_up_z1k1(Z1K1):
    if isinstance(Z1K1, str):
        return {"Z1K1": "Z9", "Z9K1": Z1K1}
    return Z1K1


def _SERIALIZE_Z1(anything, _):
    ZID = utils.get_python_type(anything)
    if ZID is None:
        raise exceptions.EvaluatorError(
            "Could not serialize input python object: {}".format(repr(anything))
        )
    z1_type = {"Z1K1": "Z9", "Z9K1": "Z1"}
    if ZID == "Z881":
        elements = [serialize(element, z1_type) for element in anything]
        Z1K1s = set(utils.frozendict(element["Z1K1"]) for element in elements)
        if len(Z1K1s) == 1:
            element_type = _soup_up_z1k1(elements[0]["Z1K1"])
        else:
            element_type = z1_type
        Z1K1 = _z4_for_zlist(element_type)
        return _serialize_zlist_internal(elements, Z1K1)
    if ZID == "Z882":
        K1 = serialize(anything.K1, z1_type)
        K2 = serialize(anything.K2, z1_type)
        Z1K1 = _z4_for_zpair(_soup_up_z1k1(K1["Z1K1"]), _soup_up_z1k1(K2["Z1K1"]))
        return _serialize_zpair_internal(Z1K1, K1=K1, K2=K2)
    return serialize(anything, {"Z1K1": "Z9", "Z9K1": ZID})


_SERIALIZE_Z6 = lambda string, _: {"Z1K1": "Z6", "Z6K1": string}
_SERIALIZERS = {
    "Z1": _SERIALIZE_Z1,
    "Z6": _SERIALIZE_Z6,
    # TODO(T292788): Eliminate Z10.
    "Z10": _SERIALIZE_Z10,
    "Z21": _SERIALIZE_Z21,
    "Z40": _SERIALIZE_Z40,
    "Z86": _SERIALIZE_Z86,
    "Z881": _SERIALIZE_ZLIST,
    "Z882": _SERIALIZE_ZPAIR,
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
