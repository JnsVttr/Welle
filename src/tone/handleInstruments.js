import Tone from 'tone';
import { printer } from '/helper/printer';
import { instruments, debugTone, debug, context } from './main-tone';
import { renderInstruments } from "../html/renderInstruments";


export function stopInstrument(_instruments, _instName) {
	// store all new items (before calling part)
	if (_instruments[_instName] != null) {
		_instruments[_instName].sequence.stop();
		_instruments[_instName].isPlaying = false;
		// instruments[instName].synth.dispose();
	};
}
;
export function stopAllInstruments(_instruments) {
	printer(debug, context, "stopAllInstruments", ``);
	
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

export function playInstrument (_instruments,_instName) {
	// if sampler, than short timeout()
	if (_instruments[_instName].type == 'Sampler'){
		setTimeout(function(){
			_instruments[_instName].sequence.start(0);
			_instruments[_instName].isPlaying = true;		
		}, 80);
	} else {
		_instruments[_instName].sequence.start(0);
		_instruments[_instName].isPlaying = true;		
	};
};

export function playAllInstruments(_instruments) {
	Object.keys(_instruments).forEach((instName) => {
		if (_instruments[instName].isPlaying == true) {
			_instruments[instName].sequence.stop();
			_instruments[instName].isPlaying = false;
		};
		_instruments[instName].sequence.start().at(0);
		_instruments[instName].isPlaying = true;
		// };
	});
}
;
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


