import unittest
from .. import exceptions
from .. import serialization
from .. import utils
from .. import ztypes
from . import utils as test_utils


_Z6 = {"Z1K1": "Z6", "Z6K1": "opiparo"}
_Z881_Z1_INPUT = {
    "Z1K1": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
        "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
        "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z1"},
    },
    "K1": {
        "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"},
        "Z40K1": {"Z1K1": "Z9", "Z9K1": "Z41"},
    },
    "K2": {
        "Z1K1": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
            "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
            "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z1"},
        },
        "K1": {"Z1K1": "Z6", "Z6K1": "tRue"},
        "K2": {
            "Z1K1": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
                "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
                "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z1"},
            },
            "K1": {
                "Z1K1": {
                    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
                    "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
                    "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z1"},
                }
            },
            "K2": {
                "Z1K1": {
                    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
                    "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
                    "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z1"},
                },
            },
        },
    },
}
_Z21 = {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z21"}}
_Z39 = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z39"},
    "Z39K1": {"Z1K1": "Z6", "Z6K1": "Z1000K1"},
}
_ZTrue = {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"}, "Z40K1": {"Z1K1": "Z9", "Z9K1": "Z41"}}
_ZFalse = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z40"},
    "Z40K1": {"Z1K1": "Z9", "Z9K1": "Z42"},
}
_Z86 = {"Z1K1": {"Z1K1": "Z9", "Z9K1": "Z86"}, "Z86K1": {"Z1K1": "Z6", "Z6K1": "%"}}


_Z6_DESERIALIZED = "opiparo"
_Z39_DESERIALIZED = ztypes.ZObject(_Z39["Z1K1"], Z39K1="Z1000K1")
_Z881_Z1_DESERIALIZED = [True, "tRue", []]
_Z86_DESERIALIZED = ztypes.ZObject(_Z86["Z1K1"], Z86K1="%")
_Z882_DESERIALIZED = ztypes.ZPair("pigs", "just pigs")
_Z881_Z6_DESERIALIZED = ["horses", "regular ungulates"]


_Z882_Type = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
    "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z882"},
    "Z882K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
    "Z882K2": {"Z1K1": "Z9", "Z9K1": "Z6"},
}
_Z881_Z6_Type = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
    "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
    "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
}


_Z882 = {
    "Z1K1": _Z882_Type,
    "K1": {"Z1K1": "Z6", "Z6K1": "pigs"},
    "K2": {"Z1K1": "Z6", "Z6K1": "just pigs"},
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
_USER_DEFINED_TYPE = {
    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z4"},
    "Z4K1": {"Z1K1": "Z9", "Z9K1": "Z10101"},
    "Z4K2": {
        "Z1K1": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
            "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
            "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
        },
        "K1": {
            "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
            "Z3K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
            "Z3K2": {"Z1K1": "Z6", "Z6K1": "Z10101K1"},
            "Z3K3": {"Z1K1": "Z9", "Z9K1": "Z333"},
        },
        "K2": {
            "Z1K1": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
                "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
                "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
            },
            "K1": {
                "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
                "Z3K1": {"Z1K1": "Z9", "Z9K1": "Z6"},
                "Z3K2": {"Z1K1": "Z6", "Z6K1": "Z10101K2"},
                "Z3K3": {"Z1K1": "Z9", "Z9K1": "Z333"},
            },
            "K2": {
                "Z1K1": {
                    "Z1K1": {"Z1K1": "Z9", "Z9K1": "Z7"},
                    "Z7K1": {"Z1K1": "Z9", "Z9K1": "Z881"},
                    "Z881K1": {"Z1K1": "Z9", "Z9K1": "Z3"},
                },
            },
        },
    },
    "Z4K3": {"Z1K1": "Z9", "Z9K1": "Z222"},
}
_USER_DEFINED_DESERIALIZED = ztypes.ZObject(
    _USER_DEFINED_TYPE, Z10101K1="tRue", Z10101K2="trUe"
)
_USER_DEFINED_DESERIALIZED_NO_Z1K1 = ztypes.ZObject(Z10101K1="tRue", Z10101K2="trUe")
_USER_DEFINED = {
    "Z1K1": _USER_DEFINED_TYPE,
    "Z10101K1": {"Z1K1": "Z6", "Z6K1": "tRue"},
    "Z10101K2": {"Z1K1": "Z6", "Z6K1": "trUe"},
}


