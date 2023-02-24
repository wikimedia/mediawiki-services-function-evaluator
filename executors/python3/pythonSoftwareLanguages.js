'use strict';

const softwareLanguages = require( './executors/javascript/function-schemata/data/definitions/softwareLanguages.json' ); // eslint-disable-line node/no-missing-require

const executorConfigurations = new Map();

for ( const languageVersion in softwareLanguages ) {
	let executorConfig;

	if ( languageVersion.startsWith( 'python' ) ) {
		executorConfig = {
			// TODO: This should use a different executable for different versions of python once we
			// support them (needs said versioned binary to also exist first!).
			executable: 'python3',
			callArguments: {
				// -u forces std* streams to be unbuffered
				args: [ '-u', 'executors/python3/executor.py' ],
				env: { PYTHONPATH: 'executors' }
			}
		};
	}

	// Only register an executor if we recognised it (e.g. Lua doesn't yet have an executable here)
	if ( executorConfig ) {
		// Register this executor for the given ZID (e.g. 'Z601' or 'Z612')
		executorConfigurations.set( softwareLanguages[ languageVersion ], executorConfig );

		// Register this executor under the language string (e.g. 'javascript-es5' or 'python-3-5')
		// TODO (T287155): This is a legacy, and we will remove it
		executorConfigurations.set( languageVersion, executorConfig );
	}
}

module.exports = { executorConfigurations };
