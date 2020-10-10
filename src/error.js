'use strict';

function inner_error( codes, args ) {
	if ( codes.length === 1 ) {
		const error_object = {
			Z1K1: codes[ 0 ]
		};
		for ( let i = 0; i < args.length; i++ ) {
			error_object[ codes + 'K' + ( i + 1 ).toString() ] = args[ i ];
		}
		return error_object;
	} else {
		return {
			Z1K1: codes[ 0 ],
			[ codes[ 0 ] + 'K1' ]: inner_error( codes.slice( 1 ), args )
		};
	}
}

function error( codes, args ) {
	return {
		Z1K1: 'Z5',
		Z5K1: inner_error( codes, args )
	};
}

error.syntax_error = 'Z401'; // message from parser, input string
error.not_wellformed = 'Z402'; // sub error code, maybe more
error.zid_not_found = 'Z404'; // zid
error.zobject_must_not_be_number_or_boolean_or_null = 'Z421'; // offending text (sub of Z402)
error.array_element_not_well_formed = 'Z422'; // offending index in array, propagated error (sub of Z402)
error.missing_type = 'Z423'; // no Z1K1 (sub of Z402)
error.z1k1_must_not_be_string_or_array = 'Z424'; // value of z1k1 (sub of 402)
error.z6_must_have_2_keys = 'Z425'; // whole object (sub of 402)
error.z6_without_z6k1 = 'Z426'; // whole object (sub of 402)
error.z6k1_must_be_string = 'Z427'; // value of Z6K1 (sub of 402)
error.z9_must_have_2_keys = 'Z428'; // whole object (sub of 402)
error.z9_without_z9k1 = 'Z429'; // whole object (sub of 402)
error.z9k1_must_be_string = 'Z430'; // value of Z9K1 (sub of 402)
error.z9k1_must_be_reference = 'Z431'; // value of Z9K1 (sub of 402)
error.invalid_key = 'Z432'; // invalid key (sub of 402)
error.not_wellformed_value = 'Z433'; // key, propagated error (sub of 402)

module.exports = error;
