// WELLE - main index file //
// =============================================================

/*
https://github.com/harc/ohm

JS shorthand tipps: https://www.sitepoint.com/shorthand-javascript-techniques/
JSON online parser: https://jsonformatter.curiousconcept.com/

*/


// libraries
// ===================================
import io from 'socket.io-client';
import SocketIOFileClient from 'socket.io-file-client';
import * as Tone from 'tone';

// files
// ===================================
import { renderHtmlArrows, renderBPM }  from  '/html/renderHTML';
import { parser }  from '/parser';
import { help }  from '/text/helpText';
import { update_InstrumentsList } from '/tone/update_InstrumentsList'
import { printer } from '/helper/printer';
import { alerts } from '/helper/alerts';
import { createAlerts } from '/helper/createAlerts';
import { enterFunction } from '/helper/enterFunction';
import { playAlerts } from '/helper/playAlerts';
// import { requestServerFiles } from '/socket/requestServerFiles';
import { extractSamplePaths } from './helper/extractSamplePaths';
import { returnToActionExecute } from './helper/returnToActionExecute';
import { Instrument } from './tone/class_instrument';



// global variables
// ===================================
export const debug = true;
export const context = "index";
let socket = io.connect();   // socket var - server connect, also for exports
export let user = 'local';
export let soundMuteState = true;
export let alertMuteState = false;  // alerts muted or not?
let serverFolders = "";
export let serverSamples = "";
export let sampleURL = {};


// audio variables
// ===================================
export let bpm = 120;
export let instruments = {};
export let parts = {};
// list contains synths in presets and sample folders on server as instruments
// coming by sockets
let listOfInstruments = [];  
let listOfSamplers = [];  
let listOfAllAvailableInstruments = [];
// Tone Audio Buffer
const bufferDefault = new Tone.ToneAudioBuffer("/audio/kick/animal.mp3", () => {});



// input & console varibles
// ===================================
export let consolePointer = 0; // for arrow functions
export let consoleArray = [];   // arrays to store page console etc. output
export let consoleLength = 20; // how many lines are displayed
window.onload = function() { document.getElementById("mainInput").focus(); }

// html variables
// ===================================
let checkMuteSound = document.getElementById("checkMuteSound");
let checkMuteAlerts = document.getElementById("checkMuteAlerts");
let consoleDivID = 'console';


// actions
// ===================================
// handle direct sound alerts
createAlerts(alerts);
// initially show BPM
renderBPM(bpm);
// set static variables to class Instrument
Instrument.bpm = bpm;
Instrument.bufferDefault = bufferDefault;
// connect audio to Tone master
Instrument.masterGain.connect(Tone.getDestination());  // assign Instrument class masterOut to Tone master
Tone.Transport.bpm.value = bpm;








// const synth = new Tone.Synth().connect(Instrument.masterGain);
// const seq = new Tone.Sequence((time, note) => {
// 	synth.triggerAttackRelease(note, 0.1, time);
// 	// subdivisions are given as subarrays
// }, ["C4", ["E4", "D4", "E4"], "G4", ["A4", "G4"]]).start(0);
// // Tone.Transport.start();






// INPUT - manage text input & key interactions
// ============================================

document.getElementById("mainInput").addEventListener("keydown", (e) => {
	
	// set variable for returns from grammar, parser, tone
	let returnToAction = { printToConsole: {}, parser: {} };
	
	// if Enter in main input field
	if (e.code=='Enter') {
		// first time start Tone if not running
		// Tone.start();
		socket.emit('msg', 'Hello!');
		// console.log("TONE context started");
		// print empty spaces
		console.log('');
		console.log('');

		// POINTER - reset pointer for arrwos
		consolePointer = -1; 

		// INPUT - get input string
		let string = document.getElementById("mainInput").value.toLowerCase();
	
		// SERVER MESSAGE - create a message for server
		let message = { string: string, user: 'local' };

		// GRAMMAR - send string to validate in enterfunction() using semantics.js &  grammar.js
		let result = null;
		if (string!='') result = enterFunction(string, listOfAllAvailableInstruments);
		

		// SOCKET + PARSER
		// handle returns from enterfunction() for socket and parser
		// html handling goes through returnToAction list and rendering
		if (result == null ) {
			playAlerts('error', alertMuteState);
		}
		else if (result.valid == true) { 
			// send to server via sockets
			socket.emit('clientEvent', message);
			// send results to parser for Tone
			returnToAction.parser = parser(result.result);
			 
			// add to consolePointer for arrows
			consolePointer += 1;

			// GRAMMAR RESULTS - save results to return action list renderer
			returnToAction.printToConsole.valid = result.valid;
			returnToAction.printToConsole.string = result.string;
			returnToAction.printToConsole.length = consoleLength;
			returnToAction.printToConsole.id = consoleDivID;
			
			// play success return alert
			playAlerts('return', alertMuteState);
		} else {
			// if text input not valid:
			printer(debug, context, "result.valid? : ", result.valid);
			// play error alert
			playAlerts('error', alertMuteState);	
		};

		
		
		
		// print return list
		// printer(debug, context, "returnToAction list: ", returnToAction)

		// EXECUTE RETURN ACTIONS - execute returnToAction list and return new consoleArray
		consoleArray = returnToActionExecute(returnToAction, consoleArray, instruments, parts);

		// CLEAR - after processing, clear the input field
		document.getElementById("mainInput").value = "";
	};




	// KEY INTERACTIONS - arrow functions
	if (e.code=='ArrowUp'){
		// printer(debug, context, "text input", "arrow up pressed");
	   	consolePointer = renderHtmlArrows(consolePointer, consoleArray, 'up');
		playAlerts('return', alertMuteState);
	};
	if (e.code=='ArrowDown'){
		// printer(debug, context, "text input", "arrow down pressed");
		consolePointer = renderHtmlArrows(consolePointer, consoleArray, 'down');
		playAlerts('return', alertMuteState);
	};
	// if (e.code=='Digit1') {
	// 	requestServerFiles ("samples");
	// 	printer(debug, context, "request Server Files", `Index: socket send "requestServerFiles", 'samples'.. `)
	// }
});











