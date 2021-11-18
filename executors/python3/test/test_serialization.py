import unittest
from .. import serialization
from .. import utils
from . import utils as test_utils


_Z6 = {"Z1K1": "Z6", "Z6K1": "opiparo"}
_Z10_INPUT = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
    "Z10K1": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"},
        "Z40K1": {"Z1K1": "Z9", "Z9K1": "Z41"},
    },
    "Z10K2": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
        "Z10K1": {"Z1K1": "Z6", "Z6K1": "tRue"},
        "Z10K2": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
            "Z10K1": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}},
            "Z10K2": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}},
        },
    },
}
_Z21 = {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z21"}}
_ZTrue = {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"}, "Z40K1": {"Z1K1": "Z9", "Z9K1": "Z41"}}
_ZFalse = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"},
    "Z40K1": {"Z1K1": "Z9", "Z9K1": "Z42"},
}
_Z86 = {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z86"}, "Z86K1": {"Z1K1": "Z6", "Z6K1": "%"}}


_Z6_DESERIALIZED = "opiparo"
_Z10_DESERIALIZED = [True, "tRue", []]
_Z86_DESERIALIZED = "%"
_Z882_DESERIALIZED = utils.ZPair("pigs", "just pigs")
_Z881_Z6_DESERIALIZED = ["horses", "regular ungulates"]


_Z1_Type = {"Z1K1": "Z9", "Z9K1": "Z1"}
_Z6_Type = {"Z1K1": "Z9", "Z9K1": "Z6"}
_Z10_Type = {"Z1K1": "Z9", "Z9K1": "Z10"}
_Z21_Type = {"Z1K1": "Z9", "Z9K1": "Z21"}
_Z40_Type = {"Z1K1": "Z9", "Z9K1": "Z40"}
_Z882_Type = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z4"},
    "Z4K1": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
        "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z882"},
        "Z882K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
        "Z882K2": {"Z1K1": "Z9", "Z9K1": "Z6"},
    },
    "Z4K2": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
        "Z10K1": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
            "Z3K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
            "Z3K2": {"Z1K1": "Z6", "Z6K1": "K1"},
            "Z3K3": {"Z1K1": "Z12", "Z12K1": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}}},
        },
        "Z10K2": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
            "Z10K1": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
                "Z3K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
                "Z3K2": {"Z1K1": "Z6", "Z6K1": "K2"},
                "Z3K3": {
                    "Z1K1": "Z12",
                    "Z12K1": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}},
                },
            },
            "Z10K2": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
            },
        },
    },
    "Z4K3": {"Z1K1": "Z9", "Z9K1": "Z1000"},
}
_Z881_Z1_Type = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z4"},
    "Z4K1": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
        "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
        "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z1"},
    },
    "Z4K2": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
        "Z10K1": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
            "Z3K1": {"Z1K1": "Z9", "Z9K1": "Z1"},
            "Z3K2": {"Z1K1": "Z6", "Z6K1": "K1"},
            "Z3K3": {"Z1K1": "Z12", "Z12K1": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}}},
        },
        "Z10K2": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
            "Z10K1": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
                "Z3K1": {
                    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
                    "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
                    "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z1"},
                },
                "Z3K2": {"Z1K1": "Z6", "Z6K1": "K2"},
                "Z3K3": {
                    "Z1K1": "Z12",
                    "Z12K1": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}},
                },
            },
            "Z10K2": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
            },
        },
    },
    "Z4K3": {"Z1K1": "Z9", "Z9K1": "Z1000"},
}
_Z881_Z6_Type = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z4"},
    "Z4K1": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
        "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
        "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
    },
    "Z4K2": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
        "Z10K1": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
            "Z3K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
            "Z3K2": {"Z1K1": "Z6", "Z6K1": "K1"},
            "Z3K3": {"Z1K1": "Z12", "Z12K1": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}}},
        },
        "Z10K2": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
            "Z10K1": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
                "Z3K1": {
                    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
                    "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
                    "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
                },
                "Z3K2": {"Z1K1": "Z6", "Z6K1": "K2"},
                "Z3K3": {
                    "Z1K1": "Z12",
                    "Z12K1": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}},
                },
            },
            "Z10K2": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
            },
        },
    },
    "Z4K3": {"Z1K1": "Z9", "Z9K1": "Z1000"},
}


