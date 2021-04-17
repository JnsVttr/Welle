import * as Tone from "tone";
import { livecode, semantics } from "/html/ohm/semantic2021";
import { Instrument } from "/instrument";
import { parser } from "/parser";

// ============================================
// WELLE APP
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
    #consolePointer = 0;
    #consoleMaxLength = 14;
    #consoleArray = Array(this.#consoleMaxLength).fill({ message: "&nbsp;" });
    #consoleID = "console";
    // sound
    #instruments = {};
    #parts = {};
    #ListOfInstruments = {};
    #listOfSamples = {};
    #listOfAllInstruments = {};
    // html
    #instDiv = "instruments";
    #partDiv = "parts";
    #bpmDiv = "input_bpm";
    #instListDiv = "listOfInstruments";

    //
    //
    //
    //
    //
    //
    //
    //

    constructor() {
        // print some info
        this.printInfo();
        // set initial BPM and render to Page
        this.setBpm({ bpm: this.#bpm });
        // connect audio to Tone master - assign Instrument class masterOut to Tone master
        Instrument.masterGain.connect(Tone.getDestination());
        this.renderConsole();
    }

    //
    //
    //
    //
    //
    //
    //
    //

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

    //
    //
    //
    //
    //
    //
    //
    //

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

    //
    //
    //
    //
    //
    //
    //
    //

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

    //
    //
    //
    //
    //
    //
    //
    //

    // ============================================
    // general
    // ============================================
    addSamples(files) {
        files.map((file) => {
            const name = file.split(".")[0];
            const path = `/audio/${file}`;
            const content = { name: name, file: file, path: path };
            // console.log(`App incoming sample file: ${file}, name: ${name}, path: ${path}`);
            this.#listOfSamples[name] = content;
            Instrument.buffers[name] = new Tone.ToneAudioBuffer(path, () => {
                // console.log(`new Tone Buffer for ${name} loaded..`);
            });
            this.#listOfAllInstruments[name] = content;
        });
    }

    addInstruments(presets) {
        for (let preset in presets) {
            const name = preset;
            const fullPreset = { name: name, preset: presets[preset] };
            // if (this.debug)
            //     console.log(`
            // incoming preset name:  ${name}
            // preset: ${JSON.stringify(fullPreset)}
            // `);
            this.#ListOfInstruments[name] = fullPreset;
            this.#listOfAllInstruments[name] = fullPreset;
        }
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
    // hande Alerts
    // ============================================
    addAlerts(files) {
        files.map((file) => {
            const name = file.split(".")[0];
            const path = `/alerts/${file}`;
            const content = { name: name, file: file, path: path };
            // console.log(`App incoming sample file: ${file}, name: ${name}, path: ${path}`);
            this.#alerts[name] = content;
            this.#alerts[name].player = new Tone.Player(this.#alerts[name].path).toDestination();
            this.#alerts[name].player.autostart = false;
        });
    }
    printAlerts() {
        if (this.debug) {
            Object.keys(this.#alerts).forEach((alert) => {
                // console.log(`App stored alerts: ${alert}`);
            });
            // let allAlertNames = [];
            // for (let i in this.#alerts) allAlertNames.push(this.#alerts[i].name);
            // console.log(`App stored alerts: ${allAlertNames}`);
        }
    }
    playAlert(alertName) {
        if (this.#alerts[alertName]) this.#alerts[alertName].player.start();
    }

    //
    //
    //
    //
    //
    //
    //
    //

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
        if (time) {
            if (Tone.Transport.state != "started") Tone.Transport.start(time);
        } else {
            if (Tone.Transport.state != "started") Tone.Transport.start();
        }
    }
    stopTransport(time) {
        if (time) {
            if (Tone.Transport.state != "stopped") Tone.Transport.stop(time);
        } else {
            if (Tone.Transport.state != "stopped") Tone.Transport.stop();
        }
    }

    //
    //
    //
    //
    //
    //
    //
    //

    //
    //
    //
    //
    //
    //
    //
    //

    //
    //
    //
    //
    //
    //
    //
    //

    // ============================================
    // Tone - plainStartInstruments
    // ============================================

    setBpm(message) {
        const bpm = Math.min(240, Math.max(1, message.bpm));
        // if (this.debug) console.log(`BPM math bpm: ${message.bpm}, limit Bpm: ${bpm}`);
        this.#bpm = bpm;
        // if Transport running
        if (Tone.Transport.state == "started") {
            if (message.factor) Tone.Transport.bpm.rampTo(bpm, message.factor);
            else Tone.Transport.bpm.rampTo(bpm, 0.1);
        }
        this.renderContent();
    }

    // ============================================

    setVolume(message) {
        // checks for instruments
        const checks = this.checkInstruments(message.instruments);
        if (checks.existingInstruments) {
            checks.existingInstruments.map((instrument) => {
                this.#instruments[instrument].setVolume(message.volume);
            });
        }
        this.renderContent();
    }

    // ============================================

    stopInstruments(instruments) {
        // checks for instruments
        const checks = this.checkInstruments(instruments);
        if (checks.existingInstruments) {
            checks.existingInstruments.map((instrument) => {
                this.#instruments[instrument].stop();
                // console.log(
                //     `show stopped instruments: ${instrument}, isPlaying: ${
                //         this.#instruments[instrument].isPlaying
                //     }`
                // );
            });
        }
        // stop Tone if nothing is playing anymore
        let nothingIsPlaying = true;
        Object.keys(this.#instruments).forEach((instrument) => {
            if (this.#instruments[instrument].isPlaying) nothingIsPlaying = false;
        });
        if (nothingIsPlaying) this.stopTransport();
        this.renderContent();
    }

    // ============================================

    playOnce(inst) {
        // if inst is sample
        if (this.#listOfSamples[inst]) {
            console.log(`playOnce is sample.. `);
            // Instrument.buffers[inst].play;
            const player = new Tone.Player().toDestination();
            // play one of the samples when they all load
            player.buffer = Instrument.buffers[inst].get("C3");
            player.volume.value = -12;
            player.start();
        }
        if (this.#ListOfInstruments[inst]) {
            console.log(`playOnce is instrument .. `);
            const preset = this.#ListOfInstruments[inst].preset;
            const type = preset.synthType;
            const baseNote = preset.baseNote;
            const settings = preset.settings;
            const synth = new Tone[type](settings).toDestination();
            synth.volume.value = -12;
            synth.triggerAttackRelease(baseNote, "8n");
        }
    }

    playAll() {
        // store quant time
        const timeDiff = this.toneQuant() * 1000;
        // set timeout for restart in sync (more or less)
        setTimeout(() => {
            // cancel all future jobs, clear Tone transport, stop it & start it in quant time
            Tone.Transport.cancel();
            Tone.Transport.clear();
            // stop if started
            this.stopTransport();
            // restart all instruments in sync
            Object.keys(this.#instruments).forEach((instrument) => {
                this.#instruments[instrument].restart();
            });
            // start
            this.startTransport();
            this.renderContent();
        }, timeDiff);
    }

    // ============================================

    stopAll() {
        Object.keys(this.#instruments).forEach((instrument) => {
            this.#instruments[instrument].stop();
        });
        this.renderContent();
    }

    // ============================================

    copyPattern(message) {
        // checks for instruments - extract source
        const checks = this.checkInstruments(message.source);
        let source = undefined;
        if (checks.existingInstruments) source = checks.existingInstruments[0];

        // if source exists
        if (source) {
            // checks for destinations
            const destChecks = this.checkInstruments(message.destinations);
            const pattern = this.#instruments[source].getPattern();
            const rawPattern = this.#instruments[source].getRawPattern();
            if (destChecks.existingInstruments)
                destChecks.existingInstruments.map((instrument) => {
                    this.#instruments[instrument].setPattern(pattern, rawPattern);
                    // this.#instruments[source].restart();
                });
            if (destChecks.newInstruments)
                destChecks.newInstruments.map((instrument) => {
                    message.name = instrument;
                    message.pattern = pattern;
                    message.rawPattern = rawPattern;
                    this.createNewInstrument(message);
                    // this.#instruments[source].restart();
                });
        }
        // restart all with quant
        this.playAll();
        this.renderContent();
    }

    // ============================================

    assignPattern(message) {
        // if (this.debug) console.log(`assignPattern. message: ${JSON.stringify(message)}`);
        // checks for instruments
        const checks = this.checkInstruments(message.instruments);
        // if there are new instruments, create them
        if (checks.newInstruments)
            checks.newInstruments.map((inst) => {
                message.name = inst;
                this.createNewInstrument(message);
            });
        if (checks.existingInstruments)
            checks.existingInstruments.map((instrument) => {
                this.#instruments[instrument].setPattern(message.pattern, message.rawPattern);
                if (message.random) this.#instruments[instrument].random = message.random;
                if (message.volume) this.#instruments[instrument].setVolume(message.volume);
            });
        this.startTransport();
        this.renderContent();
    }

    // ============================================

    plainStartInstruments(message) {
        // if (this.debug) console.log(`plainStartInstruments. message: ${JSON.stringify(message)}`);

        let isPart = false;
        const partName = message.instruments[0];
        // check for parts if only one instrument
        if (message.instruments.length == 1) {
            if (this.#parts[partName]) {
                // console.log(`part ${partName} detected`);
                isPart = true;
            }
        }
        if (isPart) {
            this.startPart(partName);
        } else {
            // checks for instruments
            const checks = this.checkInstruments(message.instruments);
            // if there are new instruments, create them
            if (checks.newInstruments)
                checks.newInstruments.map((inst) => {
                    message.name = inst;
                    this.createNewInstrument(message);
                });
            // if existing, start them
            if (checks.existingInstruments)
                checks.existingInstruments.map((instrument) => {
                    this.#instruments[instrument].restart();
                    if (message.random != null)
                        this.#instruments[instrument].random = message.random;
                });

            this.startTransport();
        }
        this.renderContent();
    }

    // ============================================

    startPart(name) {
        // STOP - clear all instruments
        for (let instrument in this.#instruments) {
            this.#instruments[instrument].clear();
        }
        // TONE - handle tone. is best to restart tone
        // store quant time
        let timeDiff = this.toneQuant() * 1000;
        // set timeout for restart in sync (more or less)
        setTimeout(() => {
            // cancel all future jobs, clear Tone transport, stop it & start it in quant time
            Tone.Transport.cancel();
            Tone.Transport.clear();
            // stop if started
            this.stopTransport();

            // CHECK & RESTART
            for (let instrument in this.#parts[name].instrumentCollection) {
                // console.log(`check & restart process for instrument ${instrument}`);
                const pattern = this.#parts[name].instrumentCollection[instrument].pattern;
                const rawPattern = this.#parts[name].instrumentCollection[instrument].rawPattern;
                const volume = this.#parts[name].instrumentCollection[instrument].volume;
                const random = this.#parts[name].instrumentCollection[instrument].random;

                // console.log(`
                //         Part ${name} restart instrument ${instrument}
                //         with:
                //         pattern ${pattern}
                //         rawPattern ${rawPattern}
                //         volume: ${volume}
                //         random: ${random}
                //         `);
                // check if saved part instrument exists in instruments
                if (this.#instruments[instrument]) {
                    // console.log(`instrument ${instrument} exists in 'instruments'`);
                    // restart instrument, if it was playing in part
                    if (this.#parts[name].instrumentCollection[instrument].isPlaying) {
                        // prepare instrument:
                        this.#instruments[instrument].random = random;
                        this.#instruments[instrument].setPattern(pattern, rawPattern);
                        this.#instruments[instrument].setVolume(volume);
                        this.#instruments[instrument].restart();
                    }
                } else {
                    // if saved instrument does not exists (e.g. deleted or not initialized)
                    // then restart?
                    // console.log(`play part ${name}: instrument ${instrument} is gone. create new!`);
                    this.createNewInstrument({
                        name: instrument,
                        pattern: pattern,
                        rawPattern: rawPattern,
                        random: random,
                        volume: volume,
                        type: "sampler",
                    });
                }
            }

            // start Tone Transport
            this.startTransport();
            this.renderContent();

            // console.log(`now Tone.now ${Tone.now()} started after offset: ${timeDiff}`);
        }, timeDiff);

        // BPM change
        this.setBpm({ bpm: this.#parts[name].bpm });
    }

    savePart(name) {
        // console.log(`save new part : ${name}`);
        // check if name is reserved as instrument
        if (this.#listOfAllInstruments[name]) {
            // if (this.debug) console.log(`part name ${name} is reserved as instrument`);
            this.addToConsole({
                valid: false,
                string: name,
                comment: "name reserved as instrument",
            });
        } else {
            // init new part
            this.#parts[name] = {
                instrumentCollection: {},
                bpm: this.#bpm,
            };
            // store instruments and their playState in the part
            Object.keys(this.#instruments).forEach((instrument) => {
                this.#parts[name].instrumentCollection[instrument] = {
                    isPlaying: this.#instruments[instrument].isPlaying,
                    pattern: this.#instruments[instrument].getPattern(),
                    rawPattern: this.#instruments[instrument].getRawPattern(),
                    volume: this.#instruments[instrument].getVolume(),
                    random: this.#instruments[instrument].random,
                };
            });
            console.log(`part ${name} saved in parts`, this.#parts[name]);
        }
        this.renderContent();
    }

    // ============================================

    // check instruments
    checkInstruments(instruments) {
        let returnMessage = {
            validInstruments: undefined,
            existingInstruments: undefined,
            newInstruments: undefined,
        };
        // check if instruments are valid
        const validInstruments = this.checkValidInstruments(instruments);

        if (validInstruments) {
            returnMessage.validInstruments = validInstruments;
            // collect existing instruments
            const existingInstruments = this.checkExistingInstruments(validInstruments);
            if (existingInstruments) returnMessage.existingInstruments = existingInstruments;
            // collect new instruments
            const newInstruments = this.checkNewInstruments(validInstruments);
            if (newInstruments) returnMessage.newInstruments = newInstruments;
            // if (this.debug) console.log(`Existing: ${existingInstruments}  New: ${newInstruments}`);
        }
        // if (this.debug)
        //     console.log(`returnMessage checkInstruments: ${JSON.stringify(returnMessage)}`);
        return returnMessage;
    }

    checkValidInstruments(instruments) {
        // check if internal instrument list contains the instruments
        const validInstruments = instruments.map((inst) => {
            // if (this.debug)
            //     console.log(
            //         `Valid? check inst: ${inst} in list ${this.#listOfAllInstruments[inst]}`
            //     );
            if (this.#listOfAllInstruments[inst]) return inst;
            else this.addToConsole({ valid: false, string: inst, comment: "no such instrument" });
        });
        // if (this.debug)
        //     console.log(
        //         `vaild instruments: ${validInstruments}. Count: ${validInstruments.length}`
        //     );
        // filter null entries
        const result = validInstruments.filter((x) => x);
        if (result.length > 0) return result;
        else return undefined;
    }

    checkExistingInstruments(instruments) {
        const existingInstruments = instruments.map((inst) => {
            if (this.#instruments[inst]) return inst;
        });
        // filter null entries
        const result = existingInstruments.filter((x) => x);
        if (result.length > 0) return result;
        else return undefined;
    }

    checkNewInstruments(instruments) {
        const newInstruments = instruments.map((inst) => {
            if (!this.#instruments[inst]) return inst;
        });
        // filter null entries
        const result = newInstruments.filter((x) => x);
        if (result.length > 0) return result;
        else return undefined;
    }

    createNewInstrument(message) {
        if (this.#listOfSamples[message.name]) {
            message.type = "sampler";
            message.sample = this.#listOfSamples[message.name];
        }
        if (this.#ListOfInstruments[message.name]) {
            message.type = "preset";
            message.preset = this.#ListOfInstruments[message.name].preset;
        }
        if (this.debug) console.log(`create new inst ${message.name} as '${message.type}'`);
        this.#instruments[message.name] = new Instrument(message);
    }

    //
    //
    //
    //
    //
    //
    //
    //

    // ============================================
    // Tone - delete things
    // ============================================

    delete(names) {
        console.log(`delete this: ${names}`);
        names.map((name) => {
            if (this.#parts[name]) {
                delete this.#parts[name];
                // console.log(`delete this part: ${name}`);
            }
            if (this.#instruments[name]) {
                // console.log(`delete this instrument: ${name}`);
                this.#instruments[name].clear();
                delete this.#instruments[name];
                window.document.getElementById(`inst_${name}`).remove();
            }
        });
        this.renderContent();
    }

    deleteAll() {
        console.log(`App delete all..`);
        // clear & delete every instrument
        for (let instrument in this.#instruments) {
            // console.log(`delete this instrument: ${instrument}`);
            this.#instruments[instrument].clear();
            delete this.#instruments[instrument];
            window.document.getElementById(`inst_${instrument}`).remove();
        }
        // delete all parts
        for (let part in this.#parts) {
            // console.log(`delete this part: ${part}`);
            delete this.#parts[part];
        }
        // stop Tone
        this.stopTransport();
        Tone.Transport.cancel();
        Tone.Transport.clear();
        this.renderContent();
    }

    //
    //
    //
    //
    //
    //
    //
    //

    //
    //
    //
    //
    //
    //
    //
    //

    // ============================================
    // Tone - helper QUANT
    // ============================================
    toneQuant = () => {
        // get time
        const now = Tone.TransportTime().valueOf();
        // set quantize factor
        let factor = 1;
        let factorOffset = 0.5;
        // get quant time
        const quant = Tone.Time(now).quantize(factor);
        let playTime = quant;
        let timeDifference = 0;
        // if (this.debug) console.log(`Tone.now(): ${now}. quant: ${quant}`);
        // if transport starts, set quant to 0
        if (quant < now) {
            playTime = now + factorOffset;
            playTime = Tone.Time(playTime).quantize(factor);
            timeDifference = playTime - now;
            // console.log("quant < now. new calc: ", `now: ${now}, playTime: ${playTime}. quant factor: ${factor}. quant: ${quant}`)
        } else timeDifference = quant - now;

        if (now == 0) {
            playTime = 0;
            timeDifference = 0;
        } else if (now >= 0 && now <= 0.01) {
            playTime = 0.01;
            timeDifference = playTime;
        }
        // safety: if below 0 than playTime is zero
        if (playTime < 0) playTime = 0;
        if (timeDifference < 0) timeDifference = 0;
        //     console.log(`
        // quant Tone.TransportTime().valueOf() +${factorOffset}-> now: ${now}/ Tone.now: ${Tone.now()} -
        // play at: ${playTime}
        // timeDifference playTime - now() : ${timeDifference}
        // `);
        // return quant playTime
        return timeDifference;
    };

    //
    //
    //
    //
    //
    //
    //
    //

    // ============================================
    // HTML - renderer
    // ============================================

    renderContent() {
        // add a delay to catch changes
        setTimeout(() => {
            this.renderInstruments();
            this.renderParts();
            this.renderInstrumentsOverview();
            document.getElementById(this.#bpmDiv).value = Math.floor(this.#bpm);
        }, 200);
    }
    renderInstrumentsOverview() {
        let html = ``;
        Object.keys(this.#listOfAllInstruments).forEach((inst) => {
            // console.log(`render these: ${this.#listOfAllInstruments[inst].name}`);
            html += `
            <a id="play_${this.#listOfAllInstruments[inst].name}"  href='#'>${
                this.#listOfAllInstruments[inst].name
            }</a> 
            `;
        });
        // replace html content
        document.getElementById(this.#instListDiv).innerHTML = "";
        document.getElementById(this.#instListDiv).innerHTML += html;

        // add event listener
        Object.keys(this.#listOfAllInstruments).forEach((inst) => {
            document.getElementById(`play_${inst}`).addEventListener("click", () => {
                console.log(`play inst: ${inst} once ...`);
                window.welle.app.playOnce(inst);
            });
        });
    }

    renderParts() {
        let html = "";
        // iterate through parts collection
        Object.keys(this.#parts).forEach((part) => {
            this.#parts[part].html = `
                <input 
                    type = "button" 
                    class = "w3-button w3-round-large w3-border w3-black w3-small" 
                    value = "${part}"
                    title = "part: ${part}"
                    id = "${part}">
                </input> `;
            html += this.#parts[part].html;
        });

        document.getElementById(this.#partDiv).innerHTML = "";
        document.getElementById(this.#partDiv).innerHTML = html;

        // first create html, then event listener
        Object.keys(this.#parts).forEach((part) => {
            document.getElementById(part).addEventListener("click", () => {
                // console.log(`happy button part: ${part}`);
                window.welle.app.startPart(part);
            });
        });
    }

    renderInstruments() {
        let html = ``;
        // iterate through instruments collection
        Object.keys(this.#instruments).forEach((inst) => {
            // if not yet rendered, init rendering
            if (this.#instruments[inst].rendered == undefined)
                this.#instruments[inst].rendered = false;

            if (!this.#instruments[inst].rendered) {
                // round volume
                const volume = Math.round(this.#instruments[inst].getVolume() * 10) / 10;

                // create HTML elements for appending
                this.#instruments[inst].html = `
                <div id="inst_${inst}" class="w3-row">
                    <div class="w3-col" style="width:120px">
                        <input 
                        id="check_${this.#instruments[inst].name}" 
                        class="w3-check" 
                        type="checkbox" 
                        title = "check: ${inst}"
                        checked="true">
                        <label> <b>${this.#instruments[inst].name}</b> </label>
                    </div>
                    <div id="vol_${inst}" class="w3-col" style="width:70px">
                        vol: ${volume}
                    </div>
                    <div id="rand_${inst}" class="w3-col" style="width:70px">
                        % ${this.#instruments[inst].random}
                    </div>
                    <div id="pattern_${inst}" class="w3-half">
                        pattern: ${this.#instruments[inst].getRawPattern()}
                    </div>
                </div>`;
                html += this.#instruments[inst].html;
            }
        });

        // add html content
        document.getElementById(this.#instDiv).insertAdjacentHTML("beforeend", html);

        // update checkboxes with isPlaying, vol, pattern
        Object.keys(this.#instruments).forEach((inst) => {
            // checkboxes
            if (this.#instruments[inst].isPlaying)
                window.document.getElementById(`check_${inst}`).checked = true;
            else window.document.getElementById(`check_${inst}`).checked = false;
            // update volume . round volume
            const volume = Math.round(this.#instruments[inst].getVolume() * 10) / 10;
            window.document.getElementById(`vol_${inst}`).innerHTML = `vol: ${volume}`;
            // update random
            window.document.getElementById(`rand_${inst}`).innerHTML = `% ${
                this.#instruments[inst].random
            }`;
            // update pattern
            window.document.getElementById(
                `pattern_${inst}`
            ).innerHTML = `pattern: ${this.#instruments[inst].getRawPattern()}`;
        });
        //

        // first create html, then event listener
        Object.keys(this.#instruments).forEach((inst) => {
            if (!this.#instruments[inst].rendered) {
                // console.log(`assign event listener to checkbox for ${inst}`);
                // add checkbox update
                window.document.getElementById(`check_${inst}`).addEventListener("click", (c) => {
                    if (c.target.checked) {
                        // console.log(`check checkbox: ${inst}. Start instrument. `);
                        // console.log(`Window: this is the window: ${window.welle.name}`);
                        window.welle.app.plainStartInstruments({
                            instruments: [inst],
                            random: null,
                        });
                    }
                    if (!c.target.checked) {
                        // console.log(`uncheck checkbox: ${inst}. Stop instrument. `);
                        window.welle.app.stopInstruments([inst]);
                    }
                });

                this.#instruments[inst].rendered = true;
            }
        });
    }
}

export { WelleApp };
