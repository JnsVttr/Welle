import Tone from 'tone';
import { Instrument } from '/sound/instruments';
import { renderOutputLine }  from  '/html/renderHTML';
import { recorderDeal, handleForm, renderTextToConsole, checkDevice, playAlerts, alertState }  from '/index' ;


// test
let debugTone = true;
if (debugTone){console.log('-- ')};

console.clear();
var instruments = {};
var savedParts = {};
// master output
let masterOut = new Tone.Gain(0.9);
masterOut.toMaster();
// check device, ios is not allowd to load mediarecorder
let device = checkDevice();











// SAMPLER / SERVER FILES
// ========================================================

let soundDataURLs = {};
let sampleDefault;
let sampleURL = {default: ['../']};
let instrumentsList = {};




function update_InstrumentsList () {
	instrumentsList = {
		bass: 		{name: 'bass', 		type: 'PluckSynth', baseNote: 30, 	vol:0.4, url: sampleURL.default[0]	},
		drums: 		{name: 'drums', 	type: 'MembraneSynth',baseNote: 30, vol:0.4, url: sampleURL.default[0]	}, 
		snare: 		{name: 'snare', 	type: 'Sampler', 	baseNote: 30, 	vol:0.6, url: sampleURL.perc[0]	},
		fx: 		{name: 'fx', 		type: 'Sampler', 	baseNote: 30, 	vol:0.4, url: sampleURL.fx[0]	}, 
		string: 	{name: 'string', 	type: 'AMSynth', 	baseNote: 180, 	vol:0.6, url: sampleURL.default[0]	},
		pad: 		{name: 'pad', 		type: 'Synth', 		baseNote: 130, 	vol:0.4, url: sampleURL.default[0]	},
		kick: 		{name: 'kick', 		type: 'Sampler',	baseNote: 100, 	vol:0.7, url: sampleURL.kicks[0]		},
		noise: 		{name: 'noise', 	type: 'NoiseSynth', baseNote: 30, 	vol:0.4, url: sampleURL.default[0]	},
		duo: 		{name: 'duo', 		type: 'DuoSynth', 	baseNote: 60, 	vol:0.4, url: sampleURL.default[0]	},
		acid: 		{name: 'acid', 		type: 'MonoSynth', 	baseNote: 30, 	vol:0.07, url: sampleURL.default[0]	},
		hh: 		{name: 'hh', 		type: 'MetalSynth', baseNote: 30, 	vol:0.1, url: sampleURL.default[0]	},
		sampler1: 	{name: 'sampler1', 	type: 'Sampler', 	baseNote: 30, 	vol:0.4, url: sampleURL.bass[0]	},
	};
	console.log('update_InstrumentsList: default file URL = ' + sampleURL.default[0]);
};


function load_InstrumentsList () {
	// Object.keys(instrumentsList).forEach((inst, c) => {
	// 	let time = (c+1) * 20;
	// 	setTimeout(function(){
	// 		let name = instrumentsList[inst].name;
	// 		updateInstrument(name, [1], 0);
	// 		updateSequence(name, [1]);
	// 	}, time);		
	// });
};



// incoming data collection via socket.io, copied to 'soundDataURLs{}'
function setDataURL (data) {
	soundDataURLs = data;	

	console.log('data received at the clients Tone.js, stored in soundDataURLs, e.g. default: ' + soundDataURLs.default.shortURL);
	// console.log('soundDataURLs[default]: ' + soundDataURLs.default.files);
	
	// setting a default sample;
	sampleDefault = (soundDataURLs.default.shortURL + soundDataURLs.default.files[1]);
	// console.log('sampleDefault = files[0]: ' + sampleDefault);
	
	// generate URL data to local container
	Object.keys(soundDataURLs).forEach((folder) => {
		let count = soundDataURLs[folder].count;
		sampleURL[folder] = [];
		for (let i=0; i<count; i++) {
			let newURL = soundDataURLs[folder].shortURL + soundDataURLs[folder].files[i];
			// console.log(`newURL at sampleURL.${folder}[${i}] = ${newURL}`);
			sampleURL[folder].push(newURL)
		};
	});

	// important: UPDATE only arrives after connection to server
	update_InstrumentsList();
	load_InstrumentsList ();
};




	

