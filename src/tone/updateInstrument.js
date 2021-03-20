import Tone from 'tone';
import { Instrument } from '/tone/instruments';
import { instrumentsList } from '/index';
import { printer } from '/helper/printer';
import { debug, context, instruments, masterOut, shuffleArray, playSequence } from './main-tone';
import { updateSequence } from "./updateSequence";

;


export function updateInstrument(instName, pat, rand, newUrl) {
	printer(debug, context, "updateInstrument", `Start Instrument Handling..`);

	// if instrument doesn't exists, create a new instrument: 
	if (instruments[instName] == null) {
		printer(debug, context, "updateInstrument", `Instrument not exisiting - new Instrument()`);
		
		// create new instrument, based on stored params:
		let inst = new Instrument();


		// params taken from instrumentsList
		let instType = instrumentsList[instName].type;
		let defaultVol = instrumentsList[instName].vol * instrumentsList[instName].gain;
		let url = instrumentsList[instName].url;
		if (newUrl != undefined) {
			url = newUrl;
			printer(debug, context, "updateInstrument", `assign new url from list, url: ${url}`);
		}
		let note = instrumentsList[instName].baseNote;



		// update the new Instrument:
		inst.setVolume(defaultVol);
		if (instrumentsList[instName].baseNote != undefined) { inst.setBaseNote(note); };
		if (instrumentsList[instName].type == 'Sampler') {
			inst.updateSampleURL(url);
			printer(debug, context, "updateInstrument", `CHECK - sample URL: ${url}`);
		};

		inst.updateType(instType);
		inst.connect(masterOut);


		
		printer(debug, context, "updateInstrument", `CHECK - Tone.Transport.ticks: ${Tone.Transport.ticks}`);
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
		printer(debug, context, "updateInstrument", `New Instrument "${instName}" created!`);
		

	} else {
		// store new params in Instrument collection
		instruments[instName].rand = rand;
		instruments[instName].pattern = pat;
	};
	//return instruments[instName]
	printer(debug, context, "updateInstrument - all instruments", instruments);
	printer(debug, context, "updateInstrument - this instrument", instruments[instName])
}


