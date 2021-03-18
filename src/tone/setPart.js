import { alertMuteState } from '/index';
import { renderTextToConsole } from '/helper/renderTextToConsole';
import { playAlerts } from '/helper/playAlerts';
import { printer } from '/helper/printer';
import { startTransport } from './startTransport';
import { stopInstrument } from './handleInstruments';
import { setBPM } from './handleParameters';
import { debug, context, savedParts, stopAllPartInstruments, instruments, playPartInstrument } from './main-tone';


export function setPart(name) {
	printer(debug, context, "printer", "value");
	startTransport();
	if (savedParts.bpm != undefined) {
		setBPM(savedParts.bpm, '');
	};

	// check if part exists before settings
	var check = false;
	Object.keys(savedParts).forEach(key => {
		if (key == name) {
			stopAllPartInstruments(name);
			// console.log('OUT stopall, save info: ' + JSON.stringify(savedParts[name].instruments));
			Object.keys(savedParts[name].instruments).forEach(key => {
				//savedParts[name].instruments
				// check, if all instruments are availible

				//console.log("setPart for following instrument: ", key);
				let instName = savedParts[name].instruments[key].name;
				let pattern = savedParts[name].instruments[key].pattern;
				let isPlaying = savedParts[name].instruments[key].isPlaying;
				let rand = savedParts[name].instruments[key].rand;
				let vol = savedParts[name].instruments[key].vol;
				let url = savedParts[name].instruments[key].url;
				if (savedParts[name].instruments[key].url != undefined) {
					stopInstrument(instName);
					delete instruments[instName];
				};

				// console.log('OUT playPartInstrument: ', instName, pattern, rand, isPlaying, url);
				playPartInstrument(instName, pattern, rand, isPlaying, url);
				// setVolume(instName, vol);	
			});
			check = true;
		};
	});
	if (!check) {
		let printData = 'no such part ..';
		renderTextToConsole(false, 'local', printData, 'local');
		playAlerts('error', alertMuteState);
	};
}
;
