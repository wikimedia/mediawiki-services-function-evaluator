import sys
from python3 import exceptions
from python3 import ztypes


# TODO (T282891): All _is_zwhatev functions should use function-schemata.
def _is_zreference(Z9):
    try:
        return Z9.get("Z1K1") == "Z9" and isinstance(Z9.get("Z9K1"), str)
    except AttributeError:
        return False


def _is_zfunction_call(Z7):
    try:
        return Z7.get("Z1K1", {}).get("Z9K1") == "Z7"
    except AttributeError:
        return False


def _is_zfunction(Z8):
    try:
        return Z8.get("Z1K1", {}).get("Z9K1") == "Z8"
    except AttributeError:
        return False


def _is_zError(Z5):
    try:
        return Z5.get("Z1K1", {}).get("Z9K1") == "Z5"
    except AttributeError:
        return False


def _is_zMap(Z883):
    try:
        return Z883.get("Z1K1", {}).get("Z7K1", {}).get("Z9K1") == "Z883"
    except AttributeError:
        return False


def _is_zVoid(Z24):
    try:
        return Z24.get("Z9K1") == "Z24"
    except AttributeError:
        return False


def _z9_for(reference):
    return {"Z1K1": "Z9", "Z9K1": reference}


def make_void():
    return _z9_for("Z24")


def make_empty_zmap(key_type, value_type):
    """Create a new ZMap with the given key_type and value_type.
        At present, the key type of a ZMap can only be Z6 / String or Z39 / Key reference.
    TODO (T302015) When ZMap keys are extended beyond Z6/Z39, update accordingly

    Arguments:
        key_type: A Z9 instance in normal form
        value_type: A ZObject in normal form
            Returns:
        A Z883 / ZMap with no entries, in normal form
    """
    allowed_key_types = ["Z6", "Z39"]
    if key_type.get("Z9K1") not in allowed_key_types:
        sys.stderr.write("make_singleton_zmap called with invalid key_type")
        return None
    map_type = {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
        "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z883"},
        "Z883K1": key_type,
        "Z883K2": value_type,
    }
    # The map's K1 property is a list of pairs, and it's required to be present
    # even when empty
    list_type = {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
        "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
        "Z881K1": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
            "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z882"},
            "Z882K1": key_type,
            "Z882K2": value_type,
        },
    }
    return {"Z1K1": map_type, "K1": {"Z1K1": list_type}}


def set_zmap_value(zmap, key, value):
    """Ensures there is an entry for the given key / value in the given ZMap.  If there is
    already an entry for the given key, overwrites the corresponding value.  Otherwise,
    creates a new entry. N.B.: Modifies the value of the ZMap's K1 in place.

    TODO (T302015) When ZMap keys are extended beyond Z6/Z39, update accordingly

    Arguments:
        zmap: a Z883/Typed map, in normal form
        key: a Z6 or Z39 instance, in normal form
        value: a Z1/ZObject, in normal form

       Returns:
        the updated ZMap, in normal form
    """
    if zmap == None:
        sys.stderr.write("set_zmap_value called with undefined; please fix your caller")
        return None

    tail = zmap.get("K1")
    while True:
        if is_empty_zlist(tail):
            break
        entry = get_head(tail)
        if (
            entry.get("K1", {}).get("Z1K1") == "Z6"
            and key.get("Z1K1") == "Z6"
            and entry.get("K1", {}).get("Z6K1") == key.get("Z6K1")
        ) or (
            entry.get("K1", {}).get("Z1K1") == "Z39"
            and key.get("Z1K1") == "Z39"
            and entry.get("K1", {}).get("Z39K1", {}).get("Z9K1")
            == key.get("Z39K1", {}).get("Z9K1")
        ):
            entry["K2"] = value
            return zmap
        tail = get_tail(tail)

    # The key isn't present in the map, so add an entry for it
    key_type = zmap.get("Z1K1", {}).get("Z883K1")
    value_type = zmap.get("Z1K1", {}).get("Z883K2")
    pair_type = {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
        "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z882"},
        "Z883K1": key_type,
        "Z883K2": value_type,
    }
    tail["K1"] = {"Z1K1": pair_type, "K1": key, "K2": value}
    list_type = tail.get("Z1K1")
    tail["K2"] = {"Z1K1": list_type}
    return zmap


