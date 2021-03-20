import Tone from 'tone';
import { printer } from '/helper/printer';
import { debug, context } from './main-tone';



export function setVolume(_instrumentsList, _instruments, _instName, _vol) {
	if (_instruments[_instName] != null) {
		let volume = _vol;
		volume = _vol * _instrumentsList[_instName].gain;
		_instruments[_instName].vol = volume;
		_instrumentsList[_instName].vol = volume; // update also the list, don't know why jet : )

		console.log(`Tone: setVolume vol ${_vol} * gain ${_instrumentsList[_instName].gain} to ${volume}`);
		_instruments[_instName].synth.setVolume(volume);
	};
}
;
export function setRandom(_instruments, _instName, _rand) {
	if (_instruments[_instName] != null) {
		_instruments[_instName].rand = _rand;
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
