import { startTransport } from './startTransport';
import { debugTone, instruments, updateSequence, playSequence, adaptPattern, updateInstrument } from './main-tone';

// INSTRUMENTS - CONTROL
// ===================================================================


export function playInstrument(instName, patternIn, rand, url) {
	if (debugTone) { console.log('Tone: playInstrument: playInstrument() at Tone', instName, patternIn, rand); };
	startTransport();

	let action = '';
	// checking
	if (instruments[instName] != null) {
		// instrument exists
		if (debugTone) { console.log('Tone: playInstrument: instrument exists!'); };
		if (patternIn[0] === null) {
			// empty call => instrument & pattern exists, just play instrument
			if (instruments[instName].pattern != null) {
				if (debugTone) { console.log(`Tone: playInstrument: empty call => instrument & pattern "${instruments[instName].pattern}" exists, just play instrument!`); };
				action = 'playInstrument';
			};
		};
		if (patternIn[0] != null) {
			// NON-empty call => instrument & pattern exists, assign new pattern to sequence
			if (debugTone) { console.log(`Tone: playInstrument: NON-empty call => instrument & pattern exists, assign new pattern "${patternIn}" to sequence`); };
			action = 'assignNewPattern';
		}

		// instrument NOT exists & new pattern is empty
	} else {


		if (patternIn.length == 1 && patternIn[0] === null) {
			// change new pattern to [1] & create new instrument
			if (debugTone) { console.log('Tone: playInstrument: instrument NOT exists & new pattern is empty'); };
			action = 'createNewInstrumentPatternEmpty';
		} else {
			// new pattern is not empty, create new Instrument with new pattern
			if (debugTone) { console.log('Tone: playInstrument: instrument NOT exists & new pattern is Not empty: ' + patternIn); };
			action = 'createNewInstrumentPatternNonEmpty';
		};
	};
	if (debugTone) { console.log("Tone: playInstrument: incoming action: ", action); };

	switch (action) {
		case "playInstrument":
			if (debugTone) { console.log('Tone: playInstrument: play instrument without changes'); };
			// just play it.. 
			updateSequence(instName, instruments[instName].pattern);
			playSequence(instName);
			break;
		case "assignNewPattern":
			if (debugTone) { console.log('Tone: playInstrument: assign new pattern & play instrument'); };
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand, url);
			updateSequence(instName, patternIn);
			playSequence(instName);
			break;
		case "createNewInstrumentPatternEmpty":
			if (debugTone) { console.log('Tone: playInstrument: create new instrument, replace empty pattern with [1]'); };
			patternIn = [1];
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand, url);
			updateSequence(instName, patternIn);
			playSequence(instName);
			break;
		case "createNewInstrumentPatternNonEmpty":
			if (debugTone) { console.log('Tone: playInstrument: create new instrument w/ pattern'); };
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand, url);
			updateSequence(instName, patternIn);
			playSequence(instName);
			break;
	};



}
;
