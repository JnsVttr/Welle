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
import { setDataURL, handlePresetsInTone } from '/tone/main-tone';
import { printer } from './helper/printer';
import { alerts } from './helper/alerts';
import { createAlerts } from './helper/createAlerts';
import { enterFunction } from './helper/enterFunction';
import { clearTextfield } from './helper/clearTextfield';
import { renderTextToConsole } from './helper/renderTextToConsole';
import { playAlerts } from './helper/playAlerts';


// global variables
export const debug = true;
export const context = "index";
export var socket = io.connect();   // socket var - server connect, also for exports
export let user = 'local';
export let soundMuteState = true;
export let alertMuteState = false;  // alerts muted or not?

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
	if (checkMuteAlerts.checked) {
		alertMuteState = true;
	} else {
		alertMuteState = false;
		playAlerts('return', alertMuteState);
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
		let result = enterFunction();
		let validState = false;

		if (result.valid == true) { 
			validState = true 
			consolePointer += 1;
			renderTextToConsole(validState, user, result.string, 'local')
			parseInput(result.result);

		} else {
			validState = false; 
			consolePointer += 1;
			let string = ""
			if (result.string != '!') { string = `! ${result.string}`; } 
				else { string = `${result.string}`; };
			renderTextToConsole(validState, user, string, 'local')
		};
		// printer(debug, context, "enter return?", `return: ${enterFunction()}, pointer: ${consolePointer}`);
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
});




export {  

}




