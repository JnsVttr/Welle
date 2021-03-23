
import { checkIfInstValid } from '../tone/checkIfInstValid';
import { livecode, semantics } from '/html/ohm/semantic2021';

export let enterFunction = (_string, _instrumentsList) => {
	
    let result = null;
	let state = null;

	// test input string
	if (_string != '') {
		// if input is not valid:
		if (livecode.match(_string).failed()) {
			state = 'failed';
		};
		// if input is valid
		if (livecode.match(_string).succeeded()) {
			// evaluate input through semantics
			result = semantics(livecode.match(_string)).eval();
			state = 'succeeded';
		};
	};


	// proceed on results of semantics:
	if (state == 'succeeded') {
		// if result valid in grammar, return result
		return {valid: true,  string: _string, result: result}
	};
	if (state == 'failed') {
		// if result not valid in grammar, check if string == instrument from list
		// if ( checkIfInstValid(_string, _instrumentsList) ) {
		// 	// if it is an instrument from list, just return a custom play command
		// 	let customResult = [
		// 		"transport", 
		// 		"sequenceStart",
		// 		["command", ['play'] ],
		// 		["instArray", [_string] ],
		// 		["pattern", [] ],
		// 		["rand", 0]
		// 	];
		// 	return {valid: true, string: _string, result: customResult};

		// } else {
		// 	// if input is not on list, and not valid, than return null
		// 	return {valid: false, string: _string, result:null}
		// }
		return {valid: false, string: _string, result:null}
	};
};



