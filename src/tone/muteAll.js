import Tone from 'tone';
import { alertMuteState } from '/index';
import { playAlerts } from '/helper/playAlerts';


export function muteAll(state) {
	if (state) { Tone.Master.mute = true; playAlerts('return', alertMuteState); }
	if (state == false) { Tone.Master.mute = false; playAlerts('return', alertMuteState); }
}
;
