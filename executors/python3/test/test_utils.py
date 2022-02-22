import unittest

from .. import utils


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
_USER_DEFINED_DESERIALIZED = utils.ZObject(
    _USER_DEFINED_TYPE, Z10101K1="tRue", Z10101K2="trUe"
)


class UtilsTest(unittest.TestCase):
    def test_keys_of_serialized_zobject(self):
        self.assertEquals(
            ["Z1K1", "Z10101K1", "Z10101K2"], list(_USER_DEFINED_DESERIALIZED.keys())
        )
