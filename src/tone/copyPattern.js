import { printer } from '/helper/printer';
import { playInstrument } from './playInstrument';
import { instruments, debug, context } from './main-tone';

export function copyPattern (instName, instArray) {
	printer(debug, context, "copyPattern", `for ${instName}`);
	// copy patterns
	if (instruments[instName] != null) {
		for (let i = 0; i < instArray.length; i++) {
			let singleInst = instArray[i];
			if (instruments[singleInst] != null) {
				instruments[singleInst].pattern = instruments[instName].pattern;
				playInstrument(singleInst, instruments[singleInst].pattern);
			};
		};
	};
}
;
