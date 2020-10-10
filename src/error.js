'use strict';

function error( code, args ) {
	const error_object = {
		Z1K1: 'Z5',
		Z5K1: code
	};
	if ( args.length === 0 ) {
		return error_object;
	}

	const inner_object = {
		Z1K1: code
	};
	for ( let i = 0; i < args.length; i++ ) {
		inner_object[ code + 'K' + ( i + 1 ).toString() ] = args[ i ];
	}
	error_object.Z5K2 = inner_object;

	return error_object;
}

error.syntax_error = 'Z401'; // message from parser, input string
error.not_wellformed = 'Z402'; // sub error code, maybe more
error.zid_not_found = 'Z404'; // zid
error.zobject_must_not_be_number_or_boolean_or_null = 'Z421'; // offending text (sub of Z402)
error.array_element_not_well_formed = 'Z422'; // offending index in array, well formedness error (sub of Z402)
error.missing_type = 'Z423'; // no Z1K1 (sub of Z402)
error.z1k1_must_not_be_string_or_array = 'Z424'; // value of z1k1 (sub of 402)
error.z6_must_have_2_keys = 'Z425'; // whole object (sub of 402)
error.z6k1_must_be_string = 'Z426'; // value of Z6K1 (sub of 402)

module.exports = error;
