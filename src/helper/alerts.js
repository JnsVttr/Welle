import { alerts, alertMuteState } from "/index";

export function playAlerts(name) {
    if (!alertMuteState) alerts[name].element.play();
}
export function createAlerts(alerts, alertFiles) {
    for (let entry in alertFiles) {
        alerts[entry] = {
            name: entry,
            src: alertFiles[entry].path,
        };
        alerts[entry].element = document.createElement("audio");
        alerts[entry].element.src = alerts[entry].src;
        alerts[entry].element.style.display = "none";
        alerts[entry].element.load();
    }

    return alerts;
}