// init Instrument/ Sampler
// ========================================================
function initInstrument(dest, source, num) {
	if (debugTone) {console.log('initInstrument: assign new sounds from: ' + source + '[' + num + '] ' + 'to ' + dest)};
	if (debugTone) {console.log('initInstrument: soundDataURLs there? ' + dest + ' at : ' + soundDataURLs[source].shortURL) };
	if (soundDataURLs[source].files[num] != undefined) {
		sampleURL[dest] = soundDataURLs[source].shortURL + soundDataURLs[source].files[num];
		if (debugTone) {console.log('initInstrument: Database: inst source changed to : ' + sampleURL[dest])};
		let inst = dest;
		if (debugTone) {console.log('initInstrument: Stop instrument: '+ inst + 'and remove from Instrument List')};
		stopInstrument(inst);
		delete instruments[inst];

		// delete from saved Parts, otherwise throws errors
		if (debugTone) {console.log('initInstrument: delete from saved Parts, otherwise throws errors for instrument: '+ inst)};
		Object.keys(savedParts).forEach(key => {
			if (debugTone) { console.log('initInstrument: savedParts: ' + key) };
			delete savedParts[key].instruments[dest];
	    });

	} else {
		let printData = 'Mp3 file not existing -- or \"' + source + '\"[ ] is no valid folder!';
		renderTextToConsole (false, 'local', printData, 'local');
		playAlerts('error', alertState);
		return false;
	}
	
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
		playAlerts('stop_recording', alertState);
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
Tone.Transport.bpm.value = 113;
Tone.context.latencyHint = 0.2;

function startTransport () {
	if (Tone.Transport.state=='stopped') {
		if (debugTone){console.log('startTransport: Tone.Transport State: ', Tone.Transport.state, ' --> starting Tone Transport..');};
		// Tone.Transport.ticks = 0;
		Tone.context.latencyHint = 'balanced';
		Tone.Transport.start(0);
		if (debugTone){ console.log('startTransport: Check Done: Tone.Transport State = ', Tone.Transport.state);}
	} else { 
		if (debugTone){console.log("startTransport: Tone is playing");}
	};
};


// translate incoming messages (parseInput) to sound functions:
function transport (cmd, instName, instArray, patternIn, rand, vol, bpm, name, num) {	
	console.log('');
	console.log('');
	if (debugTone) {console.log('transport: INCOMING transport (' , cmd , instName , instArray , patternIn , rand , vol , bpm , name , num , ')' );};

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
			setBPM(bpm)
		break;
		case 'savePart':
			savePart(name);
		break;
		case 'setPart':
			setPart(name);
		break;
		case 'deletePart':
			deletePart(name);
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
	if (debugTone){ console.log('muteAll: Transport: change mute state..') };
	if (state) {Tone.Master.mute = true;  playAlerts('return', alertState)}
	if (state == false ) {Tone.Master.mute = false; playAlerts('return', alertState)}
};


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
	  		if (debugTone) {console.log('ResetAction: instrument: ' + instruments[inst].name)};
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
	  	Tone.Transport.start();
	  	if (debugTone) {console.log('resetAction: Finished: Tone.Transport State = ', Tone.Transport.state)} ;
	}, 100);
};


function checkIfInstValid (instNameIncoming) {
	if (debugTone){ console.log('');};
	if (debugTone){ console.log('checkIfInstValid: check valid for this inst: ' + instNameIncoming);};
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
		playAlerts('error', alertState);
	};
	if (instAvailible == true) {
		if (debugTone){console.log('checkIfInstValid: found ' + instNameIncoming) };
		return instAvailible;
	};
	return instAvailible;
	if (debugTone){ console.log('');};
};
































// INSTRUMENTS - CONTROL
// ===================================================================


function playInstrument (instName, patternIn, rand) {
	if (debugTone){ console.log('playInstrument: playInstrument() at Tone', instName, patternIn, rand) };
	startTransport();
	
	let action = '';
	// checking
	if (instruments[instName]!=null) {
		// instrument exists
		if (debugTone){console.log('playInstrument: instrument exists!')};
		if (patternIn[0]===null) {
			// empty call => instrument & pattern exists, just play instrument
			if (instruments[instName].pattern!=null){
				if (debugTone){console.log(`playInstrument: empty call => instrument & pattern "${instruments[instName].pattern}" exists, just play instrument!`)};
				action = 'playInstrument'	
			};			
		};
		if (patternIn[0]!=null){
			// NON-empty call => instrument & pattern exists, assign new pattern to sequence
			if (debugTone){console.log(`playInstrument: NON-empty call => instrument & pattern exists, assign new pattern "${patternIn}" to sequence`)};
			action = 'assignNewPattern'
		}

	// instrument NOT exists & new pattern is empty
	} else {
		
		
		if (patternIn.length==1 && patternIn[0]===null){
			// change new pattern to [1] & create new instrument
			if (debugTone){console.log('playInstrument: instrument NOT exists & new pattern is empty')};
			action = 'createNewInstrumentPatternEmpty';
		} else {
			// new pattern is not empty, create new Instrument with new pattern
			if (debugTone){console.log('playInstrument: instrument NOT exists & new pattern is Not empty: ' + patternIn)};
			action = 'createNewInstrumentPatternNonEmpty';
		};
	};
	if (debugTone){console.log("playInstrument: incoming action: ", action, ' pattern: ', patternIn);};

	switch (action) {
		case "playInstrument":
			if (debugTone){console.log('playInstrument: play instrument without changes')};
			// just play it.. 
			playSequence(instName);
		break;
		case "assignNewPattern":
			if (debugTone){console.log('playInstrument: assign new pattern & play instrument')};
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand);
			updateSequence(instName, patternIn);
			playSequence(instName);
		break;
		case "createNewInstrumentPatternEmpty":
			if (debugTone){console.log('playInstrument: create new instrument w/ empty pattern')};
			patternIn = [1];
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand);
			updateSequence(instName, patternIn);
			playSequence(instName);
		break;
		case "createNewInstrumentPatternNonEmpty":
			if (debugTone){console.log('playInstrument: create new instrument w/ pattern')};
			patternIn = adaptPattern(patternIn);
			updateInstrument(instName, patternIn, rand);
			updateSequence(instName, patternIn);
			playSequence(instName);
		break;
	};


	
};



