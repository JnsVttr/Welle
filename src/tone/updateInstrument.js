import Tone from 'tone';
import { Instrument } from '/tone/instruments';
import { instrumentsList } from '/index';
import { debugTone, instruments, masterOut, shuffleArray, updateSequence, playSequence } from './main-tone';

// INSTRUMENTS & SEQUENCE
// ===================================================================



export function updateInstrument(instName, pat, rand, newUrl) {
	if (debugTone) { console.log('Tone: updateInstrument: Start Instrument Handling..'); };

	// if instrument doesn't exists, create a new instrument: 
	if (instruments[instName] == null) {
		if (debugTone) { console.log('Tone: updateInstrument: Instrument not exisiting - new Instrument()'); };

		// create new instrument, based on stored params:
		let inst = new Instrument();


		// params taken from instrumentsList
		let instType = instrumentsList[instName].type;
		let defaultVol = instrumentsList[instName].vol * instrumentsList[instName].gain;
		let url = instrumentsList[instName].url;
		if (newUrl != undefined) {
			url = newUrl;
			if (debugTone) { console.log('Tone: updateInstrument: assign new url = ' + url); };
		}
		let note = instrumentsList[instName].baseNote;



		// update the new Instrument:
		inst.setVolume(defaultVol);
		if (instrumentsList[instName].baseNote != undefined) { inst.setBaseNote(note); };
		if (instrumentsList[instName].type == 'Sampler') {
			inst.updateSampleURL(url);
			if (debugTone) { console.log('Tone: updateInstrument: CHECK - sample URL = ' + url); };
		};

		inst.updateType(instType);
		inst.connect(masterOut);


		if (debugTone) { console.log('Tone: updateInstrument: CHECK - Tone.Transport.ticks = ' + Tone.Transport.ticks); };
		// store Instrument in Instrument collection
		instruments[instName] = {
			name: instName,
			synth: inst,
			type: instType,
			vol: defaultVol,
			pattern: pat,
			rand: rand,
			ticks: 0,
			url: url,
			note: note,
			isPlaying: false,
		};

		instruments[instName].randFunction = function () {
			let shufflePattern = shuffleArray(instruments[instName].pattern);
			instruments[instName].pattern = shufflePattern;
			if (instruments[instName].isPlaying) {
				updateSequence(instruments[instName].name, shufflePattern);
				playSequence(instruments[instName].name);
			} else {
				updateSequence(instruments[instName].name, shufflePattern);
			}
		};
		if (debugTone) { console.log(`Tone: updateInstrument:  New Instrument "${instName}" created!`); };

	} else {
		// store new params in Instrument collection
		instruments[instName].rand = rand;
		instruments[instName].pattern = pat;
	};
	//return instruments[instName]
}
;
