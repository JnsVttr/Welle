
import Tone from 'tone';
import { Instrument } from '/tone/instruments';
import { renderOutputLine }  from  '/html/renderHTML';
import { sampleURL, instrumentsList, recorderDeal, handleForm, alertMuteState }  from '/index' ;
import { checkDevice } from '/helper/checkDevice';
import { renderTextToConsole } from '/helper/renderTextToConsole';
import { playAlerts } from '/helper/playAlerts';
import { update_InstrumentsList } from '/tone/update_InstrumentsList'

// debug
export let debug = true;
export let context = "main-tone";

// old debug
let debugTone = true;
// printer(debug, context, "test", "sth.")


//console.clear();
var instruments = {};
var savedParts = {};
// master output
let masterOut = new Tone.Gain(0.9);
masterOut.toMaster();
// check device, ios is not allowd to load mediarecorder
let device = checkDevice();
let thisBPM = 120;










// SAMPLER / SERVER FILES
// ========================================================

let soundDataURLs = {};
let sampleDefault;
// let sampleURL = {default: ['../']};







// init Instrument/ Sampler
// ========================================================
function initInstrument(dest, source, num) {
	if (debugTone) {console.log('Tone: initInstrument: assign new sounds from: ' + source + '[' + num + '] ' + 'to ' + dest)};
	
	let error = function () {
		let printData = 'Mp3 file not existing -- or \"' + source + '\"[ ] is no valid folder!';
		renderTextToConsole (false, 'local', printData, 'local');
		playAlerts('error', alertMuteState);
		return false;
	};
	if (sampleURL[source] != undefined){
		if (sampleURL[source][num] != undefined) {
			if (debugTone) {console.log(`Tone: initInstrument: file ${source}[${num}] is availible.`) };
			if (debugTone) {console.log(`Tone: initInstrument: URL =  ${sampleURL[source][0]}`) };
			
			let inst = dest;
			if (debugTone) {console.log('Tone: initInstrument: Stop instrument: '+ inst + 'and remove from Instrument List')};
			stopInstrument(inst);
			delete instruments[inst];
			
			// delete from saved Parts, otherwise throws errors
			if (debugTone) {console.log('Tone: initInstrument: delete from saved Parts, otherwise throws errors for instrument: '+ inst)};
			Object.keys(savedParts).forEach(key => {
				if (key!='bpm'){
					if (debugTone) { console.log('Tone: initInstrument: savedParts: ' + key) };
					if(savedParts[key].instruments[dest]!=undefined){
						if (debugTone) { console.log('Tone: initInstrument: savedParts: delete ' + savedParts[key].instruments[dest]) };
						// delete savedParts[key].instruments[dest];
					}
				};
		    });
			if (debugTone) {console.log(`Tone: initInstrument: assign new sample to instrumentsList collection.. `)};
			instrumentsList[dest].url = sampleURL[source][num];

		} else { error(); };

	} else {error();}
};
















