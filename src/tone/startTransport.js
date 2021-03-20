import Tone from 'tone';
import { printer } from '/helper/printer';
import { debug, context } from './main-tone';

// clear console
// console.clear();
// TONE TRANSPORT
// =====================================================================
export function startTransport() {
	if (Tone.Transport.state == 'stopped') {
		let _now = Tone.now();
		Tone.context.latencyHint = 'balanced';
		Tone.Transport.start();
		return _now;
	} else {
		printer(debug, context, "startTransport", `Tone is playing`);
	};
}
;
