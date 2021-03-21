import Tone from 'tone';

// TRANSPORT
// =============

export function stopInstrument(_instruments, _instName) {
	// store all new items (before calling part)
	if (_instruments[_instName] != null) {
		// _instruments[_instName].sequence.stop();
		_instruments[_instName].sequence.stop();
		_instruments[_instName].isPlaying = false;
		console.log(`stopInstrument, seq state: ${_instruments[_instName].sequence.state}`)
		// instruments[instName].synth.dispose();
	};
}
;
export function muteInstrument(_instruments, _instName) {
	_instruments[_instName].sequence.mute = true;
	_instruments[_instName].isPlaying = false;
	console.log(`muteInstrument, seq state: ${_instruments[_instName].sequence.state}`)
	// instruments[instName].synth.dispose();
	
}; 
export function stopAllInstruments(_instruments) {
	Object.keys(_instruments).forEach((instName) => {
		_instruments[instName].sequence.stop();
		_instruments[instName].isPlaying = false;
	});
	// don't stop Tone - it doesn't work properly:
	// if (Tone.Transport.state!='stopped') {
	// 	Tone.Transport.stop();
	// };
}
;

export function playInstrument (_instruments,_instName, _quant) {
	let time = _quant();
	time = 0;

	Object.keys(_instruments).forEach((_instName) => {
		console.log(`playInstrument, seq state: ${_instruments[_instName].sequence.state}`)
		if (_instruments[_instName].sequence.state == 'stopped') {  
			_instruments[_instName].sequence.start();
			_instruments[_instName].isPlaying = true;
		};
		if (_instruments[_instName].sequence.state == 'started') {  
			_instruments[_instName].sequence.mute = false;
			_instruments[_instName].isPlaying = true;
		};
	});
};

export function unmuteInstrument (_instruments,_instName) {
	Object.keys(_instruments).forEach((_instName) => {
		console.log(`playInstrument, seq state: ${_instruments[_instName].sequence.state}`)
		if (_instruments[_instName].sequence.state == 'started') {  
			_instruments[_instName].sequence.mute = false;
			_instruments[_instName].isPlaying = true;
		};
	});
};

export function playAllInstruments(_instruments, _quant) {
	let time = _quant();

	// first stop all
	Object.keys(_instruments).forEach((instName) => {
		if (_instruments[instName].sequence.state == 'started') {
			_instruments[instName].sequence.stop();	
		};
	});
	// then start all together in sync
	Object.keys(_instruments).forEach((instName) => {
		if (_instruments[instName].sequence.state == 'started') {
			_instruments[instName].sequence.mute = false;
			_instruments[instName].isPlaying = true;
		};
		if (_instruments[instName].sequence.state == 'stopped') {
			_instruments[instName].sequence.start(time);
			_instruments[instName].isPlaying = true;
		};
	});
	
	// than start all instruments with small delay
	// setTimeout(function(){
	// 	Object.keys(_instruments).forEach((instName) => {
	// 		setTimeout(function(){
	// 			_instruments[instName].sequence.start(time).at(0);
	// 			_instruments[instName].isPlaying = true;
	// 		}, 1);
	// 	});
	// }, 2);
};


export const quant = () => {
	// sync to actual time
	let factor = 1;
	let now = Tone.TransportTime().valueOf();
	let quant = Tone.Time(now).quantize(factor);
	console.log(`now: ${now}. quant factor: ${factor}. quant: ${quant}`)

	if (quant < now){
		now+=1;
		quant = Tone.Time(now).quantize(factor);
		console.log("quant < now. new calc: ", `now: ${now}. quant factor: ${factor}. quant: ${quant}`)
	}
	return quant;
}




// PATTERN
// =============


export function adaptPattern (patAdapt) {
    for (let i=0;i<patAdapt.length;i++){
        if (patAdapt[i]==0) {
            patAdapt[i]=null
        }; 
    };
    return patAdapt;
};

export const assignNewPattern = (_instruments, _instName, _patternIn, _rand) => {
	// store new params in Instrument collection
	_instruments[_instName].rand = _rand;
	_instruments[_instName].pattern = _patternIn;
};


