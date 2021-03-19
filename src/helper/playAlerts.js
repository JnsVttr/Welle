import { alerts } from '/helper/alerts';
import { printer } from '/helper/printer';
import { debug, context } from '/index';

export function playAlerts(name, alertMuteState) {
	printer(debug, context, "playAlerts", `name: ${name}, state: ${alertMuteState}`);
	if (alertMuteState == false) { alerts[name].alert.play(); };
}
;
