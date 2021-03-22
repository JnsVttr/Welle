
// WELLE - audio system with Tone //
// =============================================================

/*
needs urgent re-work
step sequencer example:
https://tonejs.github.io/examples/stepSequencer

*/



// libraries
import Tone from 'tone';

// import files
import { instrumentsList } from '/index';
import { checkDevice } from '/helper/checkDevice';
import { printer } from '/helper/printer';

import { checkIfInstValid, checkIfPart } from './checkIfInstValid';
import {
	stopInstrument, muteInstrument, unmuteInstrument, stopAllInstruments, 
	playAllInstruments, adaptPattern,
	playInstrument, assignNewPattern, quant
} from './handleInstruments';
import { setVolume, setRandom, muteAll } from './handleParameters';
import { savePart } from './savePart';
import { interpretInput } from '/tone/interpretInput'
import { startTransport } from './startTransport';
import { createInstrument } from '/tone/createInstrument'
import { createSequence } from '/tone/createSequence'

// debug
export let debug = true;
export let context = "main-tone";
export let debugTone = true;  // old debug, needs to be removed

// device ?
export let device = checkDevice(); // check device, ios is not allowd to load mediarecorder

// tone variables
export var instruments = {};
export var parts = {};
export let masterOut = new Tone.Gain(0.9);   // master output
masterOut.toMaster();  // assign master
export let thisBPM = 165;
Tone.Transport.bpm.value = thisBPM;
Tone.context.latencyHint = 'balanced';

// let now = Tone.now(); // not really needed
// Tone - trigger the callback when the Transport reaches the desired time
// Tone.Transport.scheduleRepeat(function(time){
// }, "8n", "1m");

// let changer = new Tone.Frequency ( 103, "midi" );
// printer (debug, context, "tone changer", Tone.Frequency(69, "midi").toNote())

/*
printer(debug, context, "printer", "value");
*/













