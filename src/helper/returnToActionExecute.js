// library
import Tone from 'tone';

// files
import { printer } from '/helper/printer';
import { debug, context, alertMuteState } from '../index';
import { renderToConsole, renderBPM } from '/html/renderHTML';
import { renderInstruments } from '/html/renderInstruments';
import { renderParts } from '/html/renderParts';
import { playAlerts } from '/helper/playAlerts';



export const returnToActionExecute = (_actionContent, _consoleArray, _instruments, _parts) => {
	// store returns in separate variables
	// let parserReturn = _actionContent.parser.parserReturn;
	let printToConsole = _actionContent.printToConsole;
	console.log("printToConsole: ", printToConsole)
	if (printToConsole != undefined ){
		// check if console string is valid, then print to console:
		if (printToConsole.valid == true){
			// if valid, add string to console stringarray
			_consoleArray.push({ message: `${printToConsole.string}` });
			// render to html console
			renderToConsole(_consoleArray, printToConsole.id, printToConsole.consoleLength);
		} else {
			// if not valid, prepend a '!' to string, store in console string array
			_consoleArray.push({ message: `! ${printToConsole.string}` });
			// render to html console
			renderToConsole(_consoleArray, printToConsole.id, printToConsole.consoleLength);
		}
	}
	
	
	

	// printer(debug, context, "executeActionContent printToConsole ", printToConsole);
	// printer(debug, context, "executeActionContent parserReturn ", parserReturn);
	// printer(debug, context, "executeActionContent toneReturn ", toneReturn);

	
	// handle returns from parser / tone
	// if (Object.keys(_actionContent.parser).length > 0) {
		
	// 	let toneReturn = _actionContent.parser.toneReturn;
	// 	if (toneReturn.error != ''){
	// 		// console:
	// 		let message = `${printToConsole.string} - ${toneReturn.error}`;
	// 		_consoleArray.push({ message: message });
	// 		renderToConsole(_consoleArray, printToConsole.id, printToConsole.consoleLength);
	// 		playAlerts('error', alertMuteState);
	// 	};
	// 	switch (toneReturn.html) {
	// 		case 'render instruments': renderInstruments(_instruments);
	// 		break;
	// 		case 'render parts': renderParts(_parts);
	// 		break;
	// 		case 'render bpm': renderBPM(Tone.Transport.bpm.value);
	// 		break;
	// 		case 'render muteOn': playAlerts('return', alertMuteState);
	// 		break;
	// 		case 'render muteOff': playAlerts('return', alertMuteState);
	// 		break;
	// 	}
	// };

	// return the changed console string array to index.js
	return _consoleArray;
};
