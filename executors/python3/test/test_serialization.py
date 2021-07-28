import unittest
from .. import executor


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


_Z6_DESERIALIZED = 'opiparo'
_Z10_DESERIALIZED = [True, 'tRue', []]


class DeerializeTest(unittest.TestCase):
    
    def test_deserializes_Z6(self):
        self.assertEqual(_Z6_DESERIALIZED, executor.deserialize(_Z6))
    
    def test_deserializes_Z10(self):
        self.assertEqual(_Z10_DESERIALIZED, executor.deserialize(_Z10))
    
    def test_deserializes_Z21(self):
        self.assertIsNone(executor.deserialize(_Z21))
    
    def test_deserializes_Z40_Z41(self):
        self.assertEqual(True, executor.deserialize(_ZTrue))
    
    def test_deserializes_Z40_Z42(self):
        self.assertEqual(False, executor.deserialize(_ZFalse))


class SerializeTest(unittest.TestCase):
    
    def test_deserializes_Z6(self):
        self.assertEqual(_Z6, executor.serialize(_Z6_DESERIALIZED))
    
    def test_deserializes_Z10(self):
        self.assertEqual(_Z10, executor.serialize(_Z10_DESERIALIZED))
    
    def test_deserializes_Z21(self):
        self.assertEqual(_Z21, executor.serialize(None))
    
    def test_deserializes_Z40_Z41(self):
        self.assertEqual(_ZTrue, executor.serialize(True))
    
    def test_deserializes_Z40_Z42(self):
        self.assertEqual(_ZFalse, executor.serialize(False))
