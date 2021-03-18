
import { translateUserInput } from './translateUserInput';
import { user, socket } from '../index';
// let context = enterFunction;

export let enterFunction = () => {
	// printer(debug, context, "text input", "ENTER pressed");
	// get text content
	// consolePointer = 0;
	let string = document.getElementById("textarea").value;
	string = string.toLowerCase();
	let inputData = { string: string, user: user };
    let result = "";

	// printer(debug, context, "text input ENTER pressed", `user "${user}", value: "${string}"`);

	if (user == 'local') {
		socket.emit('clientEvent', inputData);
		result = translateUserInput(inputData);
		// printer(debug, context, "check", `result: ${result}`);
	}
	// playAlerts('return', alertState);
    if (result != null) {return {valid: true,  string: string, result:result} }
    if (result == null) {return {valid: false, string: string, result:null}}
};
