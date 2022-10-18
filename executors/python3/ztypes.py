from python3 import serialization


_z9 = lambda ZID: {"Z1K1": "Z9", "Z9K1": ZID}


class ZErrorType:
    pass


class ZError:
    pass


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
        if original_Z1K1 is None:
            original_Z1K1 = {
                "Z1K1": _z9("Z7"),
                "Z7K1": _z9("Z882"),
                "Z882K1": serialization.serialize(K1)["Z1K1"],
                "Z882K2": serialization.serialize(K2)["Z1K1"],
            }
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

    def items(self):
        for key in ["K1", "K2"]:
            yield (key, getattr(self, key))

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