// UPLOAD FILES
// ========================================================
function uploadToServer(instName) {
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

function audioRecord(state) {
	if (state == true && recorderStatus == 'stopped') { recorderStatus = 'started'; recorder.start(); recorderDeal('started'); };
	if (state == false && recorderStatus == 'started' ){ recorderStatus = 'stopped'; recorder.stop(); resetRecorder(); };
};
function resetRecorder () { 
	chunks = []; 
};	




































// TONE TRANSPORT
// =====================================================================
Tone.Transport.bpm.value = thisBPM;
Tone.context.latencyHint = 'balanced';

function startTransport () {
	if (Tone.Transport.state=='stopped') {
		if (debugTone){console.log('Tone: startTransport: Tone.Transport State: ', Tone.Transport.state, ' --> starting Tone Transport..');};
		// Tone.Transport.ticks = 0;
		Tone.Transport.bpm.value = thisBPM;
		now = Tone.now();
		Tone.context.latencyHint = 'balanced';
		Tone.Transport.start();
		if (debugTone){ console.log('Tone: startTransport: Check Done: Tone.Transport State = ', Tone.Transport.state);}
	} else { 
		if (debugTone){console.log("Tone: startTransport: Tone is playing");}
	};
};


// translate incoming messages (parseInput) to sound functions:
function transport (cmd, instName, instArray, patternIn, rand, vol, bpm, name, num) {	
	console.log('');
	console.log('');
	if (debugTone) {console.log('Tone: transport: INCOMING transport (' , cmd , instName , instArray , patternIn , rand , vol , bpm , name , num , ')' );};

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













































// SYSTEM CONTROL
// ===================================================================


function muteAll(state) {
	if (debugTone){ console.log('Tone: muteAll: Transport: change mute state..') };
	if (state) {Tone.Master.mute = true;  playAlerts('return', alertMuteState)}
	if (state == false ) {Tone.Master.mute = false; playAlerts('return', alertMuteState)}
};

let now = 0;
function resetAction() {
	setTimeout(function() {
	  stopAllInstruments ();
	}, 20);
	setTimeout(function() {
	  clearParts ();
	}, 40);
	setTimeout(function() {
	  	// console.clear();
	  	Object.keys(instruments).forEach((inst) => {
	  		if (debugTone) {console.log('Tone: ResetAction: instrument: ' + instruments[inst].name)};
	  		instruments[inst].synth.synth.dispose();
	  		instruments[inst].sequence.dispose();
	  	});
	  	instruments = {};
	}, 60);
	setTimeout(function() {
	  Tone.Transport.stop();
	  // console.log("testing stop & sync the Tone.Transport");
	}, 80);
	setTimeout(function() {
		// Tone.Transport.ticks = 0;
		// Tone.context.latencyHint = 'fastest';
		thisBPM = 120;
		Tone.Transport.bpm.value = thisBPM;
		if (debugTone) {console.log('Tone: ResetAction: set global BPM to:  ' + thisBPM)};
		now = Tone.now();
		if (debugTone) {console.log('Tone: ResetAction: Time now =  ' + now)};
	  	Tone.Transport.start(now);
	  	if (debugTone) {console.log('Tone: resetAction: Finished: Tone.Transport State = ', Tone.Transport.state)} ;
	}, 100);
};


function checkIfInstValid (instNameIncoming) {
	if (debugTone){ console.log('');};
	if (debugTone){ console.log('Tone: checkIfInstValid: check valid for this inst: ' + instNameIncoming);};
	// check, if instrument is valid
	let instAvailible = false;

	Object.keys(instrumentsList).forEach((instName) => {
		// if (debugTone){console.log('checkIfInstValid: instrumentsList{} .name: ' + instrumentsList[instName].name + ' .type: ' + instrumentsList[instName].type);};
		if (instNameIncoming == instrumentsList[instName].name) {
			instAvailible = true;
		};
	});

	
	if (instAvailible == false ) {
		let string = 'no such instrument ..';
		renderTextToConsole(false, 's', string, 'local');
		playAlerts('error', alertMuteState);
	};
	if (instAvailible == true) {
		if (debugTone){console.log('Tone: checkIfInstValid: found ' + instNameIncoming) };
		return instAvailible;
	};
	return instAvailible;
	if (debugTone){ console.log('');};
};
































// INSTRUMENTS - CONTROL
// ===================================================================


function playInstrument (instName, patternIn, rand, url) {
	if (debugTone){ console.log('Tone: playInstrument: playInstrument() at Tone', instName, patternIn, rand) };
	startTransport();
	
	let action = '';
	// checking
	if (instruments[instName]!=null) {
		// instrument exists
		if (debugTone){console.log('Tone: playInstrument: instrument exists!')};
		if (patternIn[0]===null) {
			// empty call => instrument & pattern exists, just play instrument
			if (instruments[instName].pattern!=null){
				if (debugTone){console.log(`Tone: playInstrument: empty call => instrument & pattern "${instruments[instName].pattern}" exists, just play instrument!`)};
				action = 'playInstrument'	
			};			
		};
		if (patternIn[0]!=null){
			// NON-empty call => instrument & pattern exists, assign new pattern to sequence
			if (debugTone){console.log(`Tone: playInstrument: NON-empty call => instrument & pattern exists, assign new pattern "${patternIn}" to sequence`)};
			action = 'assignNewPattern'
		}

	// instrument NOT exists & new pattern is empty
	} else {
		
		
		if (patternIn.length==1 && patternIn[0]===null){
			// change new pattern to [1] & create new instrument
			if (debugTone){console.log('Tone: playInstrument: instrument NOT exists & new pattern is empty')};
			action = 'createNewInstrumentPatternEmpty';
		} else {
			// new pattern is not empty, create new Instrument with new pattern
			if (debugTone){console.log('Tone: playInstrument: instrument NOT exists & new pattern is Not empty: ' + patternIn)};
			action = 'createNewInstrumentPatternNonEmpty';
		};
	};
	if (debugTone){console.log("Tone: playInstrument: incoming action: ", action);};

	switch (action) {
		case "playInstrument":
			if (debugTone){console.log('Tone: playInstrument: play instrument without changes')};
			// just play it.. 
			updateSequence(instName, instruments[instName].pattern);
			playSequence(instName);
		break;
		case "assignNewPattern":
			if (debugTone){console.log('Tone: playInstrument: assign new pattern & play instrument')};
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand, url);
			updateSequence(instName, patternIn);
			playSequence(instName);
		break;
		case "createNewInstrumentPatternEmpty":
			if (debugTone){console.log('Tone: playInstrument: create new instrument, replace empty pattern with [1]')};
			patternIn = [1];
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand, url);
			updateSequence(instName, patternIn);
			playSequence(instName);
		break;
		case "createNewInstrumentPatternNonEmpty":
			if (debugTone){console.log('Tone: playInstrument: create new instrument w/ pattern')};
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand, url);
			updateSequence(instName, patternIn);
			playSequence(instName);
		break;
	};


	
};



