import { printer } from '/helper/printer';
import { debug, context, savedParts, instruments, thisBPM, renderParts } from './main-tone';

// PARTS
// ===================================================================


export function savePart(name, BPMvalue) {
	
	//console.log("save part under this name: ", name);
	savedParts[name] = { name: name };
	savedParts[name].instruments = {};
	// console.log("followinginst ar playing: "),
	Object.keys(instruments).forEach(key => {

		// console.log(instruments[key].name);
		var instName = instruments[key].name;
		var pattern = instruments[key].pattern;
		var sequence = instruments[key].sequence;
		var isPlaying = instruments[key].isPlaying;
		var rand = instruments[key].rand;
		var vol = instruments[key].vol;
		var url = instruments[key].url;
		var transpose = instruments[key].transpose;
		// console.log(name, pattern, rand);
		savedParts[name].instruments[instName] = {
			name: instName,
			pattern: pattern,
			sequence: sequence,
			isPlaying: isPlaying,
			rand: rand,
			vol: vol,
			url: url,
			transpose: transpose,
		};
	});
	savedParts.bpm = BPMvalue;
	
	// if (debugTone) { console.log('Tone: savePart: ' + JSON.stringify(savedParts))};
}
;
