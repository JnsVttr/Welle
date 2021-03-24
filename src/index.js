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
import { playAlerts } from '/helper/playAlerts';
import { requestServerFiles } from '/socket/requestServerFiles';
import { extractSamplePaths } from './helper/extractSamplePaths';
import { returnToActionExecute } from './helper/returnToActionExecute';
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
let returnToAction = {
	'printToConsole': {},
	'parser': {},
};

// handle direct sound alerts
createAlerts(alerts);

// initially show BPM
renderBPM(thisBPM);















// INPUT - manage text input & key interactions
// ============================================

document.getElementById("mainInput").addEventListener("keydown", (e) => {
	
	// if Enter in main input field
	if (e.code=='Enter') {
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
		let result = enterFunction(string, instrumentsList);


		// SOCKET + PARSER
		// handle returns from enterfunction() for socket and parser
		// html handling goes through returnToAction list and rendering
		if (result.valid == true) { 
			// send to server via sockets
			socket.emit('clientEvent', message);
			// send results to parser for Tone
			console.log(result.result)
			// returnToAction.parser = parseInput(result.result, string);
			
			// play success return alert
			playAlerts('return', alertMuteState);
		} else {
			// if text input not valid:
			printer(debug, context, "result.valid? : ", result.valid);
			// play error alert
			playAlerts('error', alertMuteState);	
		};

		
		// add to consolePointer for arrows
		consolePointer += 1;

		// GRAMMAR RESULTS - save results to return action list renderer
		returnToAction.printToConsole.valid = result.valid;
		returnToAction.printToConsole.string = result.string;
		returnToAction.printToConsole.length = consoleLength;
		returnToAction.printToConsole.id = consoleDivID;
		
		// print return list
		printer(debug, context, "returnToAction list: ", returnToAction)

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

});

















export function changeConsoleTextToNonValid(
	_renderHtml, _consoleArray, _consoleLength,
	state, string) {

	if (state == true) {
		_consoleArray.push({ message: string });
	};
	if (state == false) {
		if (string[0] != '!') { consoleArray.push({ message: `! ${string}` }); }
		else { consoleArray.push({ message: `${string}` }); };
	};
}
;




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
