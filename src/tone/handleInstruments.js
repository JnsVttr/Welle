import Tone from 'tone';
import { printer } from '/helper/printer';
import { instruments, renderInstruments, debugTone, debug, context } from './main-tone';


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