// main handling of sound commands
// =====================================
export function transport(inputContent) {
	
	
	// print incoming messages
	// =====================================
	printer(debug, context, "transport - incoming transport: ", inputContent);


	// extract input to variables
	let cmd = inputContent.cmd,
		instName = inputContent.inst,
		instArray = inputContent.instArray,
		patternIn = inputContent.pattern,
		rand = inputContent.rand,
		vol = inputContent.vol,
		bpm = inputContent.bpm,
		num = inputContent.num,
		name = inputContent.name;

	
	// add NULL to empty pattern, to be used later in main-tone transport
	if (patternIn =='' && Array.isArray(patternIn)) {
		patternIn[0] = null;
	};
	// variable to return page/socket/system related info
	let toneReturnData = {
		'html': "",
		'error': "",	
	};
	
	
	

	// check if instrument valid: state
	// =====================================

	// compare incoming commands with those, that should be excluded from checking incomning instruments or parts
	let excludeCheckList = [
		'stopAll', 
		'playAll', 
		'setBPM', 
		'muteOn', 
		'muteOff', 
		'saveCondition',
		'savePart',
	];
	let excludeMatch = false;
	for (let i=0; i<excludeCheckList.length; i++){
		if (cmd == excludeCheckList[i]){
			excludeMatch = true;
			printer(debug, context, "exclude from checkInstrumentsValid match found: ", cmd);
		}
	}
	// if incoming cmd should not be excluded, than test if instrument or part is valid
	if (excludeMatch==false) {
		let state = checkIfInstValid(instName, instrumentsList);
		printer(debug, context, "checkIfInstValid", `check valid for inst "${instName}" - state: ${state}`);
		// if instrument is not valid, than execute error 
		if (state==false) {
			// if input not an instrument, check if it is a part
			let isPart = checkIfPart(instName, parts);
			printer(debug, context, "checkIfInstValid", `check valid for part "${instName}" - state: ${isPart}`);
			if (isPart) {
				cmd = 'setPart';
				name = instName;
			} else {
				cmd = 'not valid';
			}
		}
		
		
	}


	// assign and execute commands for incoming transport
	// =================================================
	switch (cmd) {
		case 'not valid':
			printer(debug, context, 'checkIfInstValid', `error - not valid!!`);
			toneReturnData.error = "not valid";
			break;
		case 'play':
			let action = interpretInput(instruments, instName, patternIn)
			printer(debug, context, 'main-tone play interpretInput', `interpret result: ${action}`);

			// action
			switch (action) {
				case "playInstrument":
					// instrument there, just play it.. 
					printer(debug, context, "playInstrument", `play instrument without changes`);
					
					unmuteInstrument(instruments, instName);
					printer(debug, context, `unmute instrument`, `Tone & instrument started`);
					// render to html page
					toneReturnData.html = "render instruments";
					break;
				case "assignNewPattern":
					// assign new pattern & play instrument
					printer(debug, context, `playInstrument - assign new pattern & play instrument to this sequence: `, instruments[instName].sequence);
					patternIn = adaptPattern(patternIn);
					// assign new pattern in instruments{}
					assignNewPattern(instruments, instName, patternIn, rand);
					// stop old sequence
					instruments[instName].sequence.stop();
					// create new sequence
					instruments[instName].sequence = createSequence(instruments, instName, patternIn);
					printer(debug, context, `create new sequence: ${instName} with this pattern: ${patternIn}`, instruments[instName].sequence);
					// start Tone
					startTransport();
					// play instrument sequence
					playInstrument(instruments, instName, quant);
					printer(debug, context, `start playing`, `Tone & instrument started`);
					// render to html page
					toneReturnData.html = "render instruments";
					break;
				case "createNewInstrumentPatternEmpty":
					// create new instrument, replace empty pattern with [1]
					printer(debug, context, "playInstrument", `create new instrument, replace empty pattern with [1]`);
					patternIn = [1];
					patternIn = adaptPattern(patternIn);
					// create new instrument and store it in 'instruments'
					instruments[instName] = createInstrument(instruments, instrumentsList, instName, patternIn, rand, masterOut);
					printer(debug, context, `create new instrument: "${instName}" created!`, instruments[instName]);
					// create sequence
					instruments[instName].sequence = createSequence(instruments, instName, patternIn);
					printer(debug, context, `create new sequence: ${instName} with this pattern: ${patternIn}`, instruments[instName].sequence);
					// start Tone
					startTransport();
					// play instrument sequence
					playInstrument(instruments, instName, quant);
					printer(debug, context, `start playing`, `Tone & instrument started`);
					// render to html
					toneReturnData.html = "render instruments";
					printer(debug, context, `start playing`, `instrument rendered to html instrument lists`);
					break;
				case "createNewInstrumentPatternNonEmpty":
					// create new instrument w/ pattern
					printer(debug, context, "create new instrument", `create new instrument with pattern`);
					patternIn = adaptPattern(patternIn);
					// create new instrument and store it in 'instruments'
					instruments[instName] = createInstrument(instruments, instrumentsList, instName, patternIn, rand, masterOut);
					printer(debug, context, `create new instrument: "${instName}" created!`, instruments[instName]);
					// create sequence
					instruments[instName].sequence = createSequence(instruments, instName, patternIn);
					printer(debug, context, `create new sequence: ${instName} with this pattern: ${patternIn}`, instruments[instName].sequence);
					// start Tone
					startTransport();
					// play instrument sequence
					playInstrument(instruments, instName, quant);
					printer(debug, context, `start playing`, `Tone & instrument started`);
					// render to html
					toneReturnData.html = "render instruments";
					printer(debug, context, `start playing`, `instrument rendered to html instrument lists`);
					break;
			};
			break;
		case 'stop':
			muteInstrument(instruments, instName);
			printer(debug, context, "muteInstrument", `for ${instName}`);
			toneReturnData.html = "render instruments";
			break;
		case 'stopAll':
			printer(debug, context, "stop tone: ", Tone.Transport.state)
			stopAllInstruments(instruments, quant);
			// render to html page
			toneReturnData.html = "render instruments";
			break;
		case 'playAll':
			playAllInstruments(instruments, quant);
			printer(debug, context, "playAllInstruments", instruments);
			// render to html page
			toneReturnData.html = "render instruments";
			break;
		case 'patternCopy':
			printer(debug, context, "copyPattern", `from ${instName} to ${instArray}`);
			if (instruments[instName] != null) {
				for (let i = 0; i < instArray.length; i++) {
					let singleInst = instArray[i];
					// if instruments exists
					if (instruments[singleInst] != null) {
						let pattern = instruments[instName].pattern;
						instruments[singleInst].sequence = createSequence(instruments, singleInst, pattern);
						// play instrument sequence
						playInstrument(instruments, singleInst , quant);
						// render to html page
						toneReturnData.html = "render instruments";

					} else {
						// if instruments doesn't exist
						let pattern = instruments[instName].pattern;
						instruments[singleInst] = createInstrument(instruments, instrumentsList, singleInst, pattern, rand, masterOut);
						instruments[singleInst].sequence = createSequence(instruments, singleInst, pattern);
						// play instrument sequence
						playInstrument(instruments, singleInst, quant);
						// render to html page
						toneReturnData.html = "render instruments";
					};
				};
			};
			break;
		case 'setVolume':
			printer(debug, context, "setVolume", ``);
			setVolume(instrumentsList, instruments, instName, vol) 
			toneReturnData.html = "render instruments";
			break;
		case 'setRandom':
			printer(debug, context, "setRandom", ``);
			setRandom(instruments, instName, rand);
			toneReturnData.html = "render instruments";
			break;
		case 'setBPM':
			printer(debug, context, "setBPM", `to ${bpm} in ${num} seconds`);
			if (num == '') { Tone.Transport.bpm.value = bpm; }
			else { Tone.Transport.bpm.rampTo(bpm, num) };
			toneReturnData.html = "render bpm";
			break;
		case 'muteOn':
			printer(debug, context, "MuteAll", "on");
			muteAll(true);
			toneReturnData.html = "render muteOn";
			break;
		case 'muteOff':
			printer(debug, context, "MuteAll", "off");
			muteAll(false);
			toneReturnData.html = "render muteOff";
			break;

		
		
		// the parts is a seperate topic
		case 'savePart':
			let BPMvalue = Tone.Transport.bpm.value;
			// if part exists, then delete
			if (parts[name] != undefined) { parts[name] = {};  }
			// save part
			parts[name] = savePart(name, instruments, BPMvalue);
			printer(debug, context, `saveParts: ${name}, content: `, parts);
			// render Parts
			toneReturnData.html = "render parts";
			break;


		case 'setPart':
			printer(debug, context, "setPart name: ", name)
			
			// if the part exists
			if (parts[name] != undefined) {
				// stop all current instruments
				stopAllInstruments(instruments, quant);
				// empty the instruments
				instruments = {};
				// now for each instrument saved in the part, take essential values:
				Object.keys(parts[name].instruments).forEach(key => {
					let instName 	= parts[name].instruments[key].name;
					let pattern 	= parts[name].instruments[key].pattern;
					let rand 		= parts[name].instruments[key].rand;
					let vol 		= parts[name].instruments[key].vol;
					let isPlaying	= parts[name].instruments[key].isPlaying;
					
					// create instrument
					instruments[instName] = createInstrument(instruments, instrumentsList, instName, pattern, rand, masterOut);
					printer(debug, context, `create new instrument: "${instName}" created!`, instruments[instName]);
					// create sequence
					instruments[instName].sequence = createSequence(instruments, instName, pattern);
					printer(debug, context, `create new sequence: ${instName} with this pattern: ${patternIn}`, instruments[instName].sequence);
					// start Tone ??
					startTransport();
					// set volume
					setVolume(instrumentsList, instruments, instName, vol)
					// setTimeout(, 100);
					
					printer(debug, context, `Tone: setVolume vol to: `, vol);
				});
				printer(debug, context, `Tone: set Tone BPM ${Tone.Transport.bpm.value} val to stored val: `, parts[name].bpm);
				// setTimeout( () => {Tone.Transport.bpm.value = parts[name].bpm}, 200)
				Tone.Transport.bpm.value = parts[name].bpm
			};
			// play all new created instruments
			playAllInstruments(instruments, quant);
			break;
		case 'clearPart':
			// empty the variable
			parts = {};
			// renderParts();
			toneReturnData.html = "render parts";
			break;
	};

	return toneReturnData
};























