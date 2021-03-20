import { printer } from '/helper/printer';
import { debug, context } from './main-tone';




export const interpretInput = (_instruments, _instName, _patternIn) => {
	let action = '';
	// checking
	if (_instruments[_instName] != null) {
		// instrument exists
		// printer(debug, context, "playInstrument", `instrument exists`);

		if (_patternIn[0] === null) {
			// empty call => instrument & pattern exists, just play instrument
			if (_instruments[_instName].pattern != null) {
				// printer(debug, context, "playInstrument", `empty call => 
				// instrument & pattern "${_instruments[_instName].pattern}" exists, 
				// just play instrument!`);
				action = 'playInstrument';
			};
		};
		if (_patternIn[0] != null) {
			// NON-empty call => instrument & pattern exists, assign new pattern to sequence
			// printer(debug, context, "playInstrument", `NON-empty call => 
			// instrument & pattern exists, assign new pattern "${_patternIn}" to sequence`);
			action = 'assignNewPattern';
		}


	} else {
		// instrument NOT exists & new pattern is empty	
		if (_patternIn.length == 1 && _patternIn[0] === null) {
			// change new pattern to [1] & create new instrument
			// printer(debug, context, "playInstrument", `instrument NOT exists & new pattern is empty`);
			action = 'createNewInstrumentPatternEmpty';
		} else {
			// new pattern is not empty, create new Instrument with new pattern
			// printer(debug, context, "playInstrument", `instrument NOT exists & new pattern is Not empty: ${_patternIn}`);
			action = 'createNewInstrumentPatternNonEmpty';
		};
	};
	return action;
};
