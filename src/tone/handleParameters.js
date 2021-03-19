import Tone from 'tone';
import { instrumentsList } from '/index';
import { printer } from '/helper/printer';
import { instruments, debug, context, thisBPM } from './main-tone';



export function setVolume(instName, vol) {
	if (instruments[instName] != null) {
		let volume = vol;
		volume = vol * instrumentsList[instName].gain;
		instruments[instName].vol = volume;
		instrumentsList[instName].vol = volume; // update also the list, don't know why jet : )

		// if (debugTone){console.log(`Tone: setVolume vol ${vol} * gain ${instrumentsList[instName].gain} to ${volume}`)};
		instruments[instName].synth.setVolume(volume);
	};
}
;
export function setRandom(instName, rand) {
	if (instruments[instName] != null) {
		instruments[instName].rand = rand;
	};
}
;
export function setBPM (bpm, num) {
	if (num == '') {
		printer(debug, context, "setBPM", `set bpm to: ${bpm}`);
		thisBPM = bpm;
		Tone.Transport.bpm.value = bpm;
	} else {
		Tone.Transport.bpm.rampTo(bpm, num);
		printer(debug, context, "setBPM", `set bpm to: ${bpm} in seconds: ${num}`);
	};
}
;
