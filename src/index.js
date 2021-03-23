// WELLE - main index file //
// =============================================================

/*
https://github.com/harc/ohm

*/


// libraries
import io from 'socket.io-client';
import SocketIOFileClient from 'socket.io-file-client';

// files
import { renderHtmlArrows, renderBPM }  from  '/html/renderHTML';
import { parseInput }  from '/parse-commands';
import { help }  from '/text/helpText';
import { instruments, parts, thisBPM } from '/tone/main-tone';
import { update_InstrumentsList } from '/tone/update_InstrumentsList'
import { printer } from '/helper/printer';
import { alerts } from '/helper/alerts';
import { createAlerts } from '/helper/createAlerts';
import { enterFunction } from '/helper/enterFunction';
import { clearTextfield } from '/html/clearTextfield';
import { renderTextToConsole } from '/html/renderTextToConsole';
import { playAlerts } from '/helper/playAlerts';
import { requestServerFiles } from '/socket/requestServerFiles';
import { extractSamplePaths } from './helper/extractSamplePaths';
import { executeActionContent } from './helper/executeActionContent';
import { Instrument } from './tone/instruments';



// global variables
export const debug = true;
export const context = "index";
export var socket = io.connect();   // socket var - server connect, also for exports
export let user = 'local';
export let soundMuteState = true;
export let alertMuteState = false;  // alerts muted or not?
let serverFolders = "";
export let serverSamples = "";
export let sampleURL = {};
export let instrumentsList = "";

// input & console varibles
export let consolePointer = 0; // for arrow functions
export let consoleArray = [];   // arrays to store page console etc. output
export let consoleLength = 20; // how many lines are displayed

// html variables
let checkMuteSound = document.getElementById("checkMuteSound");
let checkMuteAlerts = document.getElementById("checkMuteAlerts");
let consoleDivID = 'console';
let actionContent = {
	'printToConsole': {},
	'parser': {},
};

// handle direct sound alerts
createAlerts(alerts);

// initially show BPM
renderBPM(thisBPM);




//  INstrument loader class




// interactive sound controls: muting sound / alerts
// =================================================================
// document.getElementById("checkMuteAlerts").checked = alertMuteState;

// checkMuteAlerts.onclick = function () {
// 	printer(debug, context, "onlick MuteAlerts", alertMuteState)
// 	if (checkMuteAlerts.checked) {
// 		alertMuteState = true;
// 	} else {
// 		playAlerts('return', alertMuteState);
// 		alertMuteState = false;
// 	};
// };
// checkMuteSound.onclick = function () {
// 	if (checkMuteSound.checked) {
// 		let val = 'mute on';
// 		organizeInput({string: val, user: user}); 
// 	} else {
// 		let val = 'mute off';
// 		organizeInput({string: val, user: user}); 
// 	};
// };














// manage text input & arrow input
// ===============================

document.getElementById("textarea").addEventListener("keydown", (e) => {
	
	

	// printer(debug, context, "key input", e.code);
	if (e.code=='Enter') {
		printer(debug, context, "", "");
		printer(debug, context, "", "");

		playAlerts('return', alertMuteState);
		consolePointer = -1; // pointer for arrwos

		// get input string
		let string = document.getElementById("textarea").value;
		string = string.toLowerCase();
		// message for server
		let message = { string: string, user: 'local' };

		// send string to validate in enterfunction(), grammar
		let result = enterFunction(string, instrumentsList);

		// handle returns from enterfunction()
		if (result.valid == true) { 
			// send to server via sockets
			socket.emit('clientEvent', message);
			// send results to parser for Tone
			actionContent.parser = parseInput(result.result, string);
		} else {
			printer(debug, context, "result.valid? : ", result.valid)
		};
		// add to consolePointer for arrows
		consolePointer += 1;
		// send to renderer
		actionContent.printToConsole.valid = result.valid;
		actionContent.printToConsole.string = result.string;
		actionContent.printToConsole.length = consoleLength;
		actionContent.printToConsole.id = consoleDivID;
		
		printer(debug, context, "actionContent: ", actionContent)
		// execute actionContent
		consoleArray = executeActionContent(actionContent, consoleArray, instruments, parts);
		// after processing, clear the input field
		clearTextfield();
	};


	// arrow functions
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

// initial request for samples on server
requestServerFiles ("samples");

// receive files via socket, assign them to global variables
socket.on("filesOnServer", function(folder, samples, what) {
	serverFolders = folder;
	serverSamples = samples;
	printer(debug, context, "filesOnServer - received", ` 
		folders: ${serverFolders} 
		files: ${serverSamples}`);
	sampleURL = extractSamplePaths (serverSamples);
	instrumentsList = update_InstrumentsList(); // create list
	Instrument.createList(sampleURL);

	// test class here:
	
	
	// console.log("Sound.style: ", Sound.soundStyle)
	// Sound.soundStyle = 'rock';
	// let party = new Sound("hard-style", 190);
	// console.log("party style: ", party.style, "Sound.style: ", Sound.soundStyle)
	
	
});










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