function stopInstrument (instName) {
	// store all new items (before calling part)
	if (instruments[instName]!=null) {
		instruments[instName].sequence.stop(0);
		instruments[instName].isPlaying = false;
		// instruments[instName].synth.dispose();
	};
};
function stopAllInstruments () {
	if (debugTone){console.log('stopAllInstruments: stopping all instruments!')};
	Object.keys(instruments).forEach((instName) => {
		instruments[instName].sequence.stop(0);		
		instruments[instName].isPlaying = false;
		// instruments[instName].synth.dispose();
	});
	// if (Tone.Transport.state!='stopped') {
	// 	Tone.Transport.stop();
	// };
};
function playAllInstruments () {
	if (debugTone){console.log('playAllInstruments: playing all instruments!')};
	//Tone.Transport.start();
	Object.keys(instruments).forEach((instName) => {
		instruments[instName].sequence.start(0);	
		instruments[instName].isPlaying = true;
	});
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
		instruments[instName].vol = vol;
		instruments[instName].synth.setVolume(vol);
	};
};
function setRandom(instName, rand) {
	if (instruments[instName]!=null) {
		instruments[instName].rand = rand;
	};
};
function setBPM(bpm) {
	// Tone.Transport.stop();
	// Tone.Transport.ticks = 0;
	
	// bpm = String(bpm);
	// if (debugTone){console.log('setBPM: bpm isInt? -->' + Number.isInteger(bpm))};
	// Tone.Transport.bpm.value = bpm;
	Tone.Transport.stop();
	Tone.Transport.clear();
	resetAction();
	setTimeout(function(){
		Tone.Transport.bpm.value = bpm;
		Tone.Transport.start('+1');
	}, 200);
};



























// INSTRUMENTS & SEQUENCE
// ===================================================================

