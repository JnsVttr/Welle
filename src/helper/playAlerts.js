import { alerts } from '/helper/alerts';

export function playAlerts(name, alertMuteState) {
	if (alertMuteState == false) { alerts[name].alert.play(); };
}
;
