'use strict';

function wellformed(str) {
	try {
		const zobject = JSON.parse(str);
		return zobject;
	}
	catch(err) {
		const m = (err.name === "SyntaxError") ? err.message : err.name;
		return {
			"Z1K1": "Z5",
			"Z5K1": "Z401",
			"Z5K2": {
				"Z1K1": "Z401",
				"Z401K1": m
			}
		};
	}
}

module.exports = wellformed;
