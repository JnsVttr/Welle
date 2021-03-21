
// PARTS
// ===================================================================


export function savePart(_name, _instruments, _BPMvalue) {
	
	//console.log("save part under this name: ", name);
	
	let partInstruments = {};
	// console.log("followinginst ar playing: "),
	Object.keys(_instruments).forEach(key => {

		// console.log(instruments[key].name);
		var instName 	= _instruments[key].name;
		var pattern 	= _instruments[key].pattern;
		var sequence 	= _instruments[key].sequence;
		var isPlaying 	= _instruments[key].isPlaying;
		var rand 		= _instruments[key].rand;
		var vol 		= _instruments[key].vol;
		var url 		= _instruments[key].url;
		var transpose 	= _instruments[key].transpose;
		// console.log(name, pattern, rand);
		partInstruments[instName] = {
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
	
	
	return {
		instruments: partInstruments,
		bpm: _BPMvalue
	}
}
;


/*
return {
        name: _instName,
        synth: inst,
        type: instType,
        vol: defaultVol,
        pattern: _patternIn,
        rand: _rand,
        ticks: 0,
        url: url,
        note: note,
        isPlaying: false,
        randFunction: randFunction,
    };
*/