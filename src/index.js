// WELLE - main index file //
// =============================================================

/*
https://github.com/harc/ohm

*/


// libraries
import io from 'socket.io-client';
import SocketIOFileClient from 'socket.io-file-client';

// files
import { renderHtmlArrows, renderHtmlHelpMenu }  from  '/html/renderHTML';
import { parseInput }  from '/parse-commands';
import { help }  from '/text/helpText';
import { handlePresetsInTone } from '/tone/main-tone';
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

// handle direct sound alerts
createAlerts(alerts);











// interactive sound controls: muting sound / alerts
// =================================================================
document.getElementById("checkMuteAlerts").checked = alertMuteState;

checkMuteAlerts.onclick = function () {
	printer(debug, context, "onlick MuteAlerts", alertMuteState)
	if (checkMuteAlerts.checked) {
		alertMuteState = true;
	} else {
		playAlerts('return', alertMuteState);
		alertMuteState = false;
	};
};
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
		playAlerts('return', alertMuteState);
		consolePointer = -1; // pointer for arrwos

		// send string to validate in enterfunction(), grammar
		let result = enterFunction();
		let validState = false;

		// handle returns from enterfunction()
		if (result.valid == true) { 
			// if return is valid:
			validState = true;
			consolePointer += 1;
			// show text in console
			renderTextToConsole(validState, user, result.string, 'local')
			// send results to parser for Tone
			parseInput(result.result);

		} else {
			// if return is not valid:
			validState = false; 
			consolePointer += 1;
			let string = "";
			// prepend a '!' to the string
			if (result.string != '!') { string = `! ${result.string}`; } 
				else { string = `${result.string}`; };
			// show text in console
			renderTextToConsole(validState, user, string, 'local');
			// nothing to parse
		};
		
		// printer(debug, context, "enter return?", `return: ${enterFunction()}, pointer: ${consolePointer}`);

		// after processing, clear the input field
		clearTextfield();
	};


	// arrow functions
	if (e.code=='ArrowUp'){
		// printer(debug, context, "text input", "arrow up pressed");
	   	consolePointer = renderHtmlArrows(consolePointer, consoleArray, 'up', "textarea");
		playAlerts('return', alertMuteState);
	};
	if (e.code=='ArrowDown'){
		// printer(debug, context, "text input", "arrow down pressed");
		consolePointer = renderHtmlArrows(consolePointer, consoleArray, 'down', "textarea");
		playAlerts('return', alertMuteState);
	};
	if (e.code=='Digit1') {
		requestServerFiles ("samples");
		printer(debug, context, "request Server Files", `Index: socket send "requestServerFiles", 'samples'.. `)
	}
});









// SOCKET HANDLING

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
	instrumentsList = update_InstrumentsList(); 
});



































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