// SOCKET HANDLING
// ======================
// SOCKET on initial connection
socket.on('connect', function (data) {
	console.log('Connected!');
	socket.emit('message', {message:"Hello!"});
	socket.emit('requestSampleFiles');
	socket.emit('requestTonePresets');
});
// SOCKET on receiving audioFile Paths
socket.on('audioFiles', (files) => {
	console.log('incoming server files: ', files);
	Instrument.files = files;
	for (let file in files) {
		console.log("sampleFolder: ", file); 
		listOfSamplers.push(file);
		listOfAllAvailableInstruments.push(file);
	};	
	console.log("listOfSamplers", listOfSamplers);
	console.log("listOfAllAvailableInstruments", listOfAllAvailableInstruments);
	Instrument.listSamplers = listOfSamplers;
});
// SOCKET receive tonePresets
socket.on('tonePresets', (presets) => {
	Instrument.presets = presets;
	// console.log('incoming presets: ', presets);
	for (let preset in presets) {
		listOfInstruments.push(preset);
		listOfAllAvailableInstruments.push(preset);
	};
	console.log("listOfInstruments", listOfInstruments);
	console.log("listOfAllAvailableInstruments", listOfAllAvailableInstruments);
	Instrument.list = listOfInstruments;
});






















// initial request for samples on server
// const requestServerFiles = (string) => {
// 	printer(debug, context, "requestServerFiles", "request sample paths from server...")
// 	socket.emit('requestServerFiles', string);
// }
// requestServerFiles ("samples");
// socket.emit('requestServerFiles', 'samples');
// // receive files via socket, assign them to global variables
// socket.on("filesOnServer", function(folder, samples, what) {
// 	serverFolders = folder;
// 	serverSamples = samples;
// 	printer(debug, context, "filesOnServer - received", ` 
// 		folders: ${serverFolders} 
// 		file paths: ${serverSamples}`);
// 	sampleURL = extractSamplePaths (serverSamples);
	
// 	// instrumentsList = update_InstrumentsList(); // create list
// 	// Instrument.createList(sampleURL);
// });










// ==================================================================
// EOF - index.js






// class Sound {
// 	static soundStyle = "techno";
// 	constructor(name, bpm) {
// 		this.name = name;
// 		this.bpm = bpm;
// 		this.isPlaying = false;
// 		this.style = 'default';
// 		console.log(`
// 		name: ${this.name}, 
// 		BPM:${this.bpm}, 
// 		style: ${this.style}
// 		Sound.style: ${Sound.soundStyle}`)
		
// 	}
// 	// static get soundStyle() {
// 	// 	// console.log(`log this: ${Sound.style}`);
// 	// 	return Sound.soundStyle;
// 	// }
// 	// static set soundStyle(style) {
// 	// 	this.style = style;
// 	// 	Sound.soundStyle = style;
// 	// }

	
	
// }



/*
overview keycodes

The available properties for KeyboardEvents are described on the linked page on MDN. They include:
https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

KeyboardEvent.altKey
KeyboardEvent.charCode (Deprecated)
KeyboardEvent.code
KeyboardEvent.ctrlKey
KeyboardEvent.isComposing
KeyboardEvent.key
KeyboardEvent.keyCode (Deprecated)
KeyboardEvent.location
KeyboardEvent.metaKey
KeyboardEvent.shiftKey
KeyboardEvent.which (Deprecated)

also a tester here:
https://css-tricks.com/snippets/javascript/javascript-keycodes/

*/
