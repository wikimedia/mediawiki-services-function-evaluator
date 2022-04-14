from python3 import exceptions


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


def _z9_for(reference):
    return {"Z1K1": "Z9", "Z9K1": reference}


def make_void():
    return _z9_for("Z24")


def make_result_envelope(good_result, bad_result):
    return {
        "Z1K1": _z9_for("Z22"),
        "Z22K1": make_void() if good_result is None else good_result,
        "Z22K2": make_void() if bad_result is None else bad_result,
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
    result = zlist.get("Z10K1")
    if result is None:
        result = zlist.get("K1")
    return result


def _get_tail(zlist):
    result = zlist.get("Z10K2")
    if result is None:
        result = zlist.get("K2")
    return result


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


class ZObject:
    def __init__(self, original_Z1K1=None, **kwargs):
        self._Z1K1 = original_Z1K1
        self._keys = []
        for key, value in kwargs.items():
            self._keys.append(key)
            setattr(self, key, value)
        self._keys.sort()

    def keys(self):
        if self._Z1K1 is not None:
            yield "Z1K1"
        for key in self._keys:
            yield key

    def items(self):
        for key in self.keys():
            yield (key, getattr(self, key))

    @property
    def Z1K1(self):
        return self._Z1K1

    def __getitem__(self, key):
        return getattr(self, key, None)

    def _as_dict(self):
        pass

    def __repr__(self):
        return "ZObject<{}>".format(
            ",".join(
                [
                    "{}:{}".format(attribute, getattr(self, attribute))
                    for attribute in ["Z1K1"] + sorted(self._keys)
                ]
            )
        )

    def __str__(self):
        return repr(self)

    def __eq__(self, other_zobject):
        if isinstance(other_zobject, type(self)):
            if self._keys != other_zobject._keys:
                return False
            for key in self._keys:
                if getattr(self, key) != getattr(other_zobject, key):
                    return False
            return True
        return False


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

    def __eq__(self, other_zpair):
        if isinstance(other_zpair, type(self)):
            return self.K1 == other_zpair.K1 and self.K2 == other_zpair.K2
        return False

    def __repr__(self):
        return "ZPair<{}>".format(
            ",".join(
                [
                    "{}:{}".format(attribute, getattr(self, attribute))
                    for attribute in ["Z1K1", "K1", "K2"]
                ]
            )
        )

    def __str__(self):
        return repr(self)


def is_ztype(Z4):
    try:
        return Z4.get("Z1K1", {}).get("Z9K1") == "Z4"
    except AttributeError:
        return False


def get_python_type(py_object):
    """Infer the type of a Python object and try to find the corresponding ZID."""
    if isinstance(py_object, ZObject):
        return "DEFAULT"
    if isinstance(py_object, str):
        return "Z6"
    if isinstance(py_object, bool):
        return "Z40"
    if isinstance(py_object, ZPair):
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
