// files
import Tone from 'tone';
import { debug, context, alertMuteState } from '../index';

import { renderToConsole, renderBPM } from '/html/renderHTML';
import { renderInstruments } from '/html/renderInstruments';
import { renderParts } from '/html/renderParts';

import { printer } from '/helper/printer';
import { playAlerts } from '/helper/playAlerts';



export const executeActionContent = (_actionContent, _consoleArray, _instruments, _parts) => {
	let parserReturn = _actionContent.parser.parserReturn;
	let printToConsole = _actionContent.printToConsole;
	// console:
	if (printToConsole.valid == true){
		_consoleArray.push({ message: `${printToConsole.string}` });
		renderToConsole(_consoleArray, printToConsole.id, printToConsole.consoleLength);
	} else {
		_consoleArray.push({ message: `! ${printToConsole.string}` });
		renderToConsole(_consoleArray, printToConsole.id, printToConsole.consoleLength);
		playAlerts('error', alertMuteState);
	}
	
	

	// printer(debug, context, "executeActionContent printToConsole ", printToConsole);
	// printer(debug, context, "executeActionContent parserReturn ", parserReturn);
	// printer(debug, context, "executeActionContent toneReturn ", toneReturn);

	

	if (Object.keys(_actionContent.parser).length > 0) {
		
		let toneReturn = _actionContent.parser.toneReturn;
		if (toneReturn.error != ''){
			// console:
			let message = `${printToConsole.string} - ${toneReturn.error}`;
			_consoleArray.push({ message: message });
			renderToConsole(_consoleArray, printToConsole.id, printToConsole.consoleLength);
			playAlerts('error', alertMuteState);
		};
		switch (toneReturn.html) {
			case 'render instruments': renderInstruments(_instruments);
			break;
			case 'render parts': renderParts(_parts);
			break;
			case 'render bpm': renderBPM(Tone.Transport.bpm.value);
			break;
			case 'render muteOn': playAlerts('return', alertMuteState);
			break;
			case 'render muteOff': playAlerts('return', alertMuteState);
			break;
		}
	}
	
	
	
	
	

	return _consoleArray;
};
