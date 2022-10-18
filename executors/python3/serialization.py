from python3 import exceptions
from python3 import utils
from python3 import ztypes


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


# TODO (T290898): This can serve as a model for default deserialization--all
# local keys can be deserialized and set as members.
def _DESERIALIZE_ZPAIR(Z_object):
    return ztypes.ZPair(
        deserialize(Z_object["K1"]), deserialize(Z_object["K2"]), Z_object["Z1K1"]
    )


def _DESERIALIZE_ZMAP(Z_object):
    return {pair.K1: pair.K2 for pair in deserialize(Z_object["K1"])}


def _DESERIALIZE_ZTYPE(Z_object):
    Z1K1 = None
    kwargs = {}
    for key, value in Z_object.items():
        if key == "Z1K1":
            Z1K1 = value
        else:
            kwargs[key] = deserialize(value)
    return ztypes.ZObject(Z1K1, **kwargs)


_DESERIALIZE_Z6 = lambda Z6: Z6["Z6K1"]
_DESERIALIZE_Z21 = lambda Z21: None
_DESERIALIZE_Z39 = lambda Z39: Z39["Z39K1"]["Z6K1"]
_DESERIALIZE_Z40 = lambda Z40: Z40["Z40K1"]["Z9K1"] == "Z41"
_DESERIALIZE_Z86 = lambda Z86: Z86["Z86K1"]["Z6K1"]
_DESERIALIZERS = {
    "Z6": _DESERIALIZE_Z6,
    "Z21": _DESERIALIZE_Z21,
    "Z39": _DESERIALIZE_Z39,
    "Z40": _DESERIALIZE_Z40,
    "Z86": _DESERIALIZE_Z86,
    "Z881": _DESERIALIZE_ZLIST,
    "Z882": _DESERIALIZE_ZPAIR,
    "Z883": _DESERIALIZE_ZMAP,
}
_DEFAULT_DESERIALIZER = _DESERIALIZE_ZTYPE


def deserialize(ZObject):
    """Convert a ZObject into the corresponding Python type.
    Z6 -> str
    Typed List (Z881 instance) -> list
    Z21 -> None
    Z40 -> bool
    """
    ZID = utils.get_zobject_type(ZObject)
    deserializer = _DESERIALIZERS.get(ZID)
    if deserializer is None:
        deserializer = _DEFAULT_DESERIALIZER
    return deserializer(ZObject)


def _z3_for(key_type, key_label):
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
        "Z3K1": key_type,
        "Z3K2": {"Z1K1": "Z6", "Z6K1": key_label},
        "Z3K3": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z12"},
            "Z12K1": utils.convert_list_to_zlist([], {"Z1K1": "Z9", "Z9K1": "Z11"}),
        },
    }


def _soup_up_z1k1(Z1K1):
    if isinstance(Z1K1, str):
        return {"Z1K1": "Z9", "Z9K1": Z1K1}
    return Z1K1


# Shorter alias.
_z9 = _soup_up_z1k1


def _SERIALIZE_Z21(nothing):
    return {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z21"}}


def _SERIALIZE_Z40(boolean):
    ZID = "Z41" if boolean else "Z42"
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"},
        "Z40K1": {"Z1K1": "Z9", "Z9K1": ZID},
    }


def _SERIALIZE_Z39(key_reference):
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z39"},
        "Z39K1": {"Z1K1": "Z6", "Z6K1": key_reference},
    }


def _SERIALIZE_Z86(code_point):
    return {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z86"},
        "Z86K1": _SERIALIZE_Z6(code_point.Z86K1),
    }


def _SERIALIZE_ZLIST(iterable):
    elements = [serialize(element) for element in iterable]
    head_type = utils.get_list_type(elements)
    return utils.convert_list_to_zlist(elements, head_type)


def _SERIALIZE_ZTYPE(the_object):
    Z1K1 = getattr(the_object, "Z1K1", None)
    if Z1K1 is None:
        raise exceptions.EvaluatorError(
            "Could not serialize input Python object: {}".format(repr(the_object))
        )
    result = {"Z1K1": Z1K1}
    for key, value in the_object.items():
        if key == "Z1K1":
            continue
        result[key] = serialize(value)
    return result


def _SERIALIZE_ZMAP(the_dict):
    serialized_keys = map(serialize, the_dict.keys())
    serialized_values = map(serialize, the_dict.values())
    key_type = utils.get_list_type(serialized_keys)
    value_type = utils.get_list_type(serialized_values)
    # TODO (T321103): Avoid serializing the keys and values twice.
    pair_list = [ztypes.ZPair(*item) for item in the_dict.items()]
    return {
        "Z1K1": {
            "Z1K1": _z9("Z7"),
            "Z7K1": _z9("Z883"),
            "Z883K1": key_type,
            "Z883K2": value_type,
        },
        "K1": serialize(pair_list),
    }


_SERIALIZE_Z6 = lambda string: {"Z1K1": "Z6", "Z6K1": string}
_SERIALIZERS = {
    "Z6": _SERIALIZE_Z6,
    "Z21": _SERIALIZE_Z21,
    "Z39": _SERIALIZE_Z39,
    "Z40": _SERIALIZE_Z40,
    "Z86": _SERIALIZE_Z86,
    "Z881": _SERIALIZE_ZLIST,
    "Z882": _SERIALIZE_ZTYPE,
    "Z883": _SERIALIZE_ZMAP,
}
_DEFAULT_SERIALIZER = _SERIALIZE_ZTYPE


def serialize(py_object):
    """Convert a Python object into the corresponding ZObject type.
    str -> Z6
    list -> Typed List (as Returned by Z881)
    None -> Z21
    bool -> Z40
    """
    ZID = utils.get_python_type(py_object)
    serializer = _SERIALIZERS.get(ZID)
    if serializer is None:
        serializer = _DEFAULT_SERIALIZER
    return serializer(py_object)
