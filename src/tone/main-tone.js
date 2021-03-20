
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
import { renderOutputLine, renderHtml }  from  '/html/renderHTML';
import { recorderDeal, handleForm, alertMuteState, instrumentsList, consoleArray, consoleLength }  from '/index' ;
import { checkDevice } from '/helper/checkDevice';
import { renderTextToConsole } from '/html/renderTextToConsole';
import { playAlerts } from '/helper/playAlerts';
import { update_InstrumentsList } from '/tone/update_InstrumentsList';
import { printer } from '/helper/printer';
import { checkIfInstValid } from './checkIfInstValid';
import { muteAll } from './muteAll';
import { initInstrument } from './initInstrument';
import { resetAction } from './resetAction';

import { stopInstrument, stopAllInstruments, playAllInstruments, adaptPattern, 
	playInstrument, assignNewPattern } from './handleInstruments';
import { setVolume, setRandom, setBPM } from './handleParameters';
import { updateInstrument } from './updateInstrument';
import { updateSequence } from './updateSequence';
import { savePart } from './savePart';
import { setPart } from './setPart';
import { renderInstruments } from '/html/renderInstruments';
import { help } from '/text/helpText';
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
export var savedParts = {};
export let masterOut = new Tone.Gain(0.9);   // master output
masterOut.toMaster();  // assign master
let thisBPM = 120;
Tone.Transport.bpm.value = thisBPM;
Tone.context.latencyHint = 'balanced';
// let now = Tone.now(); // not really needed


/*
printer(debug, context, "printer", "value");
*/










// export at the end

