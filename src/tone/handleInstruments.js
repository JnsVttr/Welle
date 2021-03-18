import Tone from 'tone';
import { instruments, renderInstruments, debugTone } from './main-tone';


export function stopInstrument(instName) {
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
	if (debugTone) { console.log('Tone: stopAllInstruments: stopping all instruments!'); };
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
	if (debugTone) { console.log('Tone: playAllInstruments: playing all instruments!'); };
	//Tone.Transport.start();
	let now = Tone.now();
	let n = Tone.Transport.nextSubdivision('1n');
	// parseFloat("1.555").toFixed(2);
	// n = n.toFixed(0);
	if (debugTone) { console.log('Tone: playAllInstruments: playing all instruments at Tone.now() + 0.01: ' + now); };
	if (debugTone) { console.log('Tone: playAllInstruments: nextTickTime ' + n); };
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
