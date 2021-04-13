import * as Tone from "tone";

class WelleApp {
    debug = true;
    user = "local";
    alerts = {
        // enter: undefined,
        // return: undefined,
        // error: undefined,
    };
    bpm = 120;

    constructor() {
        if (this.debug)
            console.log(`
            Welle App created.
            debug state: ${this.debug}
            user: ${this.user}
            alerts: ${JSON.stringify(this.alerts)}

            Tone:
            bpm: ${this.bpm}
            `);
    }

    addAlert(alertContent) {
        const alertName = alertContent.name;
        this.alerts[alertName] = {};
        this.alerts[alertName].name = alertName;
        this.alerts[alertName].file = alertContent.file;
        this.alerts[alertName].path = alertContent.path;
        this.alerts[alertName].player = new Tone.Player(
            this.alerts[alertName].path
        ).toDestination();
        this.alerts[alertName].player.autostart = false;
    }
    printAlerts() {
        if (this.debug) {
            let allAlertNames = [];
            for (let i in this.alerts) allAlertNames.push(this.alerts[i].name);
            console.log(`printAlerts - all App alerts: ${allAlertNames}`);
        }
    }
    playAlert(alertName) {
        if (this.alerts[alertName]) this.alerts[alertName].player.start();
    }
}

export { WelleApp };