function stopInstrument (instName) {
	// store all new items (before calling part)
	if (instruments[instName]!=null) {
		instruments[instName].sequence.stop();
		instruments[instName].isPlaying = false;
		// instruments[instName].synth.dispose();
	};
	renderInstruments();
};
function stopAllInstruments () {
	if (debugTone){console.log('Tone: stopAllInstruments: stopping all instruments!')};
	Object.keys(instruments).forEach((instName) => {
		instruments[instName].sequence.stop();		
		instruments[instName].isPlaying = false;
		// instruments[instName].synth.dispose();
	});
	// if (Tone.Transport.state!='stopped') {
	// 	Tone.Transport.stop();
	// };
	renderInstruments();
};
function playAllInstruments () {
	if (debugTone){console.log('Tone: playAllInstruments: playing all instruments!')};
	//Tone.Transport.start();
	now = Tone.now();
	let n = Tone.Transport.nextSubdivision('1n');
	// parseFloat("1.555").toFixed(2);
	// n = n.toFixed(0);
	if (debugTone){console.log('Tone: playAllInstruments: playing all instruments at Tone.now() + 0.01: ' + now)};
	if (debugTone){console.log('Tone: playAllInstruments: nextTickTime ' + n)};
	Object.keys(instruments).forEach((instName) => {
		if (instruments[instName].isPlaying==true){
			stopInstrument(instName);
		};
		// if (instruments[instName].isPlaying==false){
			instruments[instName].sequence.start().at(0);	
			instruments[instName].isPlaying = true;	
		// };
	});
	renderInstruments();
};

function copyPattern (instName, instArray) {
	// copy patterns
	if (instruments[instName]!=null) {
		for (let i=0;i<instArray.length;i++){
			let singleInst= instArray[i];
			if (instruments[singleInst]!=null){
				instruments[singleInst].pattern = instruments[instName].pattern;	
				playInstrument (singleInst, instruments[singleInst].pattern)		
			};
		};
	};
};
function setVolume(instName, vol) {
	if (instruments[instName]!=null) {
		let volume = vol;
		volume = vol * instrumentsList[instName].gain;
		instruments[instName].vol = volume;
		instrumentsList[instName].vol = volume; // update also the list, don't know why jet : )
		if (debugTone){console.log(`Tone: setVolume vol ${vol} * gain ${instrumentsList[instName].gain} to ${volume}`)};
		instruments[instName].synth.setVolume(volume);
	};
};
function setRandom(instName, rand) {
	if (instruments[instName]!=null) {
		instruments[instName].rand = rand;
	};
};
function setBPM(bpm, num) {
	if (num == '') {
		if (debugTone){console.log('Tone: setBPM: set bpm to ' + bpm)};
		thisBPM = bpm; 
		Tone.Transport.bpm.value = bpm;	
	} else {
		Tone.Transport.bpm.rampTo(bpm, num);
		if (debugTone){console.log('Tone: setBPM: set bpm to ' + bpm + ' in seconds: ' + num)};
	};
	
	
};



























// INSTRUMENTS & SEQUENCE
// ===================================================================

