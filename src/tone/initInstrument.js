import { sampleURL, instrumentsList, alertMuteState } from '/index';
import { renderTextToConsole } from '/helper/renderTextToConsole';
import { playAlerts } from '/helper/playAlerts';
import { printer } from '/helper/printer';
import { debug, context, stopInstrument, instruments, savedParts } from './main-tone';

// init Instrument/ Sampler
// ========================================================



export function initInstrument(dest, source, num) {
	// if (debugTone) {console.log('Tone: initInstrument: assign new sounds from: ' + source + '[' + num + '] ' + 'to ' + dest)};
	printer(debug, context, "initInstrument", `assign new sounds from source[num]: ${source[num]} to dest: ${dest}`);

	let error = function () {
		let printData = 'Mp3 file not existing -- or \"' + source + '\"[ ] is no valid folder!';
		renderTextToConsole(false, 'local', printData, 'local');
		playAlerts('error', alertMuteState);
		return false;
	};
	if (sampleURL[source] != undefined) {
		if (sampleURL[source][num] != undefined) {
			// if (debugTone) {console.log(`Tone: initInstrument: file ${source}[${num}] is availible.`) };
			// if (debugTone) {console.log(`Tone: initInstrument: URL =  ${sampleURL[source][0]}`) };
			let inst = dest;
			// if (debugTone) {console.log('Tone: initInstrument: Stop instrument: '+ inst + 'and remove from Instrument List')};
			stopInstrument(inst);
			delete instruments[inst];

			// delete from saved Parts, otherwise throws errors
			// if (debugTone) {console.log('Tone: initInstrument: delete from saved Parts, otherwise throws errors for instrument: '+ inst)};
			Object.keys(savedParts).forEach(key => {
				if (key != 'bpm') {
					// if (debugTone) { console.log('Tone: initInstrument: savedParts: ' + key) };
					if (savedParts[key].instruments[dest] != undefined) {
						// if (debugTone) { console.log('Tone: initInstrument: savedParts: delete ' + savedParts[key].instruments[dest]) };
						// delete savedParts[key].instruments[dest];
					}
				};
			});
			// if (debugTone) {console.log(`Tone: initInstrument: assign new sample to instrumentsList collection.. `)};
			instrumentsList[dest].url = sampleURL[source][num];

		} else { error(); };

	} else { error(); }
}
;
