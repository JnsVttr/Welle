import Tone from 'tone';
import { alertMuteState } from '/index';
import { playAlerts } from '/helper/playAlerts';
import { printer } from '/helper/printer';
import { debug, context } from './main-tone';

export function muteAll(state) {
	printer(debug, context, "MuteAll", "")
	if (state) { Tone.Master.mute = true; playAlerts('return', alertMuteState); }
	if (state == false) { Tone.Master.mute = false; playAlerts('return', alertMuteState); }
}
;
