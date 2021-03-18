import Tone from 'tone';
import { printer } from '/helper/printer';
import { debug, context, clearParts, instruments, thisBPM } from './main-tone';
import { stopAllInstruments } from "./handleInstruments";


export function resetAction() {
	printer(debug, context, "resetAction", "resetting");

	setTimeout(function () {
		stopAllInstruments();
	}, 20);
	setTimeout(function () {
		clearParts();
	}, 40);
	setTimeout(function () {
		// console.clear();
		Object.keys(instruments).forEach((inst) => {
			// if (debugTone) {console.log('Tone: ResetAction: instrument: ' + instruments[inst].name)};
			instruments[inst].synth.synth.dispose();
			instruments[inst].sequence.dispose();
		});
		instruments = {};
	}, 60);
	setTimeout(function () {
		Tone.Transport.stop();
		// console.log("testing stop & sync the Tone.Transport");
	}, 80);
	setTimeout(function () {
		// Tone.Transport.ticks = 0;
		// Tone.context.latencyHint = 'fastest';
		thisBPM = 120;
		Tone.Transport.bpm.value = thisBPM;
		// if (debugTone) {console.log('Tone: ResetAction: set global BPM to:  ' + thisBPM)};
		let now = Tone.now();
		// if (debugTone) {console.log('Tone: ResetAction: Time now =  ' + now)};
		Tone.Transport.start(now);
		// if (debugTone) {console.log('Tone: resetAction: Finished: Tone.Transport State = ', Tone.Transport.state)} ;
	}, 100);
}
;
