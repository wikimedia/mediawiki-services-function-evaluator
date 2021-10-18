import unittest
from .. import serialization


_Z6 = { 'Z1K1': 'Z6', 'Z6K1': 'opiparo' }
_Z10 = {
    'Z1K1': {
        'Z1K1': 'Z9',
        'Z9K1': 'Z10'
    },
    'Z10K1': {
        'Z1K1': {
            'Z1K1': 'Z9',
            'Z9K1': 'Z40'
        },
        'Z40K1': {
            'Z1K1': 'Z9',
            'Z9K1': 'Z41'
        }
    },
    'Z10K2': {
        'Z1K1': {
            'Z1K1': 'Z9',
            'Z9K1': 'Z10'
        },
        'Z10K1': {
            'Z1K1': 'Z6',
            'Z6K1': 'tRue'
        },
        'Z10K2': {
            'Z1K1': {
                'Z1K1': 'Z9',
                'Z9K1': 'Z10'
            },
            'Z10K1': {
                'Z1K1': {
                    'Z1K1': 'Z9',
                    'Z9K1': 'Z10'
                }
            },
            'Z10K2': {
                'Z1K1': {
                    'Z1K1': 'Z9',
                    'Z9K1': 'Z10'
                }
            }
        }
    }
}
_Z21 = {
    'Z1K1': {
        'Z1K1': 'Z9',
        'Z9K1': 'Z21'
    }
}
_ZTrue = {
    'Z1K1': {
        'Z1K1': 'Z9',
        'Z9K1': 'Z40'
    },
    'Z40K1': {
        'Z1K1': 'Z9',
        'Z9K1': 'Z41'
    }
}
_ZFalse = {
    'Z1K1': {
        'Z1K1': 'Z9',
        'Z9K1': 'Z40'
    },
    'Z40K1': {
        'Z1K1': 'Z9',
        'Z9K1': 'Z42'
    }
}
_Z86 = {
    'Z1K1': {
        'Z1K1': 'Z9',
        'Z9K1': 'Z86'
    },
    'Z86K1': {
        'Z1K1': 'Z6',
        'Z6K1': '%'
    }
}


_Z6_DESERIALIZED = 'opiparo'
_Z10_DESERIALIZED = [True, 'tRue', []]
_Z86_DESERIALIZED = '%'


_Z6_Type = { 'Z1K1': 'Z9', 'Z9K1': 'Z6' }
_Z10_Type = { 'Z1K1': 'Z9', 'Z9K1': 'Z10' }
_Z21_Type = { 'Z1K1': 'Z9', 'Z9K1': 'Z21' }
_Z40_Type = { 'Z1K1': 'Z9', 'Z9K1': 'Z40' }


class DeerializeTest(unittest.TestCase):
    
    def test_deserializes_Z6(self):
        self.assertEqual(_Z6_DESERIALIZED, serialization.deserialize(_Z6))

    def test_deserializes_Z10(self):
        self.assertEqual(_Z10_DESERIALIZED, serialization.deserialize(_Z10))
    
    def test_deserializes_Z21(self):
        self.assertIsNone(serialization.deserialize(_Z21))
    
    def test_deserializes_Z40_Z41(self):
        self.assertEqual(True, serialization.deserialize(_ZTrue))
    
    def test_deserializes_Z40_Z42(self):
        self.assertEqual(False, serialization.deserialize(_ZFalse))

    def test_deserializes_Z86(self):
        self.assertEqual(_Z86_DESERIALIZED, serialization.deserialize(_Z86))


class SerializeTest(unittest.TestCase):
    
    def test_serializes_Z6(self):
        self.assertEqual(_Z6, serialization.serialize(_Z6_DESERIALIZED, _Z6_Type))
    
    # TODO(T292808): Re-enable this test once we can serialize Z1s.
    @unittest.skip
    def test_serializes_Z10(self):
        self.assertEqual(_Z10, serialization.serialize(_Z10_DESERIALIZED, _Z10_Type))
    
    def test_serializes_Z21(self):
        self.assertEqual(_Z21, serialization.serialize(None, _Z21_Type))
    
    def test_serializes_Z40_Z41(self):
        self.assertEqual(_ZTrue, serialization.serialize(True, _Z40_Type))
    
    def test_serializes_Z40_Z42(self):
        self.assertEqual(_ZFalse, serialization.serialize(False, _Z40_Type))
