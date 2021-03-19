import { renderOutputLine } from '/html/renderHTML';
import { printer } from '/helper/printer';
import { debug, context, instruments } from '../tone/main-tone';



export function renderInstruments() {
	
	// collect all initialized instruments
	let instrumentNames = [];

	Object.keys(instruments).forEach(inst => {
		let newInstName = '';

		if (instruments[inst].isPlaying) {
			newInstName = '&nbsp;&nbsp;&nbsp;&nbsp;' + instruments[inst].name + '&nbsp;&nbsp;&nbsp; ';
		};

		if (instruments[inst].isPlaying == false) {
			newInstName = '&nbsp;X ' + instruments[inst].name + '&nbsp;&nbsp;&nbsp; ';
		};
		instrumentNames.push(newInstName);
	});

	printer(debug, context, "renderInstruments", `render all instruments and their playing-states to page`);

	renderOutputLine(instrumentNames, 'instruments:', 100);
}
;