// export function deleteElement(elements) {
// 	// check if element exists before settings
// 	var check = false;
// 	printer(debug, context, "deleteElement", "")


// 	// check for each element, could be part or instrument:
// 	for (let i = 0; i < elements.length; i++) {
// 		let name = elements[i];
// 		Object.keys(savedParts).forEach(key => {
// 			if (key == name) {
// 				delete savedParts[name];
// 				renderParts();
// 				check = true;
// 			};
// 		});

// 		Object.keys(instruments).forEach(inst => {
// 			if (instruments[inst].name == name) {
// 				stopInstrument(name);
// 				delete instruments[name];
// 				renderInstruments();
// 				check = true;
// 			};
// 		});
// 	};

// 	// if (!check) {
// 	// 	let printData = 'no such element to delete..';
// 	// 	renderTextToConsole(false, 'local', printData, 'local');
// 	// 	playAlerts('error', alertMuteState);
// 	// };
// };









// function handlePresetsInTone(action, data) {
// 	printer(debug, context, "handlePresetsInTone", "")
// 	if (action == 'get') {
// 		savedParts.bpm = thisBPM;
// 		let parts = savedParts;
// 		return parts;
// 	};
// 	if (action == 'set') {
// 		savedParts = data;
// 		renderParts();
// 	};
// };


























// // UPLOAD FILES
// // ========================================================
// export function uploadToServer(instName) {
// 	printer(debug, context, "uploadToServer", "")
// 	let name = instName;
// 	console.log('uploadToServer: toneTest: upload to server: ' + name);
// 	handleForm(name);
// };




// // RECORDER
// // ========================================================
// const audioContext = Tone.context;
// const recDestination = audioContext.createMediaStreamDestination();
// let recorder;
// let recorderStatus = 'stopped';
// masterOut.connect(recDestination);
// let chunks = [];

// // doesn't work on IOS
// if (device != 'ios') {
// 	recorder = new MediaRecorder(recDestination.stream);
// 	recorder.ondataavailable = evt => chunks.push(evt.data);
// 	recorder.onstop = evt => {
// 		let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
// 		let audioSrc = URL.createObjectURL(blob);
// 		recorderDeal('stopped', audioSrc);
// 		playAlerts('stop_recording', alertMuteState);
// 	};
// };

// export function audioRecord(state) {
// 	printer(debug, context, "audioRecord", "")
// 	if (state == true && recorderStatus == 'stopped') { recorderStatus = 'started'; recorder.start(); recorderDeal('started'); };
// 	if (state == false && recorderStatus == 'started') { recorderStatus = 'stopped'; recorder.stop(); resetRecorder(); };
// };
// function resetRecorder() {
// 	printer(debug, context, "resetRecorder", "")
// 	chunks = [];
// };




