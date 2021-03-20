import { renderHtml } from '/html/renderHTML';
import { consoleArray, consoleLength } from '/index';

export function renderTextToConsole(
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