function updateInstrument (instName, pat, rand, newUrl) {
	if (debugTone){console.log('Tone: updateInstrument: Start Instrument Handling..')};

	// if instrument doesn't exists, create a new instrument: 
	if (instruments[instName]==null) {
		if (debugTone){console.log('Tone: updateInstrument: Instrument not exisiting - new Instrument()')};
		
		// create new instrument, based on stored params:
		let inst = new Instrument();


		// params taken from instrumentsList
		let instType = instrumentsList[instName].type;
		let defaultVol = instrumentsList[instName].vol * instrumentsList[instName].gain;
		let url = instrumentsList[instName].url;
		if (newUrl!=undefined){
			url = newUrl;
			if (debugTone){console.log('Tone: updateInstrument: assign new url = ' + url)};
		}
		let note = instrumentsList[instName].baseNote;

		

		// update the new Instrument:
		
		inst.setVolume(defaultVol);
		if (instrumentsList[instName].baseNote !=undefined) { inst.setBaseNote(note) };
		if (instrumentsList[instName].type == 'Sampler') 	{ 
			inst.updateSampleURL(url) 
			if (debugTone){console.log('Tone: updateInstrument: CHECK - sample URL = ' + url)};
		};

		inst.updateType(instType); 
		inst.connect(masterOut);
		

		if (debugTone){console.log('Tone: updateInstrument: CHECK - Tone.Transport.ticks = ' + Tone.Transport.ticks)};
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
	    }
	    if (debugTone){console.log(`Tone: updateInstrument:  New Instrument "${instName}" created!`)};
	    
	} else {
		// store new params in Instrument collection
		instruments[instName].rand = rand;
		instruments[instName].pattern = pat;
	};
    //return instruments[instName]
};


function updateSequence (instName, pat) {
	let inst = instruments[instName].synth; 
	let patAdapt = pat; //adaptPattern(pat);
	if (debugTone) {console.log(`Tone: updateSequence: create New Sequence: ${instName} with this pattern: `, patAdapt) };

	let setInst = function() {
  		instruments[instName].sequence = new Tone.Sequence(function(time, note){
  			// set note first
			note = inst.getBaseNote() + (note*10);	
			// console.log(`freq ${note}`);

			// set sequence:
			switch (instruments[instName].type) {
				case "MetalSynth":
					inst.synth.triggerAttackRelease("16n", '@8n');  // toggle @16n -->time
				break; 
				case "NoiseSynth":
					inst.synth.triggerAttackRelease("32n", '@8n');
				break; 
				case "FMSynth":
					inst.synth.triggerAttackRelease(note, "32n", '@8n', 0.8);
				break; 
				case "AMSynth":
					inst.synth.triggerAttackRelease(note, "8n", '@8n', 1);
				break; 
				case "PluckSynth":
					inst.synth.resonance.value = 0.1;
					inst.synth.dampening.value = 5000;
					inst.synth.triggerAttackRelease(note, "32n", '@8n');
					if (debugTone){console.log(`Tone: pattern PluckSynth, resonance: ${inst.synth.resonance.value}.. `)};

				break; 
				case "Sampler":
					inst.synth.triggerAttackRelease(note, "1n", '@8n');
				break; 
				default: 
					inst.synth.triggerAttackRelease(note, "32n", '@8n');
					// if (debugTone){console.log(`pattern synth, inst: ${inst}, instSynth: ${inst.synth}.. `)};
			};
			instruments[instName].ticks++;
			randInPattern (instName);
			
			
			// if (debugTone){console.log(`updateSequence: CHECK time: ${time},  Tone.Transport.ticks: ${Tone.Transport.ticks}, instrumentTicks: ${instruments[instName].ticks}`)};
		}, patAdapt, '8n');
  	};

	if (instruments[instName].sequence!= null) {
		if (debugTone) { console.log('Tone: updateSequence: Instrument Sequence existing, delete sequence..') };
  		instruments[instName].sequence.stop();
  		instruments[instName].sequence.dispose();
  		if (debugTone) { console.log('Tone: updateSequence: set new Sequence')};
  		setInst();
  	} else {
  		if (debugTone) { console.log('Tone: updateSequence: set new Sequence')};
  		setInst();
  	};
};



