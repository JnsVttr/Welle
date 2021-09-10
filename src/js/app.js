import * as Tone from "tone";
import { livecode, semantics } from "/html/ohm/semantic2021";
import { Instrument } from "/js/instrument";
import { parser } from "/js/parser";
import { Socket } from "/index";
import { text } from "/js/text";
import { tutorial } from "/js/tutorial";
import WebMidi from "webmidi";

// ============================================
// WELLE APP
// ============================================

/*
WEBMIDI API https://djipco.github.io/webmidi/latest/classes/Output.html#method_playNote


Structure of App:
grid = main storage array for note events of the sample-based instruments (sampler). 
        depends on how many samples are loaded. max 14 samples.
*/

//
//
//
//
//
//
//
//
//
// ===========================================================================

class WelleApp {
    // debug
    debug = true;

    // general
    user = "local";
    id = "xxx";
    session = [];
    tutorial = false;

    #toneStarted = false;
    bpm = 120;
    // console
    #consoleInput = "";
    #consolePointer = 0;
    #consoleMaxLength = 10;
    #consoleArray = Array(this.#consoleMaxLength).fill({ message: "&nbsp;" });
    #consoleID = "console";
    // sound
    #playSound = true; // bool html
    #playAlerts = true; // bool html
    #alerts = {}; // incoming alerts list from server
    samples = []; // incoming sample list from server
    instruments = []; // create instruments based on the samples list
    activeInstruments = []; // store acivated instruments
    grid = undefined;
    beat = 0;
    parts = {}; // storage for all the saved parts

    // recorder
    recorder = new Tone.Recorder();
    recording = undefined;
    // MIDI
    selectedMIDIDevice = undefined;
    MIDIOutput = undefined;
    MIDIInput = undefined;
    midiChanInput = 15;
    midiChanOutput = 16;
    midiTransferOngoing = false;
    incomingSequence = [null, null, null, null, null, null, null, null];
    incomingSequenceCount = 0;

    midiCountPattern = 0;
    midiCountEq = 0;
    midiCountEnv = 0;
    midiPattern = [0, 0, 0, 0, 0, 0, 0, 0];
    midiEq = { high: 0, highFrequency: 5000, mid: 0, lowFrequency: 400, low: 0 };
    midiEnv = { attack: 0, decay: 0, sustain: 0, release: 0 };
    // MIDI Interaction (name, vol, env, pattern, eq?)
    selected = {
        name: "",
        vol: 1,
        env: [0.1, 0.2, 0.3, 0.1],
        eq: [],
        pattern: [1, null, 1, null],
    };
    // html
    instDiv = "instruments";
    partDiv = "parts";
    bpmDiv = "input_bpm";
    instListDiv = "listOfInstruments";
    // #presetsDiv = "presets";
    #sessionDiv = "session";
    #infoDiv = "info";
    tutorialDiv = "tutorial";
    // functions
    // map function
    map = (value, x1, y1, x2, y2) =>
        Math.round((((value - x1) * (y2 - x2)) / (y1 - x1) + x2) * 100) / 100;

    //
    // construct "App" and evaluate functions

