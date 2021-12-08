from python3 import exceptions


# TODO(T282891): All _is_zwhatev functions should use function-schemata.
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


def z10_to_list(Z10):
    result = []
    tail = Z10
    while tail.get("Z10K1") is not None:
        result.append(tail.get("Z10K1"))
        tail = tail.get("Z10K2")
    return result


def list_to_z10(the_list):
    def _empty_z10():
        return {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}}

    result = _empty_z10()
    tail = result
    for element in the_list:
        tail["Z10K1"] = element
        tail = tail.setdefault("Z10K2", _empty_z10())
    return result


def frozendict(dictionary):
    """Creates an immutable representation of a dictionary."""
    if not isinstance(dictionary, dict):
        return dictionary
    result = []
    for key, value in dictionary.items():
        result.append((key, frozendict(value)))
    return frozenset(result)


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
        self._kwargs = kwargs
        for key, value in kwargs.items():
            setattr(self, key, value)

    def items(self):
        return self._kwargs.items()

    @property
    def Z1K1(self):
        return self._Z1K1

    def __getitem__(self, key):
        return self._kwargs[key]

    def __repr__(self):
        return "ZObject<{}>".format(
            ",".join(
                [
                    "{}:{}".format(attribute, getattr(self, attribute))
                    for attribute in ["Z1K1"] + sorted(list(self._kwargs.keys()))
                ]
            )
        )

    def __str__(self):
        return repr(self)

    def __eq__(self, other_zobject):
        if isinstance(other_zobject, type(self)):
            return self._kwargs == other_zobject._kwargs
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
