import * as Tone from "tone";
import { livecode, semantics } from "/html/ohm/semantic2021";
import { Instrument } from "/instrument";
import { parser } from "/parser";

// ============================================
// APP
// ============================================

class WelleApp {
    // debug
    debug = true;
    // general
    #user = "local";
    #muteSound = false;
    #muteAlerts = false;
    #alerts = {};
    #toneStarted = false;
    #bpm = 120;
    // console
    #consoleArray = [];
    #consolePointer = 0;
    #consoleMaxLength = 20;
    #consoleID = "console";
    // sound
    #instruments = {};
    #parts = {};
    #ListOfInstruments = [];
    #listOfSamples = [];
    #listOfAllInstruments = [];

    constructor() {
        if (this.debug)
            console.log(`
            Welle App created.
            ==
            debug state: ${this.debug}
            user: ${this.#user}
            alerts: ${JSON.stringify(this.#alerts)}
            muteSound: ${this.#muteSound}
            muteAlerts: ${this.#muteAlerts}

            Tone:
            bpm: ${this.#bpm}
            `);
        // set initial BPM and render to Page
        this.setBpm(this.#bpm);
        // connect audio to Tone master
        Instrument.masterGain.connect(Tone.getDestination()); // assign Instrument class masterOut to Tone master
    }

    // ============================================
    // handle main string input
    // ============================================
    handleMainInput(inputString) {
        if (this.debug) console.log("");
        // reset console pointer for arrow navigation
        this.#consolePointer = -1;
        // GRAMMAR - send string to validate using semantics & grammar
        const result = this.#inputValidation(inputString);
        console.log(`app handleMainInput Grammar result: ${JSON.stringify(result, null, 4)}`);
        // if Grammar valid:
        if (result.valid) {
            // check if result matches instruments and parts
            // ...
            // return semantic to parser
            parser(result.semantic);
            this.#consoleArray.push({ message: `${inputString}` });
            this.playAlert("return");
        } else {
            // if not valid, prepend a '!' to string, store in console string array
            this.#consoleArray.push({ message: `! input not valid: ${inputString}` });
            this.playAlert("error");
        }
        // clear Input
        document.getElementById("mainInput").value = "";
        // FOCUS - focus back on textfield
        document.getElementById("mainInput").focus();
        // render to Console
        this.renderConsole();
    }
    #inputValidation = (inputString) => {
        // if input is valid
        if (livecode.match(inputString).succeeded()) {
            // evaluate input through semantics
            const result = semantics(livecode.match(inputString)).eval();
            // if result valid in grammar, return result
            return { valid: true, string: inputString, semantic: result };
        }
        // if input is not valid:
        if (livecode.match(inputString).failed()) {
            return { valid: false, string: inputString, semantic: null };
        }
    };

    // ============================================
    // console
    // ============================================
    arrowUp() {
        // increment pointer, render html
        this.playAlert("return");
    }
    arrowDown() {
        // decrement pointer, render html
        this.playAlert("return");
    }
    renderConsole = () => {
        const length = this.#consoleArray.length;
        let html = "";
        let pointer = 0;
        if (length > this.#consoleMaxLength) pointer = length - this.#consoleMaxLength;
        for (let i = pointer; i < length; i++) {
            if (this.#user == "local") {
                html += '<p id="consoleLine">' + this.#consoleArray[i].message + "</p>";
            } else {
                html +=
                    '<p id="consoleLine"><b>' +
                    content[i].user +
                    ": &nbsp;&nbsp;</b>" +
                    content[i].message +
                    "</p>";
            }
        }
        // render array to div
        document.getElementById(this.#consoleID).innerHTML = "";
        document.getElementById(this.#consoleID).innerHTML += html;
    };

    // ============================================
    // general
    // ============================================
    get bpm() {
        return this.#bpm;
    }
    setBpm(bpm) {
        this.#bpm = parseInt(bpm);
        Tone.Transport.bpm.value = this.#bpm;
        document.getElementById("input_bpm").value = Math.floor(this.#bpm);
    }
    addSamples(sample) {
        this.#listOfSamples.push(sample);
        this.#listOfAllInstruments.push(sample);
    }
    addInstrument(preset) {
        this.#ListOfInstruments.push(preset);
        this.#listOfAllInstruments.push(preset);
    }
    printAllInstruments() {
        if (this.debug) {
            console.log(`App all instruments:
            ${this.#listOfAllInstruments}`);
            // for (let i in this.#listOfAllInstruments)
            //     console.log(`: ${this.#listOfAllInstruments[i]}`);
        }
    }

    // ============================================
    // handle first Tone start on keydown
    // ============================================
    async startTone() {
        if (this.#toneStarted == false) {
            await Tone.start();
            this.#toneStarted = true;
            console.log(">> App started Tone on first Keydown");

            // extremly relevant to stability of Tone playback
            Tone.context.lookAhead = 0.2;
        }
    }

    // ============================================
    // hande Alerts
    // ============================================
    addAlert(alertContent) {
        const alertName = alertContent.name;
        this.#alerts[alertName] = {};
        this.#alerts[alertName].name = alertName;
        this.#alerts[alertName].file = alertContent.file;
        this.#alerts[alertName].path = alertContent.path;
        this.#alerts[alertName].player = new Tone.Player(
            this.#alerts[alertName].path
        ).toDestination();
        this.#alerts[alertName].player.autostart = false;
    }
    printAlerts() {
        if (this.debug) {
            let allAlertNames = [];
            for (let i in this.#alerts) allAlertNames.push(this.#alerts[i].name);
            console.log(`App stored alerts: ${allAlertNames}`);
        }
    }
    playAlert(alertName) {
        if (this.#alerts[alertName]) this.#alerts[alertName].player.start();
    }
}

export { WelleApp };