def make_mapped_result_envelope(result, metadata):
    """Creates a map-based Z22 containing result and metadata.  metadata is normally a Z883 / Map.
        If metadata is a Z5 / Error object, we place it in a new ZMap, as the value of an entry
        with key "errors".  This is to support our transition from the older basic Z22s to map-based
        Z22s.

    Args:
        result: Z22K1 of the resulting Z22
        metadata: Z22K2 of the resulting Z22 - either a Z883 / Map or a Z5 / Error
    Returns:
        Z22 encapsulating the arguments
    """
    if _is_zError(metadata):
        key_type = {"Z1K1": "Z9", "Z9K1": "Z6"}
        value_type = {"Z1K1": "Z9", "Z9K1": "Z1"}
        key = {"Z1K1": "Z6", "Z6K1": "errors"}
        zmap = make_empty_zmap(key_type, value_type)
        zmap = set_zmap_value(zmap, key, metadata)
    else:
        zmap = metadata
    return {
        "Z1K1": _z9_for("Z22"),
        "Z22K1": make_void() if result is None else result,
        "Z22K2": make_void() if zmap is None else zmap,
    }


def frozendict(dictionary):
    """Creates an immutable representation of a dictionary."""
    if not isinstance(dictionary, dict):
        return dictionary
    result = []
    for key, value in dictionary.items():
        result.append((key, frozendict(value)))
    return frozenset(result)


def _get_head(zlist):
    return zlist.get("K1")


def _get_tail(zlist):
    return zlist.get("K2")


def is_empty_zlist(z_list):
    """Returns True iff input Typed List is empty."""
    return _get_head(z_list) is None


def convert_zlist_to_list(zlist):
    """Turns a Typed List into a Python list.

    Arguments:
        zlist: a Typed List

    Returns:
        a Python list containing all elements of the input Typed List
    """
    tail = zlist
    result = []
    while True:
        if is_empty_zlist(tail):
            break
        result.append(_get_head(tail))
        tail = _get_tail(tail)
    return result


def convert_list_to_zlist(the_list, type_clue=None):
    """Turns a Python iterable into a Typed List.

    Arguments:
        the_list: an iterable of ZObjects

    Returns:
        a Type List corresponding to the input list
    """
    Z1K1s = set()

    for i, element in enumerate(the_list):
        if i == 0:
            first_Z1K1 = element["Z1K1"]
        Z1K1s.add(frozendict(element["Z1K1"]))
    if len(Z1K1s) == 1:
        head_type = first_Z1K1
    else:
        head_type = type_clue or _z9_for("Z1")
    list_type = {"Z1K1": _z9_for("Z7"), "Z7K1": _z9_for("Z881"), "Z881K1": head_type}

    head_key = "K1"
    tail_key = "K2"

    def create_tail():
        return {"Z1K1": list_type}

    result = create_tail()
    tail = result
    for element in the_list:
        tail[head_key] = element
        tail[tail_key] = create_tail()
        tail = tail[tail_key]
    return result


def get_zid(Z4):
    if _is_zfunction(Z4):
        return get_zid(Z4.get("Z8K5", {}))
    if _is_zreference(Z4):
        return Z4["Z9K1"]
    if _is_zfunction_call(Z4):
        Z7K1 = Z4.get("Z7K1", {})
        return get_zid(Z7K1)
    if is_ztype(Z4):
        return get_zid(Z4["Z4K1"])
    if isinstance(Z4, str):
        # If Z4 is a string, original object was a Z6 or a Z9.
        return Z4
    # I guess this wasn't a very good ZObject.
    raise exceptions.EvaluatorError("Could not determine type for {}".format(Z4))


def get_zobject_type(ZObject):
    """Determine the ZID corresponding to the type of a ZObject."""
    return get_zid(ZObject.get("Z1K1"))


def is_ztype(Z4):
    try:
        return Z4.get("Z1K1", {}).get("Z9K1") == "Z4"
    except AttributeError:
        return False


def get_python_type(py_object):
    """Infer the type of a Python object and try to find the corresponding ZID."""
    if isinstance(py_object, ztypes.ZObject):
        return "DEFAULT"
    if isinstance(py_object, str):
        return "Z6"
    if isinstance(py_object, bool):
        return "Z40"
    if isinstance(py_object, ztypes.ZPair):
        return "Z882"
    if isinstance(py_object, dict):
        return "Z883"
    # This check crucially must succeed the isinstance(py_object, ZObject) check
    # because ZObjects are sort of iterable.
    try:
        iterator = iter(py_object)
    except TypeError:
        pass
    else:
        return "Z881"
    if py_object is None:
        return "Z21"
