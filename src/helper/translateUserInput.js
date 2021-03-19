import { livecode, semantics } from '/html/ohm/semantic';
import { renderTextToConsole } from '/html/renderTextToConsole';

export let translateUserInput = (data) => {
	let _user = data.user;
	let _string = data.string;
	let state = false;
	let result = "";

	// interpret data
	if (_string != '') {
		// printer(debug, context, "interpret string", `input string not empty. string: ${_string}`);
		// if input is not valid:
		if (livecode.match(_string).failed()) {
			state = 'failed';
			// printer(debug, context, "interpret string", "check failed");
		};
		// if input is valid
		if (livecode.match(_string).succeeded()) {
			// evaluate input through semantics
			result = semantics(livecode.match(_string)).eval();
			state = 'succeeded';
			// printer(debug, context, "interpret string", `check success, result: ${result}`);
		};
	};



	// parse data
	if (state == 'succeeded') {
		return result;
		// parseInput(message.result);
		// renderTextToConsole (true, _user, message.string, 'local');	
	};
	if (state == 'failed') {
		return null;
		// renderTextToConsole (false, _user, message.string, 'local');	
		// playAlerts('error', alertState);
	};
};