function randInPattern (instName) {
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






function playSequence (instName) {
	if (debugTone) { console.log('Tone: playSequence: play new Instrument sequence!')};
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



function adaptPattern (patAdapt) {
    for (let i=0;i<patAdapt.length;i++){
        if (patAdapt[i]==0) {
            patAdapt[i]=null
        }; 
    };
    return patAdapt;
};


// random helper, randomize patterns
function shuffleArray(array) {
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



























// PARTS
// ===================================================================

function savePart(name) {
	//console.log("save part under this name: ", name);
    savedParts[name] = {name: name};
    savedParts[name].instruments = {};
    // console.log("followinginst ar playing: "),
    Object.keys(instruments).forEach(key => {
        
            // console.log(instruments[key].name);
            var instName = instruments[key].name;
            var pattern = instruments[key].pattern;
            var sequence = instruments[key].sequence;
            var isPlaying = instruments[key].isPlaying;
            var rand = instruments[key].rand;
            var vol = instruments[key].vol;
            var url = instruments[key].url;
            // console.log(name, pattern, rand);
            savedParts[name].instruments[instName] = {
                name: instName,
                pattern: pattern,
                sequence: sequence,
                isPlaying: isPlaying,
                rand: rand,
                vol: vol,
                url: url,
            };
    });
    savedParts.bpm = thisBPM;
    renderParts();
    if (debugTone) { console.log('Tone: savePart: ' + JSON.stringify(savedParts))};

};

function setPart (name) {
	startTransport();
	if (savedParts.bpm != undefined) {
		setBPM(savedParts.bpm, '');        			
	};
	
	// check if part exists before settings
    var check = false;
    Object.keys(savedParts).forEach(key => {
        if (key == name) {
        	stopAllPartInstruments(name);
        	console.log('OUT stopall, save info: ' + JSON.stringify(savedParts[name].instruments));
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
		        if (savedParts[name].instruments[key].url!=undefined){
		        	stopInstrument(instName);
		    		delete instruments[instName];
		    	};

		        console.log('OUT playPartInstrument: ', instName, pattern, rand, isPlaying, url);
		        playPartInstrument (instName, pattern, rand, isPlaying, url);
		        // setVolume(instName, vol);	
	    	
		        
		    });
            check = true;
        };
    });
    if (!check) {
    	let printData = 'no such part ..';
		renderTextToConsole (false, 'local', printData, 'local');
		playAlerts('error', alertMuteState);
    };
};

function deleteElement (elements) {
	// check if element exists before settings
    var check = false;
    if (debugTone){console.log(`Tone: deleteElement: delete this: ${elements} ..`)};

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



function stopAllPartInstruments (newPart) {
	// console.log('stopping all instruments!');

	Object.keys(instruments).forEach((instName) => {
		// check if instrument doesn't exists in new part:
		if (savedParts[newPart].instruments[instName]==undefined){
			instruments[instName].sequence.stop(0);	
			instruments[instName].isPlaying = false;		
		};
	});
};

function playPartInstrument (instName, patternIn, rand, isPlaying, url) {
	//console.log('IN playPartInstrument: ', instName, patternIn, rand, isPlaying);
	updateInstrument(instName, patternIn, rand, url);
	updateSequence(instName, patternIn);	
	if (isPlaying == true){
		playSequence(instName);		
	};
};



function clearParts () {
	savedParts = {};
	renderParts();
};

function renderParts() {
	let partNames = [];	
    Object.keys(savedParts).forEach(key => {
    	// console.log("render saveParts[keys]: " + savedParts[key].name);
    	// if key = instrument, not BPM:
    	if (savedParts[key].name!=undefined){
    		let name = ': ' + savedParts[key].name + '&nbsp;&nbsp;&nbsp; ';
    		partNames.push(name);	
    	};
    	
    });
    

    if (debugTone){console.log(`Tone: renderParts: render parts to page..`)};
    renderOutputLine(partNames,'parts:', 100);
};


function handlePresetsInTone(action, data) {
	if (action == 'get') {
		savedParts.bpm = thisBPM;
		let parts = savedParts;
		return parts;
	};
	if (action == 'set') {
		savedParts = data;
		renderParts();
		// let c = 0;
		// Object.keys(savedParts).forEach(name => {
		// 	if (c==0) {
		// 		if (savedParts[name].bpm != undefined) {
	        			
	 //        	};
	 //        	c++;
		// 	};
		// });
	};
};


function renderInstruments() { 
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
    if (debugTone){console.log(`Tone: renderInstruments: render instruments to page..`)};
    renderOutputLine(instrumentNames,'instruments:', 100);
};

























export { transport, handlePresetsInTone } 