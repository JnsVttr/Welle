import { renderToConsole } from '/html/renderHTML';
import { printer } from '/helper/printer';
import { debug, context } from '../index';

export const executeActionContent = (_actionContent) => {
	let parserReturn = _actionContent.parser.parserReturn;
	let printToConsole = _actionContent.printToConsole;
	let toneReturn = _actionContent.parser.toneReturn;

	printer(debug, context, "executeActionContent printToConsole ", printToConsole);
	printer(debug, context, "executeActionContent parserReturn ", parserReturn);
	printer(debug, context, "executeActionContent toneReturn ", toneReturn);

	// console:
	renderToConsole(printToConsole.content, printToConsole.id, printToConsole.consoleLength);

};