    constructor() {
        // print some info
        this.printInfo();

        // set initial BPM and render to Page
        this.setBpm({ bpm: this.bpm });

        // connect audio to Tone master - assign Instrument class masterOut to Tone master
        Instrument.masterGain.connect(Tone.getDestination());
        Instrument.masterGain.connect(this.recorder);
        // Instrument.playMidiNote = this.playMidiNote;

        // render info + tutorial
        this.renderExternal();

        // window eventlisteners
        window.addEventListener("load", () => {
            console.log(`Document window loaded.`);
            this.renderConsole();
            // alerts
            window.document.getElementById("checkAlerts").checked = this.#playAlerts;
            window.document.getElementById(`checkAlerts`).addEventListener("click", (c) => {
                this.handleAlerts(c.target.checked);
            });
            // sound
            window.document.getElementById("checkSound").checked = this.#playSound;
            this.handleSound(this.#playSound);
            window.document.getElementById(`checkSound`).addEventListener("click", (c) => {
                this.handleSound(c.target.checked);
            });
            // record button
            window.document.getElementById(`rec-button`).addEventListener("click", (c) => {
                this.handleRecord();
            });
            // Midi select
            window.document.getElementById(`midiSelect`).addEventListener("click", (c) => {
                // console.log(`select click.. ${c.target}`);
                this.startMIDI();
            });
            window.document.getElementById(`midiSelect`).addEventListener("change", (c) => {
                console.log(`select change.. ${c.target.value}`);
                this.selectMIDIdevice(c.target.value);
            });
        });
    }

    // ===========================================================================
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
            user: ${this.user}
            muteSound: ${!this.#playSound}
            muteAlerts: ${!this.#playAlerts}
            bpm: ${this.bpm}

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
    // Communication with Server, basic setup
    // ============================================
    // get samples and alerts as file paths, and store in local objects (name, file, path, buffer)
    // add alert players
    // return number of files for controlling further actions
    // once all samples are arrived, start instrument creation
    //

    getAlertsNum() {
        if (Object.keys(this.#alerts).length == 0) return 0;
        else return Object.keys(this.#alerts).length;
    }

    getSamplesNum() {
        if (Object.keys(this.samples).length == 0) return 0;
        else return Object.keys(this.samples).length;
    }

    addSamples(files) {
        files.map((file) => {
            const name = file.split(".")[0];
            const path = `/audio/${file}`;
            const buffer = new Tone.ToneAudioBuffer(path, () => {});
            const content = {
                name: name,
                file: file,
                path: path,
                buffer: buffer,
            };
            this.samples.push(content);
        });
        if (this.debug) {
            let names = [];
            this.samples.forEach((sample) => {
                names.push(sample.name);
            });
            console.log(`incoming samples: `, names);
        }
    }

    addAlerts(files) {
        files.map((file) => {
            const name = file.split(".")[0];
            const path = `/alerts/${file}`;
            const content = { name: name, file: file, path: path };
            this.#alerts[name] = content;
            this.#alerts[name].player = new Tone.Player(this.#alerts[name].path).toDestination();
            this.#alerts[name].player.autostart = false;
        });
        if (this.debug) {
            let names = [];
            Object.keys(this.#alerts).forEach((key) => {
                // console.log(this.#alerts[key]);
                names.push(key);
            });
            console.log("incoming alerts: ", names);
        }
    }

    playAlert(alertName) {
        if (this.#playAlerts) if (this.#alerts[alertName]) this.#alerts[alertName].player.start();
    }

    // handle html input alerts/ sounds playmode
    // if checkboxes are checked, than play alerts or sound

    handleAlerts(checked) {
        // console.log(`Play Alerts. change to: ${checked}`);
        this.#playAlerts = checked;
    }
    handleSound(checked) {
        // console.log(`Play Sound. change to: ${checked}`);
        this.#playSound = checked;
        if (this.#playSound) Instrument.masterGain.gain.rampTo(0.9, 0.1);
        else Instrument.masterGain.gain.rampTo(0, 0.1);
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
    // Instrument creation
    // ============================================
    // make one instrument (Sample Player) for each sample, that arrived from server
    // and is stored in the #samples list

    makeSynths = (data) => {
        // console.log(JSON.stringify(data));
        // message contains: count, this.#samples array
        // here we will create all Instruments at once for the App
        // count is passed, is the amount of samples we got from server
        // make temp array to store synths -> this.#instruments
        const synths = [];
        const count = data.count;
        const samples = data.samples;

        for (let i = 0; i < count; i++) {
            // we will use the Instrument class to create synths
            const name = samples[i].name;
            const buffer = samples[i].buffer;
            const chan = i;
            const message = { count: count, name: name, buffer: buffer, chan: chan };

            // console.log(JSON.stringify(message));
            let synth = new Instrument(message);
            synths.push(synth);
        }
        return synths;
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
    // STEP SEQUENCER 8x8 creation
    // code taken from https://medium.com/geekculture/creating-a-step-sequencer-with-tone-js-32ea3002aaf5
    // ============================================

    makeGrid = (instruments) => {
        // the grid will have as many subarrays as there are instruments
        // each sub array corresponds to one row in our sequencer grid

        // parent array to hold each row subarray
        const rows = [];

        for (const instrument of instruments) {
            // console.log(`makeGrid for ${instrument.name}`);
            // declare the subarray
            const row = [];
            const sequence = instrument.sequence;
            // each subarray contains multiple objects that have an assigned note
            // and a boolean to flag whether they are "activated"
            // each element in the subarray corresponds to one eigth note

            for (let i = 0; i < 8; i++) {
                let state = false;
                if (sequence[i] != null) state = true;
                row.push({
                    instrument: instrument.name,
                    note: sequence[i],
                    isActive: state,
                    mute: instrument.mute,
                });
            }
            rows.push(row);
        }

        // we now have all rows each containing 16 eighth notes
        return rows;
    };

    configLoop = () => {
        const repeat = (time) => {
            // console.log(`beat: ${this.beat}`);
            // update the grid based on changes in the instruments (Sequences, Rand etc.)
            this.grid = this.makeGrid(this.instruments);
            // for each step check how many instruments play a note and play it
            this.grid.forEach((row, index) => {
                const synth = this.instruments[index].synth;
                const name = this.instruments[index].name;
                const ampEnv = this.instruments[index].ampEnv;
                const event = row[this.beat];
                const mute = this.instruments[index].mute;
                let midiChan = 0;
                let midiTransmit = true;
                if (index < 14) midiChan = index;
                else midiTransmit = false;

                if (mute == false) {
                    if (event.isActive) {
                        ampEnv.triggerAttackRelease("8n", time);
                        synth.triggerAttackRelease(event.note, "8n", time);
                        // MIDI - playnote in time
                        if (window.welle.app.MIDIOutput != undefined) {
                            // if midiTransmit = true eg. Midi channel < 14
                            if (midiTransmit) {
                                const nextEventTime = Tone.Time("@8n").toSeconds() * 1000;
                                const diffTime = nextEventTime - WebMidi.time;
                                this.playMidiNote({
                                    note: event.note,
                                    channel: midiChan,
                                    velocity: this.instruments[index].getVolume(),
                                    duration: 10,
                                    time: diffTime, // midiChan short delay for MIDI connection
                                });
                            }
                        }
                    }
                }
                // count beats for randomising
                if (this.beat == 7) {
                    this.instruments[index].beatCounter = this.instruments[index].beatCounter + 1;
                    // console.log(this.instruments[index]);
                }
                // update MIDI output at new randomized sequence
                const randEvent = this.instruments[index].updateRandomizer();
                if (randEvent == true) {
                    // send only if instrument = selected instrument
                    if (name == this.selected.name) {
                        this.selected.sequence = this.instruments[index].getSequence();
                        this.sendMidiSelectedInstState(this.selected);
                    }
                    this.renderInstruments();
                }
            });
            // update the beat counter
            this.beat = (this.beat + 1) % 8;
            // send MIDI Clock
            const nextEventTime = Tone.Time("@8n").toSeconds() * 1000;
            const diffTime = nextEventTime - WebMidi.time;
            if (window.welle.app.MIDIOutput != undefined) {
                window.welle.app.MIDIOutput.sendClock({ time: WebMidi.time + diffTime });
            }
        };
        // Tone.Transport.bpm.value = 120;
        Tone.Transport.scheduleRepeat(repeat, "8n");
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
    // handle Tone, Start & Stop
    // ============================================
    async startTone() {
        if (this.#toneStarted == false) {
            await Tone.start();
            this.#toneStarted = true;
            // extremly relevant to stability of Tone playback
            Tone.context.lookAhead = 0.3;
        }
    }
    startTransport() {
        this.beat = 0;
        if (Tone.Transport.state != "started") Tone.Transport.start();
        // send MIDI start
        const nextEventTime = Tone.Time("@8n").toSeconds() * 1000;
        const diffTime = nextEventTime - WebMidi.time;
        if (window.welle.app.MIDIOutput != undefined) {
            window.welle.app.MIDIOutput.sendStart({ time: WebMidi.time + diffTime });
        }
        // change play button
        document.getElementById("play-button").classList.add("w3-green");
        document.getElementById("play-button").classList.add("w3-hover-green");
    }
    stopTransport() {
        if (Tone.Transport.state != "stopped") Tone.Transport.stop();
        // send MIDI stop
        const nextEventTime = Tone.Time("@8n").toSeconds() * 1000;
        const diffTime = nextEventTime - WebMidi.time;
        if (window.welle.app.MIDIOutput != undefined) {
            window.welle.app.MIDIOutput.sendStop({ time: WebMidi.time + diffTime });
        }
        // change play button
        document.getElementById("play-button").classList.remove("w3-green");
        document.getElementById("play-button").classList.remove("w3-hover-green");
    }

    playAll() {
        if (Tone.Transport.state != "started") this.startTransport();
    }

    stopAll() {
        // this.renderContent();
        this.stopTransport();
        this.beat = 0;
    }

    setBpm(message) {
        // message = bpm, factor
        const bpm = Math.min(440, Math.max(1, message.bpm));
        // if (this.debug) console.log(`BPM math bpm: ${message.bpm}, limit Bpm: ${bpm}`);
        this.bpm = bpm;
        if (message.factor) Tone.Transport.bpm.rampTo(bpm, message.factor);
        else Tone.Transport.bpm.rampTo(bpm, 0.1);
        // if Transport running
        // if (Tone.Transport.state == "started") {
        //     if (message.factor) Tone.Transport.bpm.rampTo(bpm, message.factor);
        //     else Tone.Transport.bpm.rampTo(bpm, 0.1);
        // }
        // this.renderContent();
        this.renderBpm();
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
    // console sound input
    // ============================================

    assignPattern(message) {
        // console.log(`assignPattern. message: ${JSON.stringify(message)}`);
        // checks for instruments
        // console.log(`assign:
        // number of instruments: ${message.instruments.length}`);
        // validate message instruments input, can be multiple instruments at once
        message.instruments.forEach((inst) => {
            let valid = false;
            // compare with list of instruments
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    valid = true;
                    entry.mute = false;
                    entry.updateSequence(message.pattern, message.rawPattern);
                    if (message.random != undefined) entry.random(message.random);
                    if (message.volume != undefined) entry.setVolume(message.volume);
                    this.setSelected(entry);
                    entry.activate();
                }
            });
            // console.log(`${inst} valid is ${valid}`);
            if (valid == false) {
                this.addToConsole({
                    valid: false,
                    string: inst,
                    comment: "no such instrument",
                });
            }
        });

        if (Tone.Transport.state != "started") this.startTransport();
        this.renderContent();
    }

    plainStartInstruments(message) {
        if (this.debug) console.log(`plainStartInstruments. message: ${JSON.stringify(message)}`);

        let isPart = false;
        const partName = message.instruments[0];
        // check for parts if only one instrument
        if (message.instruments.length == 1) {
            if (this.parts[partName]) {
                // console.log(`part ${partName} detected`);
                isPart = true;
            }
        }
        if (isPart) {
            this.startPart(partName);
        } else {
            // validate instruments input
            message.instruments.forEach((inst) => {
                let valid = false;
                this.instruments.forEach((entry) => {
                    if (entry.name == inst) {
                        valid = true;
                        // if no sequence assigned, create one
                        if (entry.patternRaw == "") entry.updateSequence([0], "#");
                        // in case is muted, unmute
                        entry.mute = false;
                        // assign random and volume
                        if (message.random != undefined) entry.rand = message.random;
                        if (message.volume != undefined) entry.setVolume(message.volume);
                        this.setSelected(entry);
                        entry.activate();
                    }
                });
                console.log(`${inst} valid is ${valid}`);
                if (valid == false) {
                    this.addToConsole({
                        valid: false,
                        string: inst,
                        comment: "no such instrument",
                    });
                }
            });

            if (Tone.Transport.state != "started") this.startTransport();
        }
        this.renderContent();
    }

    stopInstruments(instruments) {
        // validate message instruments input, can be multiple instruments at once
        instruments.forEach((inst) => {
            let valid = false;
            // compare with list of instruments
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    valid = true;
                    entry.mute = true;
                    this.setSelected(entry);
                }
            });
            // console.log(`${inst} valid is ${valid}`);
            if (valid == false) {
                this.addToConsole({
                    valid: false,
                    string: inst,
                    comment: "no such instrument",
                });
            }
        });

        //if (nothingIsPlaying) this.stopTransport();
        let running = false;
        this.instruments.forEach((entry) => {
            if (entry.getStatus() == true) running = true;
        });
        if (!running) this.stopTransport();
        this.renderContent();
    }

    setVolume(message) {
        message.instruments.forEach((inst) => {
            let valid = false;
            // compare with list of instruments
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    valid = true;
                    entry.setVolume(message.volume);
                    if (message.midi == undefined) {
                        this.setSelected(entry);
                        entry.activate();
                    }
                }
            });
            // console.log(`${inst} valid is ${valid}`);
            if (valid == false) {
                this.addToConsole({
                    valid: false,
                    string: inst,
                    comment: "no such instrument",
                });
            }
        });
        this.renderContent();
    }

    copyPattern(message) {
        console.log(`incoming message: ${JSON.stringify(message)}`);
        let source = undefined;
        let sequence = undefined;
        let patternRaw = undefined;
        let destinations = [];

        // check if source exists
        message.source.forEach((inst) => {
            let valid = false;
            // compare with list of instruments
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    valid = true;
                    source = entry;
                    sequence = entry.sequence;
                    patternRaw = entry.patternRaw;
                    this.setSelected(entry);
                    entry.activate();
                }
            });
            if (valid == false) {
                this.addToConsole({
                    valid: false,
                    string: inst,
                    comment: "no such instrument",
                });
            }
        });