export function transport (cmd, instName, instArray, patternIn, rand, vol, bpm, name, num) {	
	
	// if (debugTone) {console.log('Tone: transport: INCOMING transport (' , cmd , instName , instArray , patternIn , rand , vol , bpm , name , num , ')' );};
	printer(debug, context, "transport", `incoming transport: 
				cmd: \t\t ${cmd} 
				instName: \t ${instName} 
				instArray: \t ${instArray} 
				patternIn: \t ${patternIn} 
				rand: \t\t ${rand}
				vol: \t\t ${vol}
				bpm: \t\t ${bpm}
				name: \t\t ${name}
				num: \t\t ${num}
	`);

	let state = false;  // instrument valid state
	let result = [];
	
	
	switch (cmd) {
		case 'play':
			// check
			state = checkIfInstValid (instName, instrumentsList);
			printer(debug, context, 'checkIfInstValid', `check valid for this inst: ${instName}: state: ${state}`);
			// if check valid
			if (state) { 
				let action = interpretInput(instruments, instName, patternIn)
				printer(debug, context, 'play main', `interpret result: ${action}`);

				// action
				switch (action) {
					case "playInstrument":
						// instrument there, just play it.. 
						printer(debug, context, "playInstrument", `play instrument without changes`);
						patternIn = instruments[instName].pattern;
						rand = instruments[instName].rand;
						printer(debug, context, `play instrument with existing pattern`, instruments[instName]);
						instruments[instName].sequence = createSequence(instruments, instName, patternIn);
						// start Tone
						startTransport();
						// play instrument sequence
						playInstrument(instruments, instName);
						printer(debug, context, `start playing`, `Tone & instrument started`);
						// render to html page
						renderInstruments(instruments);
						break;
					case "assignNewPattern":
						// assign new pattern & play instrument
						printer(debug, context, "playInstrument", `assign new pattern & play instrument`);
						patternIn = adaptPattern(patternIn);
						// assign new pattern in instruments{}
						assignNewPattern(instruments, instName, patternIn, rand);
						// create new sequence
						instruments[instName].sequence = createSequence(instruments, instName, patternIn);
						printer(debug, context, `create new sequence: ${instName} with this pattern: ${patternIn}`, instruments[instName].sequence);
						// start Tone
						startTransport();
						// play instrument sequence
						playInstrument(instruments, instName);
						printer(debug, context, `start playing`, `Tone & instrument started`);
						// render to html page
						renderInstruments(instruments);
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
						playInstrument(instruments, instName);
						printer(debug, context, `start playing`, `Tone & instrument started`);
						// render to html
						renderInstruments(instruments);
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
						playInstrument(instruments, instName);
						printer(debug, context, `start playing`, `Tone & instrument started`);
						// render to html
						renderInstruments(instruments);
						printer(debug, context, `start playing`, `instrument rendered to html instrument lists`);
						break;
				};
				
				
			} else {
				let errorMessage = help.error[0];
				printer(debug, context, 'checkIfInstValid', `error message ${errorMessage}`);
				consoleArray.push({ message: `${instName} - ${errorMessage}` });
				renderHtml(consoleArray, 'console', consoleLength);
				playAlerts('error', alertMuteState);
			}
		break;
		case 'stop':
			state = checkIfInstValid (instName, instrumentsList);
			if (state) {
				stopInstrument (instruments, instName);
				printer(debug, context, "stopInstrument", `for ${instName}`);
			}
			renderInstruments(instruments);
		break;
		case 'stopAll':
			printer(debug, context, "stop tone: ", Tone.Transport.state)
			stopAllInstruments(instruments);
			// render to html page
			renderInstruments(instruments);
		break;
		case 'playAll':
			printer(debug, context, "playAllInstruments", ``);
			// stopAllInstruments(instruments);
			playAllInstruments (instruments);
			// render to html page
			renderInstruments(instruments);
		break;
		case 'patternCopy':
			printer(debug, context, "copyPattern", `from ${instName} to ${instArray}`);
			state = checkIfInstValid (instName, instrumentsList);
			if (state) {
				if (instruments[instName] != null) {
					for (let i = 0; i < instArray.length; i++) {
						let singleInst = instArray[i];
						// if instruments exists
						if (instruments[singleInst] != null) {
							let pattern = instruments[instName].pattern;
							instruments[singleInst].sequence = createSequence(instruments, singleInst, pattern);	
							// play instrument sequence
							playInstrument(instruments, singleInst);
							// render to html page
							renderInstruments(instruments);
							
						} else {
						// if instruments doesn't exist
							let pattern = instruments[instName].pattern;
							instruments[singleInst] = createInstrument(instruments, instrumentsList, singleInst, pattern, rand, masterOut);
							instruments[singleInst].sequence = createSequence(instruments, singleInst, pattern);	
							// play instrument sequence
							playInstrument(instruments, singleInst);
							// render to html page
							renderInstruments(instruments);
						};
					};
				};
				
				
			};
		break;
		case 'setVolume':
			state = checkIfInstValid (instName, instrumentsList);
			if (state) {setVolume(instName, vol)};
		break;
		case 'setRandom':
			state = checkIfInstValid (instName, instrumentsList);	
			if (state) {setRandom(instName, rand)}
		break;
		case 'setBPM':
			setBPM(bpm, num)
		break;
		case 'savePart':
			savePart(name);
		break;
		case 'setPart':
			setPart(name);
		break;
		case 'deleteElement':
			deleteElement(instArray);
		break;
		case 'clearPart':
			clearParts();
		break;
		case 'reset':
			resetAction();
		break;
		case 'muteOn':
			muteAll(true);
		break;
		case 'muteOff':
			muteAll(false);
		break;
		case 'recordStart':
			if (device != 'ios') {audioRecord(true)};
		break;
		case 'recordStop':
			if (device != 'ios') {audioRecord(false)};
		break;
		case 'uploadFiles':
			uploadToServer(instName);
		break;
		case 'initInst':
			state = checkIfInstValid (instName, instrumentsList);
			if (state) {initInstrument(instName, name, num);}
		break;
	}
};


















export function randInPattern (instName) {
	// random:
	// if (debugTone){ console.log(`updateSequence: instruments[${instName}].rand = ${instruments[instName].rand}`) };
	if (instruments[instName].rand > 0) {
		let count = instruments[instName].ticks % (instruments[instName].pattern.length * instruments[instName].rand);
		// if (debugTone){ console.log(`updateSequence: instruments[${instName}].rand = ${instruments[instName].rand}, count = ${count}, instrument`) };
		if ((count+1) ==  ((instruments[instName].pattern.length * instruments[instName].rand)) ){
			// if (debugTone){ console.log('updateSequence: execute random func now!') };
			instruments[instName].randFunction()
			printer(debug, context, "randInPattern", "")
		};	
	};
};













