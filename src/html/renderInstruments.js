import { renderOutputLine } from '/html/renderHTML';
import { printer } from '/helper/printer';
import { debug, context, instruments } from '../tone/main-tone';



export function renderInstruments(_instruments) {
	
	// collect all initialized instruments
	let instrumentNames = [];

	Object.keys(_instruments).forEach(inst => {
		let newInstName = '';

		if (_instruments[inst].isPlaying) {
			newInstName = '&nbsp;&nbsp;&nbsp;&nbsp;' + _instruments[inst].name + '&nbsp;&nbsp;&nbsp; ';
		};

		if (_instruments[inst].isPlaying == false) {
			newInstName = '&nbsp;X ' + _instruments[inst].name + '&nbsp;&nbsp;&nbsp; ';
		};
		instrumentNames.push(newInstName);
	});

	renderOutputLine(instrumentNames, 'instruments:', 100);
}
;
