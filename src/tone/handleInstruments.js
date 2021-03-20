import Tone from 'tone';
import { printer } from '/helper/printer';
import { instruments, debugTone, debug, context } from './main-tone';
import { renderInstruments } from "../html/renderInstruments";


export function stopInstrument(instName) {
	printer(debug, context, "stopInstrument", `for ${instName}`);
	// store all new items (before calling part)
	if (instruments[instName] != null) {
		instruments[instName].sequence.stop();
		instruments[instName].isPlaying = false;
		// instruments[instName].synth.dispose();
	};
	renderInstruments();
}
;
export function stopAllInstruments() {
	printer(debug, context, "stopAllInstruments", ``);
	
	Object.keys(instruments).forEach((instName) => {
		instruments[instName].sequence.stop();
		instruments[instName].isPlaying = false;
		// instruments[instName].synth.dispose();
	});
	// if (Tone.Transport.state!='stopped') {
	// 	Tone.Transport.stop();
	// };
	renderInstruments();
}
;
export function playAllInstruments() {
	printer(debug, context, "playAllInstruments", ``);
	//Tone.Transport.start();
	let now = Tone.now();
	let n = Tone.Transport.nextSubdivision('1n');
	// parseFloat("1.555").toFixed(2);
	// n = n.toFixed(0);
	
	Object.keys(instruments).forEach((instName) => {
		if (instruments[instName].isPlaying == true) {
			stopInstrument(instName);
		};
		// if (instruments[instName].isPlaying==false){
		instruments[instName].sequence.start().at(0);
		instruments[instName].isPlaying = true;
		// };
	});
	renderInstruments();
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