// random helper, randomize patterns
export function shuffleArray(array) {
	printer(debug, context, "shuffleArray", "")
    var input = array;
    for (var i = input.length-1; i >=0; i--) {
        var randomIndex = Math.floor(Math.random()*(i+1)); 
        var itemAtIndex = input[randomIndex]; 
        input[randomIndex] = input[i]; 
        input[i] = itemAtIndex;
    }
    array = input;
    //console.log("New shuffleArray: ", array);
    return array;
};



























export function deleteElement (elements) {
	// check if element exists before settings
    var check = false;
	printer(debug, context, "deleteElement", "")
    

    // check for each element, could be part or instrument:
    for (let i=0; i< elements.length; i++) {
    	let name = elements[i];
    	Object.keys(savedParts).forEach(key => {
	        if (key == name) {
	        	delete savedParts[name];
	        	renderParts();
	            check = true;
	        };
	    });

	    Object.keys(instruments).forEach(inst => {
	        if (instruments[inst].name == name) {
	        	stopInstrument(name);
	        	delete instruments[name];
	        	renderInstruments();
	            check = true;
	        };
	    });	
    };
   
    if (!check) {
    	let printData = 'no such element to delete..';
		renderTextToConsole (false, 'local', printData, 'local');
		playAlerts('error', alertMuteState);
    };
};



export function stopAllPartInstruments (newPart) {
	printer(debug, context, "stopAllPartInstruments", "")

	Object.keys(instruments).forEach((instName) => {
		// check if instrument doesn't exists in new part:
		if (savedParts[newPart].instruments[instName]==undefined){
			instruments[instName].sequence.stop(0);	
			instruments[instName].isPlaying = false;		
		};
	});
};

export function playPartInstrument (instName, patternIn, rand, isPlaying, url) {
	printer(debug, context, "playPartInstrument", "")
	
	updateInstrument(instName, patternIn, rand, url);
	updateSequence(instName, patternIn);	
	if (isPlaying == true){
		playSequence(instName);		
	};
};



export function clearParts () {
	printer(debug, context, "clearParts", "")
	savedParts = {};
	renderParts();
};

export function renderParts() {
	printer(debug, context, "renderParts", "")
	let partNames = [];	
    Object.keys(savedParts).forEach(key => {
    	// console.log("render saveParts[keys]: " + savedParts[key].name);
    	// if key = instrument, not BPM:
    	if (savedParts[key].name!=undefined){
    		let name = ': ' + savedParts[key].name + '&nbsp;&nbsp;&nbsp; ';
    		partNames.push(name);	
    	};
    	
    });
    
    renderOutputLine(partNames,'parts:', 100);
};


function handlePresetsInTone(action, data) {
	printer(debug, context, "handlePresetsInTone", "")
	if (action == 'get') {
		savedParts.bpm = thisBPM;
		let parts = savedParts;
		return parts;
	};
	if (action == 'set') {
		savedParts = data;
		renderParts();
	};
};


// UPLOAD FILES
// ========================================================
export function uploadToServer(instName) {
	printer(debug, context, "uploadToServer", "")
	let name = instName;
	console.log('uploadToServer: toneTest: upload to server: ' + name);
	handleForm(name);
};

















// RECORDER
// ========================================================
const audioContext  	= Tone.context;
const recDestination  	= audioContext.createMediaStreamDestination();
let recorder;
let recorderStatus = 'stopped';
masterOut.connect(recDestination);
let chunks = [];

// doesn't work on IOS
if (device != 'ios') {
	recorder = new MediaRecorder(recDestination.stream);
	recorder.ondataavailable = evt => chunks.push(evt.data);
	recorder.onstop = evt => {
		let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
		let audioSrc = URL.createObjectURL(blob);
		recorderDeal('stopped', audioSrc);
		playAlerts('stop_recording', alertMuteState);
	};
};

export function audioRecord(state) {
	printer(debug, context, "audioRecord", "")
	if (state == true && recorderStatus == 'stopped') { recorderStatus = 'started'; recorder.start(); recorderDeal('started'); };
	if (state == false && recorderStatus == 'started' ){ recorderStatus = 'stopped'; recorder.stop(); resetRecorder(); };
};
function resetRecorder () { 
	printer(debug, context, "resetRecorder", "")
	chunks = []; 
};	












export { handlePresetsInTone } 