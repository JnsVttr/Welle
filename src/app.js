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
    #consoleInput = "";
    #consoleArray = [];
    #consolePointer = 0;
    #consoleMaxLength = 20;
    #consoleID = "console";
    // sound
    #instruments = {};
    #parts = {};
    #ListOfInstruments = {};
    #listOfSamples = {};
    #listOfAllInstruments = {};

    constructor() {
        // print some info
        this.printInfo();
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
        this.#consolePointer = 0;
        this.#consoleInput = inputString;
        // GRAMMAR - send string to validate using semantics & grammar
        const result = this.#inputValidation(inputString);
        // console.log(`app handleMainInput Grammar result: ${JSON.stringify(result, null, 4)}`);

        // if Grammar valid:
        if (result.valid) {
            // check if result matches instruments and parts
            // ...
            // return semantic to parser
            this.addToConsole({ valid: true, string: inputString });
            parser(result.semantic);
        } else this.addToConsole({ valid: false, string: inputString });

        // clear Input
        document.getElementById("mainInput").value = "";
        // FOCUS - focus back on textfield
        document.getElementById("mainInput").focus();
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
        this.renderArrows("up");
        this.playAlert("return");
    }
    arrowDown() {
        // decrement pointer, render html
        this.renderArrows("down");
        this.playAlert("return");
    }
    renderArrows(dir) {
        const length = this.#consoleArray.length;
        // console.log(`App render arrows on array length ${length} with dir '${dir}'.
        // pointer: ${this.#consolePointer}
        // pos length - pointer: ${parseInt(length - this.#consolePointer)}
        // array: ${JSON.stringify(this.#consoleArray)}`);
        switch (dir) {
            case "up":
                if (length > 0 && this.#consolePointer < length) {
                    // set HTML
                    document.getElementById("mainInput").value = "";
                    document.getElementById("mainInput").value = this.#consoleArray[
                        length - 1 - this.#consolePointer
                    ].message;
                    // update pointer
                    if (this.#consolePointer < length) {
                        this.#consolePointer += 1;
                    }
                }
                break;
            case "down":
                if (this.#consolePointer > 0) {
                    // update pointer
                    this.#consolePointer -= 1;
                    // set HTML
                    document.getElementById("mainInput").value = "";
                    if (this.#consolePointer != 0) {
                        document.getElementById("mainInput").value = this.#consoleArray[
                            length - this.#consolePointer
                        ].message;
                    } else {
                        document.getElementById("mainInput").value = "";
                    }
                }
                break;
        }
    }
    addToConsole(message) {
        switch (message.valid) {
            case true:
                if (message.string == "") this.playAlert("return");
                else {
                    this.#consoleArray.push({ message: `${message.string}` });
                    this.playAlert("return");
                }
                break;
            case false:
                // if string is already false, play error, else render string
                if (message.string.charAt(0) == "!") this.playAlert("error");
                else {
                    // if not valid, prepend a '!' to string, store in console string array
                    let string = `! not valid: ${message.string}`;
                    if (message.comment) string = `! ${message.comment}: ${message.string}`;
                    this.#consoleArray.push({ message: string });
                    this.playAlert("error");
                }
                break;
        }
        // render to Console
        this.renderConsole();
    }
    renderConsole = () => {
        const length = this.#consoleArray.length;
        let html = "";
        let pointer = 0;
        if (length > this.#consoleMaxLength) pointer = length - this.#consoleMaxLength;
        for (let i = pointer; i < length; i++) {
            if (this.#user == "local") {
                html += `<p id="consoleLine">${this.#consoleArray[i].message}</p>`;
            } else {
                html += `<p id="consoleLine"><b>${this.#user}: &nbsp;&nbsp;</b> ${
                    this.#consoleArray[i].message
                }</p>`;
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
        this.#listOfSamples[sample.name] = sample;
        this.#listOfAllInstruments[sample.name] = sample;
    }
    addInstrument(preset) {
        this.#ListOfInstruments[preset.name] = preset;
        this.#listOfAllInstruments[preset.name] = preset;
    }
    printAllInstruments() {
        if (this.debug) {
            console.log(`App all instruments:`);
            for (let i in this.#listOfAllInstruments)
                console.log(`: ${this.#listOfAllInstruments[i].name}`);
            // console.log(`Details: ${JSON.stringify(this.#listOfAllInstruments, null, 0)}`);
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
    startTransport(time) {
        if (Tone.Transport.state != "started") Tone.Transport.start();
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

    // ============================================
    // print start info
    // ============================================
    printInfo() {
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
    }
    // ============================================
    // Tone - plainStartInstruments
    // ============================================
    plainStartInstruments(message) {
        console.log(`plainStartInstruments. message: ${JSON.stringify(message)}`);
        // check if instruments are valid
        const validInstruments = this.checkValidInstruments(message.instruments);
        // collect existing instruments
        const existingInstruments = this.checkExistingInstruments(validInstruments);
        // collect new instruments
        const newInstruments = this.checkNewInstruments(validInstruments);
        console.log(`Existing: ${existingInstruments} New: ${newInstruments}`);

        newInstruments.map((inst) => {
            message.name = inst;
            this.createNewInstrument(message);
        });

        this.startTransport();
    }
    checkValidInstruments(instruments) {
        // check if internal instrument list contains the instruments
        const validInstruments = instruments.map((inst) => {
            console.log(`Valid? check inst: ${inst} > ${this.#listOfAllInstruments[inst]}`);
            if (this.#listOfAllInstruments[inst]) return inst;
            else this.addToConsole({ valid: false, string: inst, comment: "no such instrument" });
        });
        console.log(`vaild instruments: ${validInstruments}`);
        return validInstruments;
    }
    checkExistingInstruments(instruments) {
        const existingInstruments = instruments.map((inst) => {
            if (this.#instruments[inst]) return inst;
        });
        return existingInstruments;
    }
    checkNewInstruments(instruments) {
        const newInstruments = instruments.map((inst) => {
            if (!this.#instruments[inst]) return inst;
        });
        return newInstruments;
    }
    createNewInstrument(message) {
        if (this.#listOfSamples[message.name]) {
            message.type = "sampler";
            message.sample = this.#listOfSamples[message.name];
            message.preset = this.#ListOfInstruments["sampler"].preset;
        }
        if (this.#ListOfInstruments[message.name]) {
            message.type = "preset";
            message.preset = this.#ListOfInstruments[message.name].preset;
        }
        console.log(`create new inst as '${message.type}'`);
        this.#instruments[message.name] = new Instrument(message);
        // if (message.random != null) this.#instruments[inst].random = message.random;
    }
}

export { WelleApp };
