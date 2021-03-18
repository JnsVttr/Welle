import { instrumentsList, alertMuteState } from '/index';
import { renderTextToConsole } from '/helper/renderTextToConsole';
import { playAlerts } from '/helper/playAlerts';
import { printer } from '/helper/printer';
import { debug, context } from './main-tone';

export function checkIfInstValid(instNameIncoming) {
	// if (debugTone){ console.log('');};
	// if (debugTone){ console.log('Tone: checkIfInstValid: check valid for this inst: ' + instNameIncoming);};
	printer(debug, context, 'checkIfInstValid', `check valid for this inst: ${instNameIncoming}`);

	// check, if instrument is valid
	let instAvailible = false;

	Object.keys(instrumentsList).forEach((instName) => {
		// if (debugTone){console.log('checkIfInstValid: instrumentsList{} .name: ' + instrumentsList[instName].name + ' .type: ' + instrumentsList[instName].type);};
		if (instNameIncoming == instrumentsList[instName].name) {
			instAvailible = true;
		};
	});


	if (instAvailible == false) {
		let string = 'no such instrument ..';
		renderTextToConsole(false, 's', string, 'local');
		playAlerts('error', alertMuteState);
	};
	if (instAvailible == true) {
		// if (debugTone){console.log('Tone: checkIfInstValid: found ' + instNameIncoming) };
		printer(debug, context, 'checkIfInstValid', `found: ${instNameIncoming}`);
		return instAvailible;
	};
	return instAvailible;
}
;
