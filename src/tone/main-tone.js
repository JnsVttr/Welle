
// WELLE - audio system with Tone //
// =============================================================

/*
needs urgent re-work
*/

// libraries
import Tone from 'tone';

// import files
import { renderOutputLine }  from  '/html/renderHTML';
import { recorderDeal, handleForm, alertMuteState }  from '/index' ;
import { checkDevice } from '/helper/checkDevice';
import { renderTextToConsole } from '/helper/renderTextToConsole';
import { playAlerts } from '/helper/playAlerts';
import { update_InstrumentsList } from '/tone/update_InstrumentsList';
import { printer } from '/helper/printer';
import { checkIfInstValid } from './checkIfInstValid';
import { muteAll } from './muteAll';
import { initInstrument } from './initInstrument';
import { resetAction } from './resetAction';
import { playInstrument } from './playInstrument';
import { stopInstrument, stopAllInstruments, playAllInstruments } from './handleInstruments';
import { copyPattern } from './copyPattern';
import { setVolume, setRandom, setBPM } from './handleParameters';
import { updateInstrument } from './updateInstrument';
import { updateSequence } from './updateSequence';
import { savePart } from './savePart';
import { setPart } from './setPart';

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
export let thisBPM = 120;
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

	let state;  // instrument valid state
	
	
	switch (cmd) {
		case 'play':
			state = checkIfInstValid (instName);
			if (state) {playInstrument (instName, patternIn, rand)};
		break;
		case 'stop':
			state = checkIfInstValid (instName);
			if (state) {stopInstrument (instName);};
		break;
		case 'stopAll':
			stopAllInstruments();
		break;
		case 'playAll':
			playAllInstruments ();
		break;
		case 'patternCopy':
			state = checkIfInstValid (instName);
			if (state) {copyPattern (instName, instArray)};
		break;
		case 'setVolume':
			state = checkIfInstValid (instName);
			if (state) {setVolume(instName, vol)};
		break;
		case 'setRandom':
			state = checkIfInstValid (instName);	
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
			state = checkIfInstValid (instName);
			if (state) {initInstrument(instName, name, num);}
		break;
	}
};


















export function randInPattern (instName) {
	printer(debug, context, "randInPattern", "")
	// random:
	// if (debugTone){ console.log(`updateSequence: instruments[${instName}].rand = ${instruments[instName].rand}`) };
	if (instruments[instName].rand > 0) {
		let count = instruments[instName].ticks % (instruments[instName].pattern.length * instruments[instName].rand);
		// if (debugTone){ console.log(`updateSequence: instruments[${instName}].rand = ${instruments[instName].rand}, count = ${count}, instrument`) };
		if ((count+1) ==  ((instruments[instName].pattern.length * instruments[instName].rand)) ){
			// if (debugTone){ console.log('updateSequence: execute random func now!') };
			instruments[instName].randFunction()
		};	
	};
};






export function playSequence (instName) {
	printer(debug, context, "playSequence", "")

	if (instruments[instName].type == 'Sampler'){
		setTimeout(function(){
			instruments[instName].sequence.start(0);
			instruments[instName].isPlaying = true;		
			renderInstruments();
		}, 200);
	} else {
		instruments[instName].sequence.start(0);
		instruments[instName].isPlaying = true;		
		renderInstruments();
	};
};



export function adaptPattern (patAdapt) {
    for (let i=0;i<patAdapt.length;i++){
        if (patAdapt[i]==0) {
            patAdapt[i]=null
        }; 
    };
    return patAdapt;
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


export function renderInstruments() { 
	printer(debug, context, "renderInstruments", "")
	let instrumentNames = [];
    Object.keys(instruments).forEach(inst => {
    	let newInstName = '';
    	if (instruments[inst].isPlaying) {
    		newInstName = '&nbsp;&nbsp;&nbsp;&nbsp;' +  instruments[inst].name + '&nbsp;&nbsp;&nbsp; '; 	
    	};
    	if (instruments[inst].isPlaying == false) {
    		newInstName = '&nbsp;X ' +  instruments[inst].name + '&nbsp;&nbsp;&nbsp; '; 	
    	};
    	instrumentNames.push(newInstName);
    });
	printer(debug, context, "renderInstruments", `render instruments to page`)
    
    renderOutputLine(instrumentNames,'instruments:', 100);
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