_Z882 = {
    "Z1K1": _Z882_Type,
    "K1": {"Z1K1": "Z6", "Z6K1": "pigs"},
    "K2": {"Z1K1": "Z6", "Z6K1": "just pigs"},
}
_Z10_OUTPUT = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
    "Z10K1": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"},
        "Z40K1": {"Z1K1": "Z9", "Z9K1": "Z41"},
    },
    "Z10K2": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
        "Z10K1": {"Z1K1": "Z6", "Z6K1": "tRue"},
        "Z10K2": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"},
            "Z10K1": {
                "Z1K1": _Z881_Z1_Type,
            },
            "Z10K2": {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z10"}},
        },
    },
}
_Z881_Z6 = {
    "Z1K1": _Z881_Z6_Type,
    "K1": {"Z1K1": "Z6", "Z6K1": "horses"},
    "K2": {
        "Z1K1": _Z881_Z6_Type,
        "K1": {"Z1K1": "Z6", "Z6K1": "regular ungulates"},
        "K2": {"Z1K1": _Z881_Z6_Type},
    },
}


class DeserializeTest(unittest.TestCase):
    def test_deserializes_Z6(self):
        self.assertEqual(_Z6_DESERIALIZED, serialization.deserialize(_Z6))

    def test_deserializes_Z10(self):
        self.assertEqual(_Z10_DESERIALIZED, serialization.deserialize(_Z10_INPUT))

    def test_deserializes_Z21(self):
        self.assertIsNone(serialization.deserialize(_Z21))

    def test_deserializes_Z40_Z41(self):
        self.assertEqual(True, serialization.deserialize(_ZTrue))

    def test_deserializes_Z40_Z42(self):
        self.assertEqual(False, serialization.deserialize(_ZFalse))

    def test_deserializes_Z86(self):
        self.assertEqual(_Z86_DESERIALIZED, serialization.deserialize(_Z86))

    def test_deserializes_Z882(self):
        self.assertEqual(_Z882_DESERIALIZED, serialization.deserialize(_Z882))

    def test_deserializes_Z881(self):
        self.assertEqual(_Z881_Z6_DESERIALIZED, serialization.deserialize(_Z881_Z6))


class SerializeTest(unittest.TestCase):
    def _run_test(self, expected, actual):
        self.assertEqual(
            test_utils.without_z1k1s(expected), test_utils.without_z1k1s(actual)
        )

    def test_serializes_Z6(self):
        self._run_test(_Z6, serialization.serialize(_Z6_DESERIALIZED, _Z6_Type))

    def test_serializes_Z10(self):
        self._run_test(
            _Z10_OUTPUT, serialization.serialize(_Z10_DESERIALIZED, _Z10_Type)
        )

    def test_serializes_Z21(self):
        self._run_test(_Z21, serialization.serialize(None, _Z21_Type))

    def test_serializes_Z40_Z41(self):
        self._run_test(_ZTrue, serialization.serialize(True, _Z40_Type))

    def test_serializes_Z40_Z42(self):
        self._run_test(_ZFalse, serialization.serialize(False, _Z40_Type))

    def test_serializes_Z882(self):
        self._run_test(_Z882, serialization.serialize(_Z882_DESERIALIZED, _Z882_Type))

    def test_serializes_Z882_default(self):
        self._run_test(_Z882, serialization.serialize(_Z882_DESERIALIZED, _Z1_Type))

    def test_serializes_Z881(self):
        self._run_test(
            _Z881_Z6, serialization.serialize(_Z881_Z6_DESERIALIZED, _Z881_Z6_Type)
        )

    def test_serializes_Z881_default(self):
        self._run_test(
            _Z881_Z6, serialization.serialize(_Z881_Z6_DESERIALIZED, _Z1_Type)
        )
