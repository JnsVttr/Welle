import { startTransport } from './startTransport';
import { printer } from '/helper/printer'
import { debug, context, instruments, playSequence, adaptPattern } from './main-tone';
import { updateSequence } from "./updateSequence";
import { updateInstrument } from "./updateInstrument";

// INSTRUMENTS - CONTROL
// ===================================================================


export function playInstrument(instName, patternIn, rand, url) {
	printer(debug, context, "playInstrument", `${instName}, ${patternIn}, ${rand}`);
	
	startTransport();

	let action = '';
	// checking
	if (instruments[instName] != null) {
		// instrument exists
		printer(debug, context, "playInstrument", `instrument exists`);
		
		if (patternIn[0] === null) {
			// empty call => instrument & pattern exists, just play instrument
			if (instruments[instName].pattern != null) {
				printer(debug, context, "playInstrument", `empty call => instrument & pattern "${instruments[instName].pattern}" exists, just play instrument!`);
				action = 'playInstrument';
			};
		};
		if (patternIn[0] != null) {
			// NON-empty call => instrument & pattern exists, assign new pattern to sequence
			printer(debug, context, "playInstrument", `NON-empty call => instrument & pattern exists, assign new pattern "${patternIn}" to sequence`);
			action = 'assignNewPattern';
		}

		// instrument NOT exists & new pattern is empty
	} else {


		if (patternIn.length == 1 && patternIn[0] === null) {
			// change new pattern to [1] & create new instrument
			printer(debug, context, "playInstrument", `instrument NOT exists & new pattern is empty`);
			action = 'createNewInstrumentPatternEmpty';
		} else {
			// new pattern is not empty, create new Instrument with new pattern
			printer(debug, context, "playInstrument", `instrument NOT exists & new pattern is Not empty: ${patternIn}`);
			action = 'createNewInstrumentPatternNonEmpty';
		};
	};

	printer(debug, context, "playInstrument", `incoming action: ${action}`);
	

	switch (action) {
		case "playInstrument":
			printer(debug, context, "playInstrument", `play instrument without changes`);
			// just play it.. 
			updateSequence(instName, instruments[instName].pattern);
			playSequence(instName);
			break;
		case "assignNewPattern":
			printer(debug, context, "playInstrument", `assign new pattern & play instrument`);
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand, url);
			updateSequence(instName, patternIn);
			playSequence(instName);
			break;
		case "createNewInstrumentPatternEmpty":
			printer(debug, context, "playInstrument", `create new instrument, replace empty pattern with [1]`);
			patternIn = [1];
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand, url);
			updateSequence(instName, patternIn);
			playSequence(instName);
			break;
		case "createNewInstrumentPatternNonEmpty":
			printer(debug, context, "playInstrument", `create new instrument w/ pattern`);
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand, url);
			updateSequence(instName, patternIn);
			playSequence(instName);
			break;
	};



}
;
