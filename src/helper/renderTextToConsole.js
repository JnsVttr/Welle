import { renderHtml } from '/html/renderHTML';
import { consoleArray, consoleLength } from '../index';

export function renderTextToConsole(state, user, string, context) {
	if (context == 'local') {
		if (state == true) {
			consoleArray.push({ message: string });
			renderHtml(consoleArray, 'console', consoleLength);
		};
		if (state == false) {
			if (string[0] != '!') { consoleArray.push({ message: `! ${string}` }); }
			else { consoleArray.push({ message: `${string}` }); };
		};
	};
	if (context != 'local') {
		consoleArray.push({ user: user, message: string });
		renderHtml(consoleArray, 'console', consoleLength);
	};
	renderHtml(consoleArray, 'console', consoleLength);
}
;