        if (source != undefined) {
            // check if destinations exist and copy source pattern
            message.destinations.forEach((inst) => {
                let valid = false;
                // console.log(inst);
                // compare with list of instruments
                this.instruments.forEach((entry) => {
                    if (entry.name == inst) {
                        valid = true;
                        // console.log(`${inst} exists`);
                        destinations.push(inst);
                    }
                });
                if (valid == false) {
                    this.addToConsole({
                        valid: false,
                        string: inst,
                        comment: "no such instrument",
                    });
                }
            });
        }

        if (source != undefined && destinations.length > 0) {
            console.log(
                `success -> copy ${sequence} 
                from ${source} to ${JSON.stringify(destinations)}`
            );
            destinations.forEach((inst) => {
                this.instruments.forEach((entry) => {
                    if (entry.name == inst) {
                        entry.patternRaw = patternRaw;
                        for (let i = 0; i < 8; i++) {
                            entry.sequence[i] = sequence[i];
                        }
                        // this.setSelected(inst);
                        entry.activate();
                    }
                });
            });
        } else console.log(`copy error`);

        this.renderContent();
    }

    delete(names) {
        console.log(`delete this: ${names}`);
        let valid = false;
        names.map((name) => {
            if (this.parts[name]) {
                delete this.parts[name];
                valid = true;
                // console.log(`delete this part: ${name}`);
            }
            // if this inst exists, reset everything
            this.instruments.forEach((entry) => {
                if (entry.name == name) {
                    valid = true;
                    entry.sequence = [null, null, null, null, null, null, null, null];
                    entry.patternRaw = "";
                    entry.setVolume(0.6);
                    entry.deactivate();
                    this.activeInstruments = this.activeInstruments.filter(
                        (item) => item !== entry.name
                    );
                }
            });
        });
        if (valid == false) {
            this.addToConsole({
                valid: false,
                string: "",
                comment: "no such instrument or part",
            });
        }
        this.renderContent();
    }

    deleteAll() {
        console.log(`App delete all..`);
        this.#consoleArray = Array(this.#consoleMaxLength).fill({ message: "&nbsp;" });
        this.renderConsole();
        // clear & delete every instrument
        this.instruments.forEach((entry) => {
            entry.sequence = [null, null, null, null, null, null, null, null];
            entry.patternRaw = "";
            entry.setVolume(0.6);
            entry.deactivate();
            this.activeInstruments = this.activeInstruments.filter((item) => item !== entry.name);
        });
        // delete all parts
        for (let part in this.parts) {
            // console.log(`delete this part: ${part}`);
            delete this.parts[part];
        }
        // stop Tone
        this.stopTransport();
        // render
        this.renderContent();
    }

    playOnce(inst) {
        const player = new Tone.Player().toDestination();
        // play one of the samples when they all load
        this.instruments.forEach((entry) => {
            if (entry.name == inst) {
                player.buffer = entry.buffer;
                player.volume.value = -12;
                player.start();
            }
        });
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
    // Parts
    // ============================================
    // parts are snapshots of current instruments/sequences etc.
    // parts are stored in an array and can be loaded

    savePart(name) {
        console.log(`save new part : ${name}`);

        // check if name is reserved as instrument
        // valid = if a part name is not taken by an instrument
        let valid = true;
        this.instruments.forEach((entry) => {
            if (entry.name == name) {
                valid = false;
                this.addToConsole({
                    valid: false,
                    string: name,
                    comment: "name reserved as instrument",
                    user: this.user,
                });
            }
        });

        if (valid) {
            // init new part
            this.parts[name] = {
                instrumentCollection: {},
                bpm: this.bpm,
            };
            this.instruments.forEach((entry) => {
                this.activeInstruments.forEach((instName) => {
                    if (entry.name == instName) {
                        this.parts[name].instrumentCollection[entry.name] = {
                            name: entry.name,
                            mute: entry.getMute(),
                            sequence: entry.getSequence(),
                            patternRaw: entry.getPatternRaw(),
                            volume: entry.getVolume(),
                            rand: entry.getRand(),
                            envSettings: entry.getEnvSettings(),
                        };
                    }
                });
            });

            console.log(`part ${name} saved in parts`, this.parts[name]);
        }
        this.renderParts();
    }

    startPart(name) {
        console.log("");
        console.log(`start part ${name}:`);
        console.log(this.parts);
        // STOP - un-click all active all instruments
        this.instruments.forEach((entry) => {
            this.activeInstruments.forEach((name) => {
                if (entry.name == name) {
                    const id = "check_" + entry.name;
                    // console.log(`check status ${id}: `, window.document.getElementById(id).checked);
                    if (window.document.getElementById(id).checked == true)
                        window.document.getElementById(id).click();
                }
            });
        });

        // now copy the saved info to each actual instrument
        this.instruments.forEach((entry) => {
            const storedInst = this.parts[name].instrumentCollection[entry.name];
            // only if instrument stored:
            if (storedInst != undefined) {
                if (entry.name == storedInst.name) {
                    console.log(`recall inst ${entry.name}`);
                    entry.setSequence(storedInst.sequence, storedInst.patternRaw);
                    entry.setVolume(storedInst.volume);
                    entry.setMute(storedInst.mute);
                    entry.setRand(storedInst.rand);
                    entry.setEnvSettings(storedInst.envSettings);
                    const id = "check_" + entry.name;
                    window.document.getElementById(id).click();
                }
            }
        });

        // BPM change
        this.setBpm({ bpm: this.parts[name].bpm });
        // this.beat = 0;
        // start Tone Transport
        if (Tone.Transport.state != "started") this.startTransport();
        // this.renderParts();
    }

    //
    //
    //
    //
    //
    //
    //

    // ============================================
    // Selected
    // ============================================
    // set last instrument as selected, for HTML display and MIDI interaction

    setSelected(inst) {
        // set selected instrument and save settings
        this.selected.name = inst.name;
        this.selected.vol = inst.getVolume();
        this.selected.env = inst.getEnvSettings();
        this.selected.sequence = inst.getSequence();
        // console.log(`selected inst: ${inst}. Set selected: ${JSON.stringify(this.selected)}`);

        // activate instrument
        inst.activate();
        // store all active instruments in an array
        this.instruments.forEach((entry) => {
            const status = entry.getStatus();
            // console.log(`Status inst ${entry.name}: ${status}`);
            // if inst not already stored, than push in array
            if (status == true) {
                let isStored = false;
                this.activeInstruments.forEach((stored) => {
                    if (stored == entry.name) isStored = true;
                });
                if (isStored == false) this.activeInstruments.push(entry.name);
            }
        });
        // console.log(JSON.stringify(this.activeInstruments));

        //
        setTimeout(() => {
            this.activeInstruments.forEach((inst) => {
                if (inst == this.selected.name)
                    window.document.getElementById(`inst_${inst}`).classList.add("selectedInst");
                else
                    window.document.getElementById(`inst_${inst}`).classList.remove("selectedInst");
            });
        }, 350);
        // this.sendMidiSelectedInstState();

        // midi transfer ongoing is a delay for send midi, and not receiving in the same time
        if (this.midiTransferOngoing == false) {
            if (window.welle.app.MIDIOutput != undefined)
                this.sendMidiSelectedInstState(this.selected);
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

    // ============================================
    // handle main string input
    // ============================================
    //
    //

    handleMainInput(inputString) {
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
            this.addToConsole({ valid: true, string: inputString, user: this.user });
            parser(result.semantic);
        } else this.addToConsole({ valid: false, string: inputString, user: this.user });

        if (!this.tutorial) {
            // clear Input
            document.getElementById("mainInput").value = "";
            // FOCUS - focus back on textfield
            document.getElementById("mainInput").focus();
        }
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
    // handleRemoteInput(message) {
    //     if (this.user != message.user) {
    //         const result = this.#inputValidation(message.string);
    //         this.addToConsole({ valid: true, string: message.string, user: message.user });
    //         parser(result.semantic);
    //     }
    // }
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
                    const element = this.#consoleArray[length - 1 - this.#consolePointer].message;
                    if (element != "&nbsp;") document.getElementById("mainInput").value = element;

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
                        const element = this.#consoleArray[length - this.#consolePointer].message;
                        if (element != "&nbsp;")
                            document.getElementById("mainInput").value = element;
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
                    if (message.user == "local") {
                        this.#consoleArray.push({ message: `${message.string}` });
                    } else {
                        // here if joined the session
                        // this.#consoleArray.push({ message: `${message.user}: ${message.string}` });
                        // if (message.user == this.user) {
                        //     Socket.emit("sessionData", { user: this.user, string: message.string });
                        // }
                    }
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
            html += `<p id="consoleLine">${this.#consoleArray[i].message}</p>`;
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
    // HTML - renderer
    // ============================================

    renderContent() {
        // add a delay to catch changes
        setTimeout(() => {
            this.renderInstrumentsOverview();
            this.renderInstruments();
            this.renderParts();

            // this.renderSession();
            this.renderBpm();
        }, 200);
    }

    renderBpm() {
        document.getElementById(this.bpmDiv).innerHTML = Math.floor(this.bpm);
    }

    renderInstrumentsOverview() {
        let html = `<p>`;
        this.instruments.forEach((entry) => {
            html += `
            <a id="play_${entry.name}" class="links"
                title="click to play sound: ${entry.name}" href='#'>${entry.name}</a>
            `;
        });

        html += "</p>";
        // replace html content
        document.getElementById(this.instListDiv).innerHTML = "";
        document.getElementById(this.instListDiv).innerHTML += html;

        // add event listener to play sound
        this.instruments.forEach((entry) => {
            document.getElementById(`play_${entry.name}`).addEventListener("click", () => {
                console.log(`play inst: ${entry.name} once ...`);
                window.welle.app.playOnce(entry.name);
            });
        });
    }

    renderInstruments() {
        // create empty html content
        let html = ``;
        document.getElementById(this.instDiv).innerHTML = "";

        // iterate through storedInstruments collection
        this.activeInstruments.forEach((inst) => {
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    // round volume
                    const volume = Math.round(entry.getVolume() * 100) / 100;
                    // sequence
                    let sequence = entry.getSequence();
                    let sequenceRender = "";
                    sequence.forEach((e) => {
                        if (e == null) sequenceRender += " - ";
                        else sequenceRender += " " + e + " ";
                    });
                    // checkboxes
                    const isPlaying = !entry.getMute();
                    let checkHtml = "";
                    if (isPlaying) checkHtml = 'checked="checked"';
                    // selected
                    let selHtml = "";
                    if (entry.name == this.selected.name) selHtml += "selectedInst";

                    // create HTML elements for appending
                    const instHtml = `
                    <div id="inst_${entry.name}" class="w3-row ${selHtml}"
                    style="padding-top: 3px; padding-left: 3px;">
                        <div class="w3-col w3-black" style="width:120px; padding-left: 0.4em; margin-right:1.5em">
                            <input
                            id="check_${entry.name}"
                            class="w3-check"
                            type="checkbox"
                            title = "check: ${entry.name}"
                            ${checkHtml}>
                            <label> <b>${entry.name}</b> </label>
                        </div>
                        <div id="vol_${entry.name}" class="w3-col m1" style="width:90px">
                            vol: ${volume}
                        </div>
                        <div id="rand_${entry.name}" class="w3-col m1" style="width:70px">
                            % ${entry.getRand()}
                        </div>
                        <div id="pattern_${entry.name}" class="w3-col m4">
                            ${entry.getPatternRaw()}
                        </div>
                        
                    </div>`;
                    // <div id="sequence_${entry.name}" class="w3-col m4">
                    //     ${sequenceRender}
                    // </div>
                    html += instHtml;
                }
            });
        });
        // add html content
        document.getElementById(this.instDiv).insertAdjacentHTML("beforeend", html);

        // first create html, then event listener
        this.activeInstruments.forEach((inst) => {
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    // add checkbox update
                    window.document
                        .getElementById(`check_${entry.name}`)
                        .addEventListener("click", (c) => {
                            if (c.target.checked) {
                                window.welle.app.plainStartInstruments({
                                    instruments: [entry.name],
                                    random: null,
                                });
                            }
                            if (!c.target.checked) {
                                window.welle.app.stopInstruments([entry.name]);
                            }
                        });
                }
            });
        });
    }

    renderParts() {
        // empty var to store html
        let html = "";

        // iterate through parts collection
        Object.keys(this.parts).forEach((part) => {
            const partHtml = `
                <input
                    type = "button"
                    class = "w3-button w3-round w3-border w3-border-black"
                    value = "${part}"
                    title = "snapshot: ${part}"
                    id = "${part}">
                </input> `;
            html += partHtml;
        });

        // update document
        document.getElementById(this.partDiv).innerHTML = "";
        document.getElementById(this.partDiv).innerHTML = html;

        // first create html, then event listener
        Object.keys(this.parts).forEach((part) => {
            document.getElementById(part).addEventListener("click", () => {
                window.welle.app.startPart(part);
            });
        });
    }

    renderExternal() {
        // info text
        // document.getElementById(this.#infoDiv).innerHTML = text.info;
        // tutorial
        let html = tutorial.start;
        document.getElementById(this.tutorialDiv).innerHTML = html;
        // const checks = document.getElementsByTagName("input");
        // console.log("these are the inputs: ", checks);
        document.querySelectorAll(".tutorialInput").forEach((item) => {
            item.addEventListener("keydown", (e) => {
                if (e.code == "Enter") {
                    window.welle.app.tutorial = true;
                    const input = item.value.toLowerCase();
                    console.log(`message from tutorial input: ${input}`);
                    window.welle.app.handleMainInput(input);
                    item.value = "";
                    setTimeout(() => {
                        window.welle.app.handleMainInput("/");
                    }, 3000);
                }
            });
        });
    }

    // renderSession() {
    //     if (this.user != "local") {
    //         let html = "group: ";
    //         this.session.map((entry) => {
    //             html += `${entry} `;
    //         });
    //         document.getElementById(this.#sessionDiv).innerHTML = html;
    //     }
    // }
    // renderPresets() {
    //     let html = `<p>`;
    //     Object.keys(this.#presets).forEach((preset) => {
    //         html += `
    //         <a id="preset_${this.#presets[preset].name}" class="links"
    //         title="click to load preset: ${preset}" href='#'>${this.#presets[preset].name}</a>
    //         `;
    //     });
    //     html += "</p>";
    //     // replace html content
    //     document.getElementById(this.#presetsDiv).innerHTML = "";
    //     document.getElementById(this.#presetsDiv).innerHTML += html;

    //     // add event listener
    //     Object.keys(this.#presets).forEach((preset) => {
    //         document.getElementById(`preset_${preset}`).addEventListener("click", () => {
    //             console.log(`load preset: ${preset}  ...`);
    //             window.welle.app.loadPreset(preset);
    //         });
    //     });
    // }

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
    // RECORDER
    // ============================================

    async handleRecord() {
        const value = window.document.getElementById("rec-button").value;

        // if (Tone.Transport.state != "started") Tone.Transport.start();
        if (value == "RECORD") {
            console.log(`start recorder`);
            this.recorder.start();
            if (window.document.getElementById("file").innerHTML != "") {
                window.document.getElementById("file").innerHTML = "";
                console.log(`id file not empty..`);
                this.recording = undefined;
            }

            window.document.getElementById("rec-button").value = "STOP";
            document.getElementById("rec-button").classList.add("w3-red");
            document.getElementById("rec-button").classList.add("w3-hover-red");
        } else {
            window.document.getElementById("rec-button").value = "RECORD";
            document.getElementById("rec-button").classList.remove("w3-red");
            document.getElementById("rec-button").classList.remove("w3-hover-red");
            console.log(`stop recorder`);

            if (this.recorder.state == "started") {
                // the recorded audio is returned as a blob
                this.recording = await this.recorder.stop();
                console.log(`recording: ${JSON.stringify(this.recording, null, 2)}`);
                document.getElementById(
                    "file"
                ).innerHTML = `<a id="downloadFile" title="click to download recorded audio file" href="#">download audio file (webm)</a>`;
                document.getElementById("downloadFile").addEventListener("click", (c) => {
                    console.log(`file link clicked. date: ${new Date()}`);
                    const recording = window.welle.app.getRecording();
                    const url = URL.createObjectURL(recording);
                    const anchor = document.createElement("a", { href: url });
                    anchor.download = "welle-record.webm";
                    anchor.href = url;
                    document.body.append(anchor);
                    anchor.click();
                    anchor.remove();
                });
            }
        }
    }
    getRecording() {
        return this.recording;
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
    // MIDI
    // ============================================

    // MIDI handling
    startMIDI() {
        if (WebMidi.state == undefined) {
            WebMidi.enable(function (err) {
                if (err) {
                    console.log("WebMidi could not be enabled.", err);
                } else {
                    console.log("WebMidi enabled!");
                }
                const selectBox = window.document.getElementById("midiSelect");

                WebMidi.outputs.map((output) => {
                    console.log(`Midi out: ${output.name}`);
                    let option = document.createElement("option");
                    option.text = output.name;
                    selectBox.add(option);
                });
            });
        }
    }

    selectMIDIdevice(selectedName) {
        // "Pro40 MIDI"
        const midiOutputs = WebMidi.outputs;
        const midiInputs = WebMidi.inputs;
        midiOutputs.map((output) => {
            const name = output.name;
            if (name == selectedName) this.MIDIOutput = WebMidi.getOutputByName(name);
        });
        if (this.MIDIOutput) console.log(`MIDI Out connected to ${this.MIDIOutput.name}`);
        // MIDIInput
        midiInputs.map((input) => {
            const name = input.name;
            if (name == selectedName) this.MIDIInput = WebMidi.getInputByName(name);
        });
        if (this.MIDIInput) {
            console.log(`MIDI In connected to ${this.MIDIInput.name}`);
            this.addMIDIInputListeners();
        }
    }

    playMidiNote(message) {
        // message.note, message.channel, message.velocity, message.duration
        // console.log(`MIDI message: `, message);
        if (message == undefined) message = {}; // if no message send, create empty object
        const note = message.note || "C3";
        let chan = 0;
        if (message.channel != undefined) chan = message.channel + 1;
        const vel = message.velocity || 1;
        const dur = message.duration || 200;
        let midiTime = 0;
        if (message.time != undefined) midiTime = message.time;
        // console.log([note, chan, vel, dur, midiTime]);

        // if MIDI device is connected
        if (window.welle.app.MIDIOutput != undefined) {
            // console.log(`play MIDI note ${note}`);
            window.welle.app.MIDIOutput.playNote(note, chan, {
                time: WebMidi.time + midiTime,
                velocity: vel,
                duration: dur,
            });
        }
    }

    sendMidiSelectedInstState(message) {
        // send message to MIDI, channels defined in class variables midiChanInput 15, midiChanOutput 16
        console.log(`Send MIDI Message: `, message);

        if (window.welle.app.MIDIInput != undefined) {
            /*
            CC map, MIDI channel 1
            Controller (max 120):
                1-8     = pattern steps of tangible pins (CC0 off, CC>0 on)
                9       = volume (CC map 0.0-1.0 -> 0-127)
                10-14   = EQ 5 values
                16-19   = Env 4 values
            */

            // Send Volume
            // ==================================================
            let vol = message.vol;
            vol = window.welle.app.map(vol, 0, 1, 0, 126);
            window.welle.app.MIDIOutput.sendControlChange(
                9, // cc controller
                vol, // CC value
                this.midiChanOutput // channel
            );

            // Send Pattern
            // ==================================================
            const sequence = message.sequence;
            // send pattern midi messages
            sequence.map((e, c) => {
                const cc = 1 + c;
                if (e == null) {
                    window.welle.app.MIDIOutput.sendControlChange(cc, 0, this.midiChanOutput);
                } else {
                    const midiNum = Tone.Frequency(e).toMidi(); //60
                    window.welle.app.MIDIOutput.sendControlChange(cc, midiNum, this.midiChanOutput);
                }
            });

            // Send ENV
            // ==================================================
            // env problem: how to scale numbers? 0.01 - 3.00
            // solution: multiple of 10, if 0 => 0.01
            //
            // wait: in SuperCollider, Envelope values are always 0.0 - 1.0
            // so maybe I should adapt this to Tonejs
            const env = [
                message.env.attack,
                message.env.decay,
                message.env.sustain,
                message.env.release,
            ];
            const newEnv = [];

            env.forEach((e) => {
                const val = Math.round(e * 10);
                if (val < 127) newEnv.push(val);
                else newEnv.push(126);
            });

            newEnv.map((e, c) => {
                const cc = 16 + c;
                window.welle.app.MIDIOutput.sendControlChange(cc, e, this.midiChanOutput);
            });
        }

        //     // Send EQ
        //     // ==================================================
        //     /*
        //     settings: {"high":0,"highFrequency":5000,"mid":0,"lowFrequency":400,"low":0}
        //     eq SC: [0.5, 0.3, 0.5, 0.7, 0.5]
        //     map band: -24 / 24 db -> 0.0/1.0
        //     map freq low: 0-2000 -> 0.0-0.5
        //     map freq high: 2000-8000 -> 0.5-1.0
        //     */
        //     // console.log(`send MIDI eq with this settings: ${JSON.stringify(this.selected.eq)}`);
        //     const low = this.map(this.selected.eq.low, -12, 12, 0.0, 1.0);
        //     const lowFreq = this.map(this.selected.eq.lowFrequency, 0, 1000, 0.0, 0.5);
        //     const mid = this.map(this.selected.eq.mid, -12, 12, 0.0, 1.0);
        //     const highFreq = this.map(this.selected.eq.highFrequency, 1000, 13000, 0.5, 1.0);
        //     const high = this.map(this.selected.eq.high, -12, 12, 0.0, 1.0);
        //     // console.log(`map: [${high}, ${highFreq}, ${mid}, ${lowFreq}, ${low}]`);

        //     // console.log(`MIDI send EQ (original): ${JSON.stringify(this.selected.eq)}`);
        //     // console.log(
        //     //    `MIDI send EQ (mapped): [${high}, ${highFreq}, ${mid}, ${lowFreq}, ${low}]`
        //     // );

        //     const newEq = [high, highFreq, mid, lowFreq, low];
        //     newEq.map((eq, c) => {
        //         const cc = 14 - c;
        //         eq = Math.round(eq * 126);
        //         window.welle.app.MIDIOutput.sendControlChange(cc, eq, chan);
        //     });

        //     console.log(
        //         `MIDI send selected Instr.(ch.${chan}):`,
        //         this.selected,
        //         `
        //         MIDI send vol: ${vol}
        //         MIDI send pattern: ${newPattern}
        //         MIDI send EQ (original):
        //         ${JSON.stringify(this.selected.eq)}
        //             map band: -24 / 24 db -> 0.0/1.0
        //             map freq low: 0-1000 -> 0.0-0.5
        //             map freq high: 1000-13000 -> 0.5-1.0
        //         MIDI send EQ (mapped): [${high}, ${highFreq}, ${mid}, ${lowFreq}, ${low}]
        //         MIDI send ENV (original): ${selEnv}
        //         MIDI send ENV (mapped): ${newEnv}
        //         `
        //     );
        // }
    }

    addMIDIInputListeners() {
        // Listen to control change message
        this.MIDIInput.addListener("controlchange", this.midiChanInput, function (e) {
            /*
            midiCountPattern = 0;
            midiCountEq = 0;
            midiCountEnv = 0;
            */
            const cc = e.controller.number;
            const val = e.value;
            const roundFunc = (val) => Math.round(val * 100) / 100;
            const selected = window.welle.app.selected;
            let vol = 0;

            // console.log(`Received 'controlchange' message. CC: ${cc}, val: ${val}`);

            // set time out to avoid midi receive/send issues, only valid on input midi channel
            window.welle.app.midiTransferOngoing = true;
            setTimeout(() => {
                window.welle.app.midiTransferOngoing = false;
            }, 5);

            // only assign, if some instrument is selected
            if (selected.name != "") {
                // VOLUME
                if (cc == 9) {
                    vol = roundFunc(val / 126);

                    window.welle.app.setVolume({
                        instruments: [selected.name],
                        volume: vol,
                        midi: true,
                    });
                    // console.log(`In Volume: ${vol} for inst: ${selected.name}`);
                    console.log(`MIDI input (${selected.name}) vol: ${vol} `);
                }

                // PATTERN
                if (cc >= 1 && cc <= 8) {
                    const index = cc - 1;
                    // this is a partial sequence update at one index
                    let sequence = window.welle.app.selected.sequence;
                    let inst = window.welle.app.selected.name;
                    let sequenceMidi = [];
                    let sequencePattern = "";

                    if (val == 0) sequence[index] = null;
                    else sequence[index] = "C3";

                    sequence.forEach((e) => {
                        // convert to pattern
                        if (e == null) {
                            // convert to midi note numbers
                            sequenceMidi.push(null);
                            sequencePattern += "-";
                        } else {
                            // convert to midi note numbers, than -48 to match grammar input
                            sequenceMidi.push(Tone.Frequency(e).toMidi() - 48);
                            sequencePattern += "#";
                        }
                    });

                    // find inst in list of instruments, update sequence, render content
                    window.welle.app.instruments.forEach((entry) => {
                        if (entry.name == inst) {
                            entry.updateSequence(sequenceMidi, sequencePattern);
                            // console.log(`update sequence for ${inst}`);
                            window.welle.app.renderContent();
                        }
                    });
                }

                // // EQ
                // if (num >= 10 && num <= 14) {
                //     const index = num - 10;
                //     const eqVal = round(val / 126);
                //     window.welle.app.midiCountEq = window.welle.app.midiCountEq + 1;

                //     window.welle.app.midiEq; // {"high":0,"highFrequency":5000,"mid":0,"lowFrequency":400,"low":0}
                //     window.welle.app.midiEq.name = selected.name;
                //     if (index == 0)
                //         window.welle.app.midiEq.low = window.welle.app.map(
                //             eqVal,
                //             0.0,
                //             1.0,
                //             -12,
                //             12
                //         );
                //     if (index == 1)
                //         window.welle.app.midiEq.lowFrequency = window.welle.app.map(
                //             eqVal,
                //             0.0,
                //             1.0,
                //             0,
                //             1000
                //         );
                //     if (index == 2)
                //         window.welle.app.midiEq.mid = window.welle.app.map(
                //             eqVal,
                //             0.0,
                //             1.0,
                //             -12,
                //             12
                //         );
                //     if (index == 3)
                //         window.welle.app.midiEq.highFrequency = window.welle.app.map(
                //             eqVal,
                //             0.0,
                //             1.0,
                //             1000,
                //             13000
                //         );
                //     if (index == 4)
                //         window.welle.app.midiEq.high = window.welle.app.map(
                //             eqVal,
                //             0.0,
                //             1.0,
                //             -12,
                //             12
                //         );

                //     if (window.welle.app.midiCountEq == 5) {
                //         window.welle.app.setEqToSelected(window.welle.app.midiEq);
                //         selected.eq = window.welle.app.midiEq;
                //         window.welle.app.midiCountEq = 0;
                //         console.log(
                //             `MIDI input (${selected.name}) eq: ${selected.eq.low}, ${selected.eq.lowFrequency}, ${selected.eq.mid}, ${selected.eq.highFrequency}, ${selected.eq.high} `
                //         );
                //     }
                // }

                // // ENVELOPE
                // if (num >= 16 && num <= 19) {
                //     const index = num - 16;
                //     const env = round(val / 126);
                //     window.welle.app.midiCountEnv = window.welle.app.midiCountEnv + 1;

                //     window.welle.app.midiEnv.name = selected.name;
                //     if (index == 0) window.welle.app.midiEnv.attack = env;
                //     if (index == 1) window.welle.app.midiEnv.decay = env;
                //     if (index == 2) window.welle.app.midiEnv.sustain = env;
                //     if (index == 3) window.welle.app.midiEnv.release = env;

                //     if (window.welle.app.midiCountEnv == 4) {
                //         window.welle.app.setEnvToSelected(window.welle.app.midiEnv);
                //         selected.env = window.welle.app.midiEnv;
                //         window.welle.app.midiCountEnv = 0;
                //         console.log(
                //             `MIDI input (${selected.name}) env: ${selected.env.attack}, ${selected.env.decay}, ${selected.env.sustain}, ${selected.env.release}`
                //         );
                //     }
                // }
            }
        });
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
    //
    //
    //
    //

    // ============================================
    // console sound helper
    // ============================================

    // // check instruments
    // checkInstruments(instruments) {
    //     let returnMessage = {
    //         validInstruments: undefined,
    //         existingInstruments: undefined,
    //         newInstruments: undefined,
    //     };
    //     // check if instruments are valid
    //     const validInstruments = this.checkValidInstruments(instruments);

    //     if (validInstruments) {
    //         returnMessage.validInstruments = validInstruments;
    //         // collect existing instruments
    //         const existingInstruments = this.checkExistingInstruments(validInstruments);
    //         if (existingInstruments) returnMessage.existingInstruments = existingInstruments;
    //         // collect new instruments
    //         const newInstruments = this.checkNewInstruments(validInstruments);
    //         if (newInstruments) returnMessage.newInstruments = newInstruments;
    //         // if (this.debug) console.log(`Existing: ${existingInstruments}  New: ${newInstruments}`);
    //     }
    //     // if (this.debug)
    //     //     console.log(`returnMessage checkInstruments: ${JSON.stringify(returnMessage)}`);
    //     return returnMessage;
    // }

    // createPreset(name) {
    //     const preset = { name: name, parts: this.#parts, instruments: this.#instruments };
    //     return preset;
    // }
    // storePresets(presets) {
    //     presets.map((preset) => {
    //         const name = preset.name;
    //         this.#presets[name] = preset;
    //     });
    //     // console.log(`this.#presets stored: ${JSON.stringify(this.#presets)}`);
    //     this.renderPresets();
    // }
    // loadPreset(name) {
    //     this.#parts = this.#presets[name].parts;
    //     this.renderContent();
    // }
    // updateUsers(users) {
    //     if (this.user != "local") {
    //         this.session = [];
    //         this.session = users;
    //     }
    //     this.renderContent();
    // }
    // setUser(name) {
    //     this.user = name;
    //     this.session.push(name);
    //     console.log(`new user name: ${name}`);
    //     this.renderSession();
    // }

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

    // addInstruments(presets) {
    //     for (let preset in presets) {
    //         const name = preset;
    //         const fullPreset = { name: name, preset: presets[preset] };
    //         // if (this.debug)
    //         //     console.log(`
    //         // incoming preset name:  ${name}
    //         // preset: ${JSON.stringify(fullPreset)}
    //         // `);
    //         this.#listOfInstruments[name] = fullPreset;
    //         this.#listOfAllInstruments[name] = fullPreset;
    //     }
    // }
    // printAllInstruments() {
    //     if (this.debug) {
    //         console.log(`App all instruments:`);
    //         for (let i in this.#listOfAllInstruments)
    //             console.log(`: ${this.#listOfAllInstruments[i].name}`);
    //         // console.log(`Details: ${JSON.stringify(this.#listOfAllInstruments, null, 0)}`);
    //     }
    // }

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
    /*
    whenever interaction with an instrument, set this.selected to this instrument, copying name, eq, env, pattern
    mark it visually in page, send midi states
    */

    // setEqToSelected(message) {
    //     // console.log(`set selected instrument's EQ...`);
    //     if (message == undefined) {
    //         message = {
    //             name: this.selected.name,
    //             high: 0,
    //             highFrequency: 5000,
    //             mid: 0,
    //             lowFrequency: 300,
    //             low: -42,
    //         };
    //     }
    //     this.#instruments[message.name].setEq(message);
    // }
    // setEnvToSelected(message) {
    //     // console.log(`set selected instrument's EQ...`);
    //     if (message == undefined) {
    //         message = {
    //             name: this.selected.name,
    //             atk: 0.01,
    //             dec: 0.3,
    //             sus: 0.2,
    //             rel: 1.1,
    //         };
    //     }
    //     this.#instruments[message.name].setEnv(message);
    // }

    // // ============================================

    // // ============================================

    // // ============================================

    // // ============================================

    // // ============================================

    // // ============================================

    // // ============================================

    // // ============================================

    // // check instruments
    // checkInstruments(instruments) {
    //     let returnMessage = {
    //         validInstruments: undefined,
    //         existingInstruments: undefined,
    //         newInstruments: undefined,
    //     };
    //     // check if instruments are valid
    //     const validInstruments = this.checkValidInstruments(instruments);

    //     if (validInstruments) {
    //         returnMessage.validInstruments = validInstruments;
    //         // collect existing instruments
    //         const existingInstruments = this.checkExistingInstruments(validInstruments);
    //         if (existingInstruments) returnMessage.existingInstruments = existingInstruments;
    //         // collect new instruments
    //         const newInstruments = this.checkNewInstruments(validInstruments);
    //         if (newInstruments) returnMessage.newInstruments = newInstruments;
    //         // if (this.debug) console.log(`Existing: ${existingInstruments}  New: ${newInstruments}`);
    //     }
    //     // if (this.debug)
    //     //     console.log(`returnMessage checkInstruments: ${JSON.stringify(returnMessage)}`);
    //     return returnMessage;
    // }

    // checkValidInstruments(instruments) {
    //     // check if internal instrument list contains the instruments
    //     const validInstruments = instruments.map((inst) => {
    //         // if (this.debug)
    //         //     console.log(
    //         //         `Valid? check inst: ${inst} in list ${this.#listOfAllInstruments[inst]}`
    //         //     );
    //         if (this.#listOfAllInstruments[inst]) return inst;
    //         else
    //             this.addToConsole({
    //                 valid: false,
    //                 string: inst,
    //                 comment: "no such instrument",
    //                 user: this.user,
    //             });
    //     });
    //     // if (this.debug)
    //     //     console.log(
    //     //         `vaild instruments: ${validInstruments}. Count: ${validInstruments.length}`
    //     //     );
    //     // filter null entries
    //     const result = validInstruments.filter((x) => x);
    //     if (result.length > 0) return result;
    //     else return undefined;
    // }

    // checkExistingInstruments(instruments) {
    //     const existingInstruments = instruments.map((inst) => {
    //         if (this.#instruments[inst]) return inst;
    //     });
    //     // filter null entries
    //     const result = existingInstruments.filter((x) => x);
    //     if (result.length > 0) return result;
    //     else return undefined;
    // }

    // checkNewInstruments(instruments) {
    //     const newInstruments = instruments.map((inst) => {
    //         if (!this.#instruments[inst]) return inst;
    //     });
    //     // filter null entries
    //     const result = newInstruments.filter((x) => x);
    //     if (result.length > 0) return result;
    //     else return undefined;
    // }

    // createNewInstrument(message) {
    //     if (this.#listOfSamples[message.name]) {
    //         message.type = "sampler";
    //         message.sample = this.#listOfSamples[message.name];
    //     }
    //     if (this.#listOfInstruments[message.name]) {
    //         message.type = "preset";
    //         message.preset = this.#listOfInstruments[message.name].preset;
    //     }
    //     if (this.debug) console.log(`create new inst ${message.name} as '${message.type}'`);
    //     this.#instruments[message.name] = new Instrument(message);
    // }

    // //
    // //
    // //
    // //
    // //
    // //
    // //
    // //

    // // ============================================
    // // Tone - delete things
    // // ============================================

    // // deletePreset(name) {
    // //     if (this.#presets[name]) {
    // //         console.log(`delete this preset: ${name}`);
    // //         delete this.#presets[name];
    // //         Socket.emit("deletePreset", { name: name });
    // //     }
    // // }

    // //
    // //
    // //
    // //
    // //
    // //
    // //
    // //

    // //
    // //
    // //
    // //
    // //
    // //
    // //
    // //

    // // ============================================
    // // Tone - helper QUANT
    // // ============================================
    // toneQuant = () => {
    //     // get time
    //     const now = Tone.TransportTime().valueOf();
    //     // set quantize factor
    //     let factor = 1;
    //     let factorOffset = 0.5;
    //     // get quant time
    //     const quant = Tone.Time(now).quantize(factor);
    //     let playTime = quant;
    //     let timeDifference = 0;
    //     // if (this.debug) console.log(`Tone.now(): ${now}. quant: ${quant}`);
    //     // if transport starts, set quant to 0
    //     if (quant < now) {
    //         playTime = now + factorOffset;
    //         playTime = Tone.Time(playTime).quantize(factor);
    //         timeDifference = playTime - now;
    //         // console.log("quant < now. new calc: ", `now: ${now}, playTime: ${playTime}. quant factor: ${factor}. quant: ${quant}`)
    //     } else timeDifference = quant - now;

    //     if (now == 0) {
    //         playTime = 0;
    //         timeDifference = 0;
    //     } else if (now >= 0 && now <= 0.01) {
    //         playTime = 0.01;
    //         timeDifference = playTime;
    //     }
    //     // safety: if below 0 than playTime is zero
    //     if (playTime < 0) playTime = 0;
    //     if (timeDifference < 0) timeDifference = 0;
    //     //     console.log(`
    //     // quant Tone.TransportTime().valueOf() +${factorOffset}-> now: ${now}/ Tone.now: ${Tone.now()} -
    //     // play at: ${playTime}
    //     // timeDifference playTime - now() : ${timeDifference}
    //     // `);
    //     // return quant playTime
    //     return timeDifference;
    // };
}

export { WelleApp };
