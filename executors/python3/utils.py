from python3 import exceptions


def z10_to_list(Z10):
    result = []
    tail = Z10
    while tail.get("Z10K1") is not None:
        result.append(tail.get("Z10K1"))
        tail = tail.get("Z10K2")
    return result


# TODO: All _is_zwhatev functions should use function-schemata.
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


def _is_ztype(Z4):
    try:
        return Z4.get("Z1K1", {}).get("Z9K1") == "Z4"
    except AttributeError:
        return False


def _is_zfunction(Z8):
    try:
        return Z8.get("Z1K1", {}).get("Z9K1") == "Z8"
    except AttributeError:
        return False


def get_zid(Z4):
    if _is_zfunction(Z4):
        return get_zid(Z4.get("Z8K5", {}))
    if _is_zreference(Z4):
        return Z4["Z9K1"]
    if _is_zfunction_call(Z4):
        Z7K1 = Z4.get("Z7K1", {})
        return get_zid(Z7K1)
    if _is_ztype(Z4):
        return get_zid(Z4["Z4K1"])
    if isinstance(Z4, str):
        # If Z4 is a string, original object was a Z6 or a Z9.
        return Z4
    # I guess this wasn't a very good ZObject.
    raise exceptions.EvaluatorError("Could not determine type for {}".format(Z4))


def get_zobject_type(ZObject):
    """Determine the ZID corresponding to the type of a ZObject."""
    return get_zid(ZObject.get("Z1K1"))


def get_python_type(py_object):
    """Infer the type of a Python object and try to find the corresponding ZID."""
    if isinstance(py_object, str):
        return "Z6"
    if isinstance(py_object, bool):
        return "Z40"
    try:
        iterator = iter(py_object)
        return "Z10"
    except TypeError:
        pass
    if py_object is None:
        return "Z21"