function updateInstrument (instName, pat, rand) {
	if (debugTone){console.log('updateInstrument: Start Instrument Handling..')};

	// if instrument doesn't exists, create a new instrument: 
	if (instruments[instName]==null) {
		if (debugTone){console.log('updateInstrument: Instrument not exisiting - new Instrument()')};
		
		// create new instrument, based on stored params:
		let inst = new Instrument();


		// params taken from instrumentsList
		let instType = instrumentsList[instName].type;
		let defaultVol = instrumentsList[instName].vol;
		let url = instrumentsList[instName].url;
		let note = instrumentsList[instName].baseNote;

		

		// update the new Instrument:
		
		inst.setVolume(defaultVol);
		if (instrumentsList[instName].baseNote !=undefined) { inst.setBaseNote(note) };
		if (instrumentsList[instName].type == 'Sampler') 	{ 
			inst.updateSampleURL(url) 
			if (debugTone){console.log('updateInstrument: CHECK - sample URL = ' + url)};
		};

		inst.updateType(instType); 
		inst.connect(masterOut);
		

		if (debugTone){console.log('updateInstrument: CHECK - Tone.Transport.ticks = ' + Tone.Transport.ticks)};
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
	    if (debugTone){console.log(`updateInstrument:  New Instrument "${instName}" created!`)};
	    
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
	if (debugTone) {console.log(`updateSequence: create New Sequence: ${instName} with this pattern: `, patAdapt) };

	let setInst = function() {
  		instruments[instName].sequence = new Tone.Sequence(function(time, note){
  			// set note first
			note = inst.getBaseNote() + (note*10);	
			// console.log(`freq ${note}`);

			// set sequence:
			switch (instruments[instName].type) {
				case "MetalSynth":
					inst.synth.triggerAttackRelease("16n", '@16n');  // toggle @16n -->time
				break; 
				case "NoiseSynth":
					inst.synth.triggerAttackRelease("32n", '@16n');
				break; 
				case "FMSynth":
					inst.synth.triggerAttackRelease(note, "32n", '@16n', 0.8);
				break; 
				case "AMSynth":
					inst.synth.triggerAttackRelease(note, "8n", '@16n', 1);
				break; 
				case "PluckSynth":
					inst.synth.resonance.value = 0.1;
					inst.synth.dampening.value = 5000;
					inst.synth.triggerAttackRelease(note, "32n", '@16n');
					if (debugTone){console.log(`pattern PluckSynth, resonance: ${inst.synth.resonance.value}.. `)};

				break; 
				default: 
					inst.synth.triggerAttackRelease(note, "32n", '@16n');
					if (debugTone){console.log(`pattern synth, inst: ${inst}, instSynth: ${inst.synth}.. `)};
			};
			
			
			
			let ticks = instruments[instName].ticks++;
			let length = instruments[instName].pattern.length;
			let rand = instruments[instName].rand;
			let count = ticks % (length*rand);


			// random:
			if (rand>0) {
				if ((count+1) == length*rand){
					//console.log('execute random func now!');
					instruments[instName].randFunction()
				};	
			};
			// if (debugTone){console.log(`updateSequence: CHECK time: ${time},  Tone.Transport.ticks: ${Tone.Transport.ticks}, instrumentTicks: ${instruments[instName].ticks}`)};
		}, patAdapt, '16n');
  	};

	if (instruments[instName].sequence!= null) {
		if (debugTone) { console.log('updateSequence: Instrument Sequence existing, delete sequence..') };
  		instruments[instName].sequence.stop();
  		instruments[instName].sequence.dispose();
  		if (debugTone) { console.log('updateSequence: set new Sequence')};
  		setInst();
  	} else {
  		if (debugTone) { console.log('updateSequence: set new Sequence')};
  		setInst();
  	};
};

function playSequence (instName) {
	if (debugTone) { console.log('playSequence: play new Instrument sequence!')};
	if (instruments[instName].type == 'Sampler'){
		setTimeout(function(){
			instruments[instName].sequence.start(0);
			instruments[instName].isPlaying = true;		
		}, 200);
	} else {
		instruments[instName].sequence.start(0);
		instruments[instName].isPlaying = true;		
	}
	
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
            // console.log(name, pattern, rand);
            savedParts[name].instruments[instName] = {
                name: instName,
                pattern: pattern,
                sequence: sequence,
                isPlaying: isPlaying,
                rand: rand,
                vol: vol,
            };
        
    });
    renderParts();
};

function setPart (name) {
	// check if part exists before settings
    var check = false;
    Object.keys(savedParts).forEach(key => {
        if (key == name) {
        	stopAllPartInstruments();
        	
		    Object.keys(savedParts[name].instruments).forEach(key => {
		    	// check, if all instruments are availible
		    	
	    		//console.log("setPart for following instrument: ", key);
		        let instName = savedParts[name].instruments[key].name;
		        let pattern = savedParts[name].instruments[key].pattern;
		        let isPlaying = savedParts[name].instruments[key].isPlaying;
		        let rand = savedParts[name].instruments[key].rand;
		        let vol = savedParts[name].instruments[key].vol;
		        //console.log('OUT playPartInstrument: ', instName, pattern, rand, isPlaying);
		        playPartInstrument (instName, pattern, rand, isPlaying);
		        setVolume(instName, vol);	
	    	
		        
		    });
            check = true;
        };
    });
    if (!check) {console.log("no such part..")}
};

function deletePart (name) {
	// check if part exists before settings
    var check = false;
    Object.keys(savedParts).forEach(key => {
        if (key == name) {
        	delete savedParts[name];
        	renderParts();
            check = true;
        };
    });
    if (!check) {
    	console.log("no such part..");
    	let printData = 'no such part!';
		renderTextToConsole (false, 'local', printData, 'local');
		playAlerts('error', alertState);
    };
};



function stopAllPartInstruments () {
	// console.log('stopping all instruments!');
	Object.keys(instruments).forEach((instName) => {
			instruments[instName].sequence.stop(0);	
			instruments[instName].isPlaying = false;		
	});
};

function playPartInstrument (instName, patternIn, rand, isPlaying) {
	//console.log('IN playPartInstrument: ', instName, patternIn, rand, isPlaying);
	updateInstrument(instName, patternIn, rand);
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
	// console.log(`render saved parts: `, savedParts);
	
    Object.keys(savedParts).forEach(key => {
    	// console.log(savedParts[key].name);
    	let name = savedParts[key].name;
    	partNames.push(name);
    });
    // console.log(partNames);
    renderOutputLine(partNames,'parts-container', 100);
};



















































export { transport, setDataURL } 