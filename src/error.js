'use strict';

function error(code, message, o) {
	return {
		"Z1K1": "Z5",
		"Z5K1": code,
		"Z5K2": {
			"Z1K1": code,
			[code + "K1"]: message,
			[code + "K2"]: o
		}
	};
}

module.exports = error;