class DeserializeTest(unittest.TestCase):

    maxDiff = None

    def test_deserializes_Z6(self):
        self.assertEqual(_Z6_DESERIALIZED, serialization.deserialize(_Z6))

    def test_deserializes_list_of_Z1(self):
        self.assertEqual(
            _Z881_Z1_DESERIALIZED, serialization.deserialize(_Z881_Z1_INPUT)
        )

    def test_deserializes_Z21(self):
        self.assertIsNone(serialization.deserialize(_Z21))

    def test_deserializes_Z39(self):
        self.assertEqual(_Z39_DESERIALIZED, serialization.deserialize(_Z39))

    def test_deserializes_Z40_Z41(self):
        self.assertEqual(True, serialization.deserialize(_ZTrue))

    def test_deserializes_Z40_Z42(self):
        self.assertEqual(False, serialization.deserialize(_ZFalse))

    def test_deserializes_Z86(self):
        self.assertEqual(_Z86_DESERIALIZED, serialization.deserialize(_Z86))

    def test_deserializes_Z881(self):
        self.assertEqual(_Z881_Z6_DESERIALIZED, serialization.deserialize(_Z881_Z6))

    def test_deserializes_Z882(self):
        self.assertEqual(_Z882_DESERIALIZED, serialization.deserialize(_Z882))

    def test_deserializes_user_defined(self):
        self.assertEqual(
            _USER_DEFINED_DESERIALIZED, serialization.deserialize(_USER_DEFINED)
        )


class SerializeTest(unittest.TestCase):

    maxDiff = None

    def _run_test(self, expected, actual):
        self.assertEqual(
            test_utils.without_z1k1s(expected), test_utils.without_z1k1s(actual)
        )

    def test_serializes_Z6(self):
        self._run_test(_Z6, serialization.serialize(_Z6_DESERIALIZED))

    def test_serializes_list_of_Z1(self):
        self._run_test(
            _Z881_Z1_INPUT,
            serialization.serialize(_Z881_Z1_DESERIALIZED),
        )

    def test_serializes_Z21(self):
        self._run_test(_Z21, serialization.serialize(None))

    def test_serializes_Z40_Z41(self):
        self._run_test(_ZTrue, serialization.serialize(True))

    def test_serializes_Z40_Z42(self):
        self._run_test(_ZFalse, serialization.serialize(False))

    def test_serializes_Z882(self):
        self._run_test(_Z882, serialization.serialize(_Z882_DESERIALIZED))

    def test_serializes_Z881(self):
        self._run_test(_Z881_Z6, serialization.serialize(_Z881_Z6_DESERIALIZED))

    def test_serializes_user_defined(self):
        self._run_test(
            _USER_DEFINED,
            serialization.serialize(_USER_DEFINED_DESERIALIZED),
        )

    def test_serializes_user_defined_correct_type(self):
        self.assertEqual(
            _USER_DEFINED,
            serialization.serialize(_USER_DEFINED_DESERIALIZED),
        )

    def test_serializes_user_defined_as_Z1(self):
        self._run_test(
            _USER_DEFINED, serialization.serialize(_USER_DEFINED_DESERIALIZED)
        )

    def test_serializes_user_defined_no_Z1K1_as_Z1(self):
        expected_message = "Could not serialize input Python object: ZObject<Z1K1:None,Z10101K1:tRue,Z10101K2:trUe>"
        with self.assertRaises(exceptions.EvaluatorError) as exception_context:
            serialization.serialize(_USER_DEFINED_DESERIALIZED_NO_Z1K1)
        self.assertEqual(expected_message, exception_context.exception.args[0])
