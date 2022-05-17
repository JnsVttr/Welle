import * as Tone from "tone";
import { livecode, semantics } from "/html/ohm/semantic2021";
import { Instrument } from "/js/instrument";
import { parser } from "/js/parser";
import { Socket } from "/index";
import { en, de } from "/js/text";
import { tutorial } from "/js/tutorial";
import WebMidi from "webmidi";
import { App } from "..";

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
    // show envArray
    showEnv = false;

    // debug
    debug = true;

    // general
    user = "local";
    id = "xxx";
    session = [];
    tutorial = false;
    // assign text from file
    english = en;
    german = de;
    language = "en";

    #toneStarted = false;
    bpm = 120;
    // buttons
    buttons = {
        language: {
            valueEN: "english",
            valueDE: "deutsch",
            titleEN: "change language to english",
            titleDE: "ändere Sprache zu deutsch",
        },

        mute: {
            state: true,
            valueENoff: "mute all",
            valueDEoff: "Audio aus",
            titleENoff: "mute all audio output",
            titleDEoff: "Audio stumm",
            valueENon: "unmute all",
            valueDEon: "Audio an",
            titleENon: "unmute all audio output",
            titleDEon: "Audio anschalten",
        },
        muteHelper: {
            state: true,
            valueENoff: "mute helper sounds",
            valueDEoff: "Hilfsklänge aus",
            titleENoff: "mute helper sounds",
            titleDEoff: "Hilfsklänge ausschalten",
            valueENon: "unmute helper sounds",
            valueDEon: "Hilfklänge an",
            titleENon: "unmute helper sounds",
            titleDEon: "Hilfsklänge anschalten",
        },
        muteMetronom: {
            state: true,
            valueENoff: "mute metronom",
            valueDEoff: "Metronom aus",
            titleENoff: "mute metronom",
            titleDEoff: "Metronom ausschalten",
            valueENon: "unmute metronom",
            valueDEon: "Metronom an",
            titleENon: "unmute metronom",
            titleDEon: "Metronom anschalten",
        },
        play: {
            state: false,
            valueoff: "PLAY",
            valueon: "STOP",
            titleoff: "start transport",
            titleon: "stop transport",
        },
        record: {
            state: false,
            valueoff: "RECORD",
            valueon: "STOP RECORD",
            titleoff: "record",
            titleon: "stop record",
        },
        compSave: {
            valueEN: "save composition",
            valueDE: "Komposition speichern",
        },
        compLoad: {
            valueEN: "load composition",
            valueDE: "Komposition laden",
        },
        instDown: {
            valueEN: "download instruments",
            valueDE: "Instrumente speichern",
        },
        instUp: {
            valueEN: "upload instruments",
            valueDE: "Instrumente laden",
        },
    };
    // console
    #consoleInput = "";
    #consolePointer = 0;
    #consoleMaxLength = 1;
    #consoleArray = Array(1).fill({ message: "&nbsp;" });
    #consoleID = "console";
    // sound
    #playSound = true; // bool html
    #playAlerts = false; // bool html
    #playMetronom = false; // bool html
    #alerts = {}; // incoming alerts list from server
    samples = []; // incoming sample list from server
    samplePacks = [];
    currentSamplePack = "default";
    presetData = undefined;
    instruments = []; // create instruments based on the samples list
    activeInstruments = []; // store acivated instruments
    grid = undefined;
    beat = 0;
    parts = {}; // storage for all the saved parts
    toneID = 0;
    configLoopStarted = false;
    // metronom
    metronom1 = undefined;
    metronom2 = undefined;
    createMetronom() {
        this.metronom1 = new Tone.PluckSynth().connect(Instrument.audioOutput);
        this.metronom2 = new Tone.PluckSynth().connect(Instrument.audioOutput);
        // set metronom volume
        this.metronom1.volume.value = -10;
        this.metronom2.volume.value = -20;
    }
    disposeMetronom() {
        this.metronom1.dispose();
        this.metronom2.dispose();
    }

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
    midiEnv = { attack: 0, decay: 0, release: 0 };
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
    tutorialDiv = "c.tutorial";
    // functions
    // map function
    map = (value, x1, y1, x2, y2) => Math.round((((value - x1) * (y2 - x2)) / (y1 - x1) + x2) * 100) / 100;

    //
    // construct "App" and evaluate functions

    constructor() {
        // print some info
        this.printInfo();
        this.createMetronom();

        // set initial BPM and render to Page
        this.setBpm({ bpm: this.bpm });

        // connect audio to Tone master - assign Instrument class masterOut to Tone master
        // Instrument.masterGain.connect(Tone.getDestination());
        Instrument.masterGain.connect(Instrument.audioOutput);
        Instrument.audioOutput.connect(Tone.getDestination());
        Instrument.masterGain.connect(this.recorder);
        // Instrument.playMidiNote = this.playMidiNote;

        // render info + tutorial
        // this.renderExternal();

        // window eventlisteners
        window.addEventListener("load", () => {
            console.log(`Document window loaded.`);
            this.renderConsole();

            // sound
            this.muteApp(!this.#playSound);
            window.document.getElementById(`mute-button`).addEventListener("click", (c) => {
                const val = c.target.value;
                console.log(`mute-button value: ${val}, 
                language: ${this.language}, state: ${this.buttons.mute.state}`);

                if (this.#playSound == true) {
                    this.#playSound = false;
                    this.buttons.mute.state = false;
                    this.muteApp(!this.#playSound);
                } else {
                    this.#playSound = true;
                    this.buttons.mute.state = true;
                    this.muteApp(!this.#playSound);
                }
                if (this.language == "en") {
                    if (this.#playSound) {
                        window.document.getElementById(`mute-button`).value = this.buttons.mute.valueENoff;
                    } else {
                        window.document.getElementById(`mute-button`).value = this.buttons.mute.valueENon;
                    }
                }
                if (this.language == "de") {
                    if (this.#playSound) {
                        window.document.getElementById(`mute-button`).value = this.buttons.mute.valueDEoff;
                    } else {
                        window.document.getElementById(`mute-button`).value = this.buttons.mute.valueDEon;
                    }
                }
            });

            // alerts
            this.handleAlerts(this.#playAlerts);
            window.document.getElementById(`muteHelper-button`).addEventListener("click", (c) => {
                const val = c.target.value;
                console.log(`muteHelper-button value: ${val}, 
                language: ${this.language}, state: ${this.buttons.mute.state}`);

                if (this.#playAlerts == true) {
                    this.#playAlerts = false;
                    this.buttons.muteHelper.state = false;
                    this.handleAlerts(this.#playAlerts);
                } else {
                    this.#playAlerts = true;
                    this.buttons.muteHelper.state = true;
                    this.handleAlerts(this.#playAlerts);
                }
                if (this.language == "en") {
                    if (this.#playAlerts) {
                        window.document.getElementById(`muteHelper-button`).value = this.buttons.muteHelper.valueENoff;
                    } else {
                        window.document.getElementById(`muteHelper-button`).value = this.buttons.muteHelper.valueENon;
                    }
                }
                if (this.language == "de") {
                    if (this.#playAlerts) {
                        window.document.getElementById(`muteHelper-button`).value = this.buttons.muteHelper.valueDEoff;
                    } else {
                        window.document.getElementById(`muteHelper-button`).value = this.buttons.muteHelper.valueDEon;
                    }
                }
            });

            // metronom
            window.document.getElementById(`muteMetronom-button`).addEventListener("click", (c) => {
                const val = c.target.value;
                console.log(`muteMetronom-button value: ${val}, 
                language: ${this.language}, state: ${this.buttons.muteMetronom.state}`);

                if (this.#playMetronom == true) {
                    this.#playMetronom = false;
                    this.buttons.muteMetronom.state = false;
                } else {
                    this.#playMetronom = true;
                    this.buttons.muteMetronom.state = true;
                }
                if (this.language == "en") {
                    if (this.#playMetronom) {
                        window.document.getElementById(`muteMetronom-button`).value =
                            this.buttons.muteMetronom.valueENoff;
                    } else {
                        window.document.getElementById(`muteMetronom-button`).value =
                            this.buttons.muteMetronom.valueENon;
                    }
                }
                if (this.language == "de") {
                    if (this.#playMetronom) {
                        window.document.getElementById(`muteMetronom-button`).value =
                            this.buttons.muteMetronom.valueDEoff;
                    } else {
                        window.document.getElementById(`muteMetronom-button`).value =
                            this.buttons.muteMetronom.valueDEon;
                    }
                }
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

            // save composition
            window.document.getElementById(`compositionSave-button`).addEventListener("click", (c) => {
                this.createPreset("composition");
            });

            // select samplePack
            window.document.getElementById(`selectInstruments`).addEventListener("change", (c) => {
                // console.log(`select samplePack.. ${c.target.value}`);
                this.selectSamplePack(c.target.value);
            });
            window.document.getElementById(`instrumentsDownload-button`).addEventListener("click", (c) => {
                // console.log(`download samplePack > ${this.currentSamplePack}`);
                this.downloadCurrentInstruments();
            });
        });

        this.setLanguage("english");
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

    downloadCurrentInstruments() {
        console.log(`download samplePack > ${this.currentSamplePack}`);
        window.document.getElementById(`downloadLinkSamplePack`).href = `/samplePacks/${this.currentSamplePack}.zip`;
        window.document.getElementById(`downloadLinkSamplePack`).click();
    }

    addSamplePacks(message) {
        let packs = undefined;
        if (message != undefined) {
            if (message.packs != undefined) {
                packs = message.packs;
                packs.forEach((pack) => {
                    this.samplePacks.push(pack);
                });
            }
        }
        if (this.samplePacks.length == packs.length) {
            console.log(`App samplePacks: ${this.samplePacks}`);
            const selectBox = window.document.getElementById("selectInstruments");

            this.samplePacks.map((singlePack) => {
                // console.log(`samplePack: ${singlePack}`);
                let option = document.createElement("option");
                option.text = singlePack;
                selectBox.add(option);
            });
        }
    }
    selectSamplePack(pack) {
        console.log(`okay, select this samplePack: ${pack} at index ${this.samplePacks.indexOf(pack)}`);
        this.deleteAll();
        this.clearSamplePlayer();
        Tone.context.resume();
        console.log("selectSamplePack, check Tone: Tone.Transport.context.state", Tone.Transport.context.state);

        // document.getElementById("selectInstruments").value = this.samplePacks.indexOf(pack);
        document.getElementById("selectInstruments").value = pack;
        setTimeout(() => {
            this.currentSamplePack = pack;
            console.log(`current samplePack: ${this.currentSamplePack}, socket request files`);
            if (pack == "default") Socket.emit("requestSampleFiles");
            else Socket.emit("requestSampleFiles", { samplePack: pack });
            // this.currentSamplePack = pack;
        }, 100);
    }
    getUserSamples(socketID) {
        console.log(`get user samples`);
        this.deleteAll();
        this.clearSamplePlayer();
        Tone.context.resume();
        document.getElementById("selectInstruments").value = "";
        setTimeout(() => {
            this.currentSamplePack = "user";
            console.log(`current samplePack: ${this.currentSamplePack}, socket request files`);
            Socket.emit("requestUserSamples", { id: socketID });
        }, 100);
    }

    clearSamplePlayer() {
        console.log("clear samplePlayer");
        console.log("clear Tone.Transport");
        // Tone.Transport.stop();
        // Tone.Transport.cancel(0);
        // Tone.Transport.clear();
        // Tone.Transport.scheduleRepeat(() => {
        //     // console.log("empty transport");
        // }, "8n");
        // // clear Metronom
        // this.disposeMetronom();

        console.log("clear instruments (buffer, gain, synth)");
        setTimeout(() => {
            Object.keys(this.instruments).forEach((key) => {
                // console.log(`check instrument for reset: `, this.instruments[key]);
                this.instruments[key].buffer.dispose();
                this.instruments[key].gain.dispose();
                this.instruments[key].ampEnv.dispose();
                this.instruments[key].synth.dispose();
                // console.log(`check instrument for reset again: `, this.instruments[key]);
                delete this.instruments[key];
            });
            this.instruments = [];
            console.log("delete, check grid: ", this.grid);
            // this.grid.forEach((key) => {
            //     console.log("delete, check grid[key]: ", this.grid[key], key);
            //     // delete key;
            // });
            for (let i = 0; i < this.grid.length; i++) {
                // console.log("delete, check grid[key]: ", this.grid[i]);
                delete this.grid[i];
            }
            this.grid = undefined;
            console.log("delete, check grid deleted: ", this.grid);
            this.parts = {};
            this.samples = []; // incoming sample list from server
            this.activeInstruments = []; // store acivated instruments
            this.beat = 0;
            console.log(
                `clear samplePlayer, this.instruments: ${this.instruments}. Instrument class audio: `,
                Instrument.audioOutput
            );
            // Instrument.audioOutput.dispose();
            // Instrument.masterGain.dispose();
            // Instrument.audioOutput = new Tone.Gain(0.9); // master output for Tone -> Speaker
            // Instrument.masterGain = new Tone.Gain(0.9);
            Tone.Transport.stop();
            Tone.Transport.cancel(0);
            console.log(`clear by Tone ID ${this.toneID}`);
            Tone.Transport.clear(this.toneID);
            Tone.Transport.scheduleRepeat(() => {
                // console.log("empty transport");
            }, "8n");
            this.configLoopStarted = false;
            // clear Metronom
            this.disposeMetronom();
            this.createMetronom();
            this.renderContent();
        }, 50);
    }

    // ============================================
    // set language
    // ============================================
    setLanguage(lang) {
        if (lang == "english") {
            this.language = "en";
            // set document
            document.documentElement.setAttribute("lang", "en");
            document.getElementById("language-button").value = "deutsch";
            document.getElementById("language-button").title = this.buttons.language.titleDE;
            document.getElementById("compositionSave-button").value = this.buttons.compSave.valueEN;
            document.getElementById("compositionSave-button").title = this.buttons.compSave.valueEN;
            document.getElementById("compositionLoad-button").value = this.buttons.compLoad.valueEN;
            document.getElementById("compositionLoad-button").title = this.buttons.compLoad.valueEN;
            document.getElementById("instrumentsDownload-button").value = this.buttons.instDown.valueEN;
            document.getElementById("instrumentsDownload-button").title = this.buttons.instDown.valueEN;
            document.getElementById("instrumentsUpload-button").value = this.buttons.instUp.valueEN;
            document.getElementById("instrumentsUpload-button").title = this.buttons.instUp.valueEN;
            // change headings
            document.getElementById("h.files").innerHTML = this.english.headings.files;
            document.getElementById("h.settings").innerHTML = this.english.headings.settings;
            document.getElementById("h.transport").innerHTML = this.english.headings.transport;
            document.getElementById("h.instruments").innerHTML = this.english.headings.instruments;
            document.getElementById("h.console").innerHTML = this.english.headings.console;
            document.getElementById("h.parts").innerHTML = this.english.headings.parts;
            document.getElementById("h.instList").innerHTML = this.english.headings.instList;
            // document.getElementById("h.packs").innerHTML = this.english.headings.packs;
            document.getElementById("h.tutorial").innerHTML = this.english.headings.tutorial;
            // change texts
            document.getElementById("c.tutorial").innerHTML = this.english.tutorial;
            document.getElementById("c.info").innerHTML = this.english.info;

            // change buttons
            if (this.#playSound) document.getElementById("mute-button").value = this.buttons.mute.valueENoff;
            else document.getElementById("mute-button").value = this.buttons.mute.valueENon;
            if (this.#playAlerts)
                document.getElementById("muteHelper-button").value = this.buttons.muteHelper.valueENoff;
            else document.getElementById("muteHelper-button").value = this.buttons.muteHelper.valueENon;
            if (this.#playMetronom)
                document.getElementById("muteMetronom-button").value = this.buttons.muteMetronom.valueENoff;
            else document.getElementById("muteMetronom-button").value = this.buttons.muteMetronom.valueENon;
        }
        if (lang == "deutsch") {
            this.language = "de";
            // set document
            document.documentElement.setAttribute("lang", "de");
            document.getElementById("language-button").value = "english";
            document.getElementById("language-button").title = this.buttons.language.titleEN;
            document.getElementById("compositionSave-button").value = this.buttons.compSave.valueDE;
            document.getElementById("compositionSave-button").title = this.buttons.compSave.valueDE;
            document.getElementById("compositionLoad-button").value = this.buttons.compLoad.valueDE;
            document.getElementById("compositionLoad-button").title = this.buttons.compLoad.valueDE;
            document.getElementById("instrumentsDownload-button").value = this.buttons.instDown.valueDE;
            document.getElementById("instrumentsDownload-button").title = this.buttons.instDown.valueDE;
            document.getElementById("instrumentsUpload-button").value = this.buttons.instUp.valueDE;
            document.getElementById("instrumentsUpload-button").title = this.buttons.instUp.valueDE;
            // change headings
            document.getElementById("h.files").innerHTML = this.german.headings.files;
            document.getElementById("h.settings").innerHTML = this.german.headings.settings;
            document.getElementById("h.transport").innerHTML = this.german.headings.transport;
            document.getElementById("h.instruments").innerHTML = this.german.headings.instruments;
            document.getElementById("h.console").innerHTML = this.german.headings.console;
            document.getElementById("h.parts").innerHTML = this.german.headings.parts;
            document.getElementById("h.instList").innerHTML = this.german.headings.instList;
            // document.getElementById("h.packs").innerHTML = this.german.headings.packs;
            document.getElementById("h.tutorial").innerHTML = this.german.headings.tutorial;
            // change texts
            document.getElementById("c.tutorial").innerHTML = this.german.tutorial;
            document.getElementById("c.info").innerHTML = this.german.info;

            // change buttons
            if (this.#playSound) document.getElementById("mute-button").value = this.buttons.mute.valueDEoff;
            else document.getElementById("mute-button").value = this.buttons.mute.valueDEon;
            if (this.#playAlerts)
                document.getElementById("muteHelper-button").value = this.buttons.muteHelper.valueDEoff;
            else document.getElementById("muteHelper-button").value = this.buttons.muteHelper.valueDEon;
            if (this.#playMetronom)
                document.getElementById("muteMetronom-button").value = this.buttons.muteMetronom.valueDEoff;
            else document.getElementById("muteMetronom-button").value = this.buttons.muteMetronom.valueDEon;
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

    addSamples(message) {
        let files = message.files;
        let samplePath = "/audio";
        if (message.path) samplePath = message.path;
        files.map((file) => {
            const name = file.split(".")[0];
            const path = `${samplePath}/${file}`;
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
            this.#alerts[name].player = new Tone.Player(this.#alerts[name].path).connect(Instrument.audioOutput);
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
    muteApp(state) {
        // handleSound
        console.log(`mute App change to: ${state}`);
        // if mute, than var is false:
        this.#playSound = !state;
        if (this.#playSound) {
            Instrument.audioOutput.gain.rampTo(0.9, 0.03);
            Instrument.masterGain.gain.rampTo(0.9, 0.03);
        } else {
            Instrument.audioOutput.gain.rampTo(0, 0.03);
            Instrument.masterGain.gain.rampTo(0, 0.03);
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
                    mute: instrument.getMute(),
                });
            }
            rows.push(row);
        }

        // we now have all rows each containing 16 eighth notes
        return rows;
    };

    configLoop = () => {
        this.configLoopStarted = true;
        const repeat = (time) => {
            // console.log(`beat: ${this.beat}`);
            // update the grid based on changes in the instruments (Sequences, Rand etc.)
            this.grid = this.makeGrid(this.instruments);
            // for each step check how many instruments play a note and play it
            this.grid.forEach((row, index) => {
                const synth = this.instruments[index].synth;
                const name = this.instruments[index].name;
                const ampEnv = this.instruments[index].ampEnv;
                const envSettings = this.instruments[index].envSettings;
                const event = row[this.beat];
                const mute = this.instruments[index].getMute();
                let midiChan = 0;
                let midiTransmit = true;
                if (index < 14) midiChan = index;
                else midiTransmit = false;

                if (mute == false) {
                    if (event.isActive) {
                        // triggerAttackRelease: note, duration time(decay), execute time
                        synth.triggerAttackRelease(event.note, envSettings.decay, time);
                        ampEnv.triggerAttackRelease(envSettings.decay, time);

                        // MIDI - playnote in time
                        if (window.welle.app.MIDIOutput != undefined) {
                            // if midiTransmit = true eg. Midi channel < 14
                            if (midiTransmit) {
                                //const nextEventTime = Tone.Time("@8n").toSeconds() * 1000;
                                // const diffTime = nextEventTime - WebMidi.time;
                                // console.log(`MIDI ${diffTime} = ${nextEventTime} - ${WebMidi.time}`);
                                const diffTime = WebMidi.time - Tone.now() * 1000;
                                const nextEventTime = Tone.Time("@8n").toSeconds() * 1000 + diffTime;

                                this.playMidiNote({
                                    note: event.note,
                                    channel: midiChan,
                                    velocity: this.instruments[index].getVolume(),
                                    duration: 100,
                                    time: nextEventTime, // midiChan short delay for MIDI connection
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
                        this.sendMidiSelectedInstState({ message: this.selected, pins: true });
                    }
                    this.renderInstruments();
                }
            });
            // play alerts metronom
            if (this.#playMetronom == true) {
                if (this.beat == 0) this.metronom1.triggerAttackRelease("C3", "8n", time);
                else this.metronom2.triggerAttackRelease("C5", "8n", time);
            }

            // color the beats in the pattern
            let beatArray = [
                document.getElementsByName("beat0"),
                document.getElementsByName("beat1"),
                document.getElementsByName("beat2"),
                document.getElementsByName("beat3"),
                document.getElementsByName("beat4"),
                document.getElementsByName("beat5"),
                document.getElementsByName("beat6"),
                document.getElementsByName("beat7"),
            ];

            beatArray.forEach((e) => {
                // if (e) e.classList.remove("beatDark");
                if (e) {
                    e.forEach((s) => {
                        if (s) s.classList.remove("beatDark");
                    });
                }
            });
            if (this.beat == 0) {
                if (beatArray[7]) {
                    beatArray[7].forEach((s) => {
                        s.classList.add("beatDark");
                    });
                }
            }
            if (beatArray[this.beat - 1]) {
                beatArray[this.beat - 1].forEach((s) => {
                    s.classList.add("beatDark");
                });
            }

            // update the beat counter
            this.beat = (this.beat + 1) % 8;
            // send MIDI Clock
            const diffTime = WebMidi.time - Tone.now() * 1000;
            const nextEventTime = Tone.Time("@8n").toSeconds() * 1000 + diffTime;
            if (window.welle.app.MIDIOutput != undefined) {
                window.welle.app.MIDIOutput.sendClock({ time: nextEventTime });
            }
        };
        // Tone.Transport.bpm.value = 120;
        this.toneID = Tone.Transport.scheduleRepeat(repeat, "8n");
        console.log("get Tone.Transport ID: ", this.toneID);
        // Tone.Transport.state;
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
            console.log("Tone debug", Tone.Transport.context.state);
        }
        if (Tone.Transport.context.state != "running") {
            Tone.start();
            console.log("Tone debug", Tone.Transport.context.state);
        }
    }
    startTransport() {
        this.beat = 0;
        if (Tone.Transport.state != "started") Tone.Transport.start();
        // send MIDI start
        const diffTime = WebMidi.time - Tone.now() * 1000;
        const nextEventTime = Tone.Time("@8n").toSeconds() * 1000 + diffTime;
        if (window.welle.app.MIDIOutput != undefined) {
            window.welle.app.MIDIOutput.sendStart({ time: nextEventTime });
        }
        // change play button
        document.getElementById("transport-button").value = "STOP";
        document.getElementById("transport-button").classList.add("w3-green");
        document.getElementById("transport-button").classList.add("w3-hover-green");
    }
    stopTransport() {
        if (Tone.Transport.state != "stopped") Tone.Transport.stop();
        // send MIDI stop
        const diffTime = WebMidi.time - Tone.now() * 1000;
        const nextEventTime = Tone.Time("@8n").toSeconds() * 1000 + diffTime;
        if (window.welle.app.MIDIOutput != undefined) {
            window.welle.app.MIDIOutput.sendStop({ time: nextEventTime });
        }
        // change play button
        document.getElementById("transport-button").value = "PLAY";
        document.getElementById("transport-button").classList.remove("w3-green");
        document.getElementById("transport-button").classList.remove("w3-hover-green");
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
        // console.log("setBPM message: ", message);
        if (message.bpm != undefined) {
            // message = bpm, factor
            const bpm = Math.min(440, Math.max(1, message.bpm));
            // if (this.debug) console.log(`BPM math bpm: ${message.bpm}, limit Bpm: ${bpm}`);
            this.bpm = bpm;
            if (message.factor) Tone.Transport.bpm.rampTo(bpm, message.factor);
            else Tone.Transport.bpm.rampTo(bpm, 0.1);
            this.renderBpm();
        } else {
            // console.log("setBPM send to concole");
            this.addToConsole({
                valid: true,
                string: "bpm",
                comment: "",
                return: this.bpm,
            });
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

    // ============================================
    // console sound input
    // ============================================

    assignPattern(message) {
        // console.log(`assignPattern. message: ${JSON.stringify(message)}`);
        console.log(`assignPattern. message:`, message);
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
                    entry.setMute(false);
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
                        entry.setMute(false);
                        // assign random and volume
                        if (message.random != undefined) entry.rand = message.random;
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
        }
        this.renderContent();
    }

    instrumentPreview(message) {
        let list = message.instruments;

        list.forEach((inst) => {
            let instExists = false;
            this.instruments.forEach((entry) => {
                if (inst == entry.name) instExists = true;
            });
            if (instExists) this.playOnce(inst);

            let isPart = false;
            const partName = message.instruments[0];
            // check for parts if only one instrument
            if (message.instruments.length == 1) {
                if (this.parts[partName]) {
                    // console.log(`part ${partName} detected`);
                    isPart = true;
                }
            }
            if (isPart) this.startPart(partName);
            if (!instExists && !isPart) {
                this.addToConsole({
                    valid: false,
                    string: inst,
                    comment: "no such instrument or part",
                });
            }
        });
    }

    stopInstruments(instruments) {
        // validate message instruments input, can be multiple instruments at once
        instruments.forEach((inst) => {
            let valid = false;
            // compare with list of instruments
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    valid = true;
                    entry.setMute(true);
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

    soloInstrument(message) {
        //stopInstruments(instruments)
        let instCreated = false;
        this.instruments.forEach((entry) => {
            this.activeInstruments.forEach((name) => {
                if (entry.name == name) {
                    window.welle.app.stopInstruments([entry.name]);
                }
            });
        });
        this.instruments.forEach((entry) => {
            this.activeInstruments.forEach((name) => {
                if (entry.name == name) {
                    if (name == message.instruments[0]) {
                        this.plainStartInstruments(message);
                        instCreated = true;
                    }
                }
            });
        });

        if (!instCreated) {
            this.addToConsole({
                valid: false,
                string: message.instruments[0],
                comment: "not yet created",
            });
        }
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

    setEnvelope(message) {
        message.instruments.forEach((inst) => {
            let valid = false;
            // compare with list of instruments
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    valid = true;
                    let settings = message;
                    delete settings.instruments;
                    // add limitations 0.01 - 2
                    if (settings.attack < 0.01) settings.attack = 0.01;
                    else if (settings.attack > 1) settings.attack = 1;
                    if (settings.decay < 0.01) settings.decay = 0.01;
                    else if (settings.decay > 1) settings.decay = 1;
                    if (settings.release < 0.01) settings.release = 0.01;
                    else if (settings.release > 1) settings.release = 1;

                    entry.setEnvSettings(message);
                    console.log(
                        `set envelope for inst:${inst} - ${message.attack},${message.decay}, ${message.release}`
                    );
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

    setVolumeRandom(message) {
        console.log("setVolumeRandom message: ", message);
        message.instruments.forEach((inst) => {
            let valid = false;
            // compare with list of instruments
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    valid = true;
                    if (message.volume) entry.setVolume(message.volume);
                    if (message.midi == undefined) {
                        this.setSelected(entry);
                        entry.activate();
                    }
                    entry.setRand(message.random);
                    // entry.rand = message.random;
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
                        this.setSelected(entry);
                        entry.setMute(false);
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
                    this.activeInstruments = this.activeInstruments.filter((item) => item !== entry.name);
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
                    window.welle.app.stopInstruments([entry.name]);
                }
            });
        });

        // now copy the saved info to each actual instrument
        this.instruments.forEach((entry) => {
            this.activeInstruments.forEach((activeName) => {
                if (entry.name == activeName) {
                    const storedInst = this.parts[name].instrumentCollection[entry.name];
                    // only if instrument stored:
                    if (storedInst != undefined) {
                        if (entry.name == storedInst.name) {
                            console.log(`recall inst ${entry.name}, mute: ${storedInst.mute}`);
                            entry.setSequence(storedInst.sequence, storedInst.patternRaw);
                            entry.setPatternRaw(storedInst.patternRaw);
                            entry.setVolume(storedInst.volume);
                            entry.setMute(storedInst.mute);
                            entry.setRand(storedInst.rand);
                            entry.setEnvSettings(storedInst.envSettings);

                            if (entry.getMute() == false) {
                                window.welle.app.plainStartInstruments({
                                    instruments: [entry.name],
                                    random: null,
                                });
                            }
                        }
                    }
                }
            });
        });

        // BPM change - okay, here not activated after start parts
        // this.setBpm({ bpm: this.parts[name].bpm });

        // this.beat = 0;
        // start Tone Transport
        if (Tone.Transport.state != "started") this.startTransport();
        // this.renderParts();
        this.renderInstruments();
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
                else window.document.getElementById(`inst_${inst}`).classList.remove("selectedInst");
            });
        }, 350);
        // this.sendMidiSelectedInstState();

        // midi transfer ongoing is a delay for send midi, and not receiving in the same time
        if (this.midiTransferOngoing == false) {
            if (window.welle.app.MIDIOutput != undefined)
                this.sendMidiSelectedInstState({ message: this.selected, pins: false });
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
            // document.getElementById("mainInput").focus();
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
        const mainInput = document.getElementById("mainInput");
        // console.log(`App render arrows on array length ${length} with dir '${dir}'.
        // pointer: ${this.#consolePointer}
        // pos length - pointer: ${parseInt(length - this.#consolePointer)}
        // array: ${JSON.stringify(this.#consoleArray)}`);
        switch (dir) {
            case "up":
                if (length > 0 && this.#consolePointer < length) {
                    // set HTML
                    mainInput.value = "";
                    const element = this.#consoleArray[length - 1 - this.#consolePointer].message;
                    if (element != "&nbsp;") mainInput.value = element;
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
                    mainInput.value = "";
                    if (this.#consolePointer != 0) {
                        const element = this.#consoleArray[length - this.#consolePointer].message;
                        if (element != "&nbsp;") mainInput.value = element;
                    } else {
                        mainInput.value = "";
                    }
                }
                break;
        }
        setTimeout(function () {
            // set cursor to end of input. In type:email this is forbidden.
            // so change to type:text, set cursor, than back
            mainInput.setAttribute("type", "text");
            let valueLength = mainInput.value.length;
            // console.log(`main input value length: ${valueLength}`);
            mainInput.setSelectionRange(valueLength, valueLength);
            mainInput.setAttribute("type", "email");
        }, 30);
    }
    addToConsole(message) {
        switch (message.valid) {
            case true:
                if (message.string == "") this.playAlert("return");
                if (message.return != undefined) {
                    this.#consoleArray.push({ message: `${message.return}` });
                    setTimeout(() => {
                        this.playAlert("enter");
                    }, 50);
                } else {
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
            // <a id="play_${entry.name}"
            //     title="click to play sound: ${entry.name}" href='#'>${entry.name}</a>
            html += `
            <input
                id="play_${entry.name}"
                class="w3-button w3-round-large buttonSmall"
                type="button"
                value="${entry.name}"
                title="click to play sound ${entry.name}"
            />
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
        let instrumentsThere = false;
        document.getElementById(this.instDiv).innerHTML = "";

        if (this.activeInstruments.length > 0) instrumentsThere = true;

        if (instrumentsThere) {
            const headerHTML = `
                <div id="instHeader" class="instHeadLine">
                    <span class="stateHtml"> </span>
                    <span class="instName">|&nbsp;name</span>
                    <span class="instVol">| volume</span>
                    <span class="instRand">| random</span>
                    <span class="instPattern">| pattern</span>
                </div>`;
            //  <span class="instEnvelope">| &nbsp; ADR envelope</span>
            html += headerHTML;
        }
        // iterate through storedInstruments collection
        this.activeInstruments.forEach((inst) => {
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    // round volume
                    const volume = Math.round(entry.getVolume() * 100) / 100;
                    // sequence
                    let patternArray = entry.getPatternRawArray();
                    const envArray = entry.getEnvSettingsHTML();
                    let sequence = entry.getSequence();
                    let sequenceRender = "";
                    sequence.forEach((e) => {
                        if (e == null) sequenceRender += " - ";
                        else sequenceRender += " " + e + " ";
                    });
                    // checkboxes
                    const isPlaying = !entry.getMute();
                    let checkHtml = "";
                    let stateHtml = ">";
                    if (isPlaying) {
                        checkHtml = 'checked="checked"';
                        stateHtml = ">";
                    } else {
                        stateHtml = ".";
                    }
                    // selected
                    let selHtml = "";
                    if (entry.name == this.selected.name) selHtml += "selectedInst";

                    // create HTML elements for appending
                    const instHtml = `
                    <div id="inst_${entry.name}" class="${selHtml} instLine">
                        <span class="stateHtml">${stateHtml}</span>
                        <span class="instName">| ${entry.name}</span>
                        <span id="vol_${entry.name}" class="instVol">| ${volume}</span>
                        <span id="rand_${entry.name}" class="instRand">| & ${entry.getRand()}</span>
                        
                        `;
                    // <span id="pattern_${entry.name}" class="instPattern">| ${entry.getPatternRaw()}</span>
                    html += instHtml;

                    patternArray.forEach((e, c) => {
                        let part = "";
                        if (c == 0) part += "|&nbsp;&nbsp;";
                        part += `<span name="beat${c}" class="instPatternPart">${e}</span>`;
                        if (c == 7) part += "&nbsp;&nbsp;&nbsp;";
                        html += part;
                    });

                    if (this.showEnv) {
                        envArray.forEach((e, c) => {
                            let add = "";
                            if (c == 0) add += "|&nbsp;&nbsp;";
                            add += `<span class="instPatternPart">${e}</span>`;
                            html += add;
                        });
                    }

                    // const instEnv = `<span id="pattern_${entry.name}" class="instEnvelope">| ${env}</span>

                    html += `</div>`;
                }
            });
        });
        // add html content
        document.getElementById(this.instDiv).insertAdjacentHTML("beforeend", html);
    }

    renderParts() {
        // empty var to store html
        let html = "";

        // iterate through parts collection
        Object.keys(this.parts).forEach((part) => {
            const partHtml = `
                <input
                    type = "button"
                    class = "w3-button w3-round w3-border buttonSmall"
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

    // renderExternal() {
    //     // info text
    //     // document.getElementById(this.#infoDiv).innerHTML = text.info;
    //     // tutorial
    //     let html = tutorial.start;
    //     document.getElementById(this.tutorialDiv).innerHTML = html;
    //     // const checks = document.getElementsByTagName("input");
    //     // console.log("these are the inputs: ", checks);
    //     document.querySelectorAll(".tutorialInput").forEach((item) => {
    //         item.addEventListener("keydown", (e) => {
    //             if (e.code == "Enter") {
    //                 window.welle.app.tutorial = true;
    //                 const input = item.value.toLowerCase();
    //                 console.log(`message from tutorial input: ${input}`);
    //                 window.welle.app.handleMainInput(input);
    //                 item.value = "";
    //                 setTimeout(() => {
    //                     window.welle.app.handleMainInput("/");
    //                 }, 3000);
    //             }
    //         });
    //     });
    // }

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
            if (document.getElementById("downloadFile") != null) document.getElementById("downloadFile").remove();
            window.document.getElementById("file").innerHTML = "recording ...";
            if (window.document.getElementById("file").innerHTML != "") {
                console.log(`id file not empty..`);
                this.recording = undefined;
            }

            window.document.getElementById("rec-button").value = "RECORD STOP";
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
                ).innerHTML = `<a id="downloadFile" title="click to download recorded audio file" href="#">download welle.webm</a>`;
                document.getElementById("file").classList.add("w3-text-green");
                document.getElementById("downloadFile").addEventListener("click", (c) => {
                    console.log(`file link clicked. date: ${new Date()}`);
                    const recording = window.welle.app.getRecording();
                    const url = URL.createObjectURL(recording);
                    const anchorSound = document.createElement("a", { href: url, type: "audio/mp3" });
                    anchorSound.download = "welle.webm";
                    anchorSound.href = url;
                    document.body.append(anchorSound);
                    anchorSound.click();
                    anchorSound.remove();
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
        let nextTime = message.time;
        // console.log("MIDI message: " + [note, chan, vel, dur, nextTime]);

        // if MIDI device is connected
        if (window.welle.app.MIDIOutput != undefined) {
            // console.log(`play MIDI note ${note}`);
            window.welle.app.MIDIOutput.playNote(note, chan, {
                velocity: vel,
                duration: dur,
                time: nextTime,
            });
            // window.welle.app.MIDIOutput.stopNote(note, chan, {
            //     velocity: 0,
            //     time: nextTime + 10,
            // });
            // setTimeout(() => {
            //     window.welle.app.MIDIOutput.stopNote(note, chan, {
            //         velocity: vel,
            //     });
            // }, nextTime + 20);
        }
    }

    sendMidiSelectedInstState(content) {
        const message = content.message;
        const pinsOnly = content.pins;
        // send message to MIDI, channels defined in class variables midiChanInput 15, midiChanOutput 16
        if (window.welle.app.MIDIInput != undefined) {
            console.log(`Send MIDI Message: `, message);
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
            if (!pinsOnly) {
                window.welle.app.MIDIOutput.sendControlChange(
                    9, // cc controller
                    vol, // CC value
                    this.midiChanOutput // channel
                );
            }

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
            // how to scale messages 0.01 - 2 --> 0 - 126 == *
            // how to scale messages 0.01 - 1 --> 0 - 126 == * 126

            const env = [message.env.attack, message.env.decay, message.env.release];
            const newEnv = [];

            env.forEach((e) => {
                const val = Math.round(e * 126);
                if (val < 127) newEnv.push(val);
                else newEnv.push(126);
            });

            newEnv.map((e, c) => {
                const cc = 16 + c;
                if (!pinsOnly) window.welle.app.MIDIOutput.sendControlChange(cc, e, this.midiChanOutput);
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

                    if (window.welle.app.selected) window.welle.app.selected.vol = vol;
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

                    // replace existing sequence
                    // if input is null, overwrite
                    if (val == 0) sequence[index] = null;
                    // else only overwrite if steps has been empty
                    else if (sequence[index] == null) sequence[index] = "C3";

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

                // ENVELOPE
                if (cc >= 16 && cc <= 18) {
                    const index = cc - 16;
                    const envVal = Math.round((val / 126) * 100) / 100;
                    window.welle.app.midiCountEnv = window.welle.app.midiCountEnv + 1;
                    // let envIncoming = { attack: undefined, decay: undefined, release: undefined };

                    if (index == 0) window.welle.app.midiEnv.attack = envVal;
                    if (index == 1) window.welle.app.midiEnv.decay = envVal;
                    if (index == 2) window.welle.app.midiEnv.release = envVal;

                    if (window.welle.app.midiCountEnv == 3) {
                        window.welle.app.midiCountEnv = 0;

                        window.welle.app.setEnvelope({
                            instruments: [selected.name],
                            attack: window.welle.app.midiEnv.attack,
                            decay: window.welle.app.midiEnv.decay,
                            release: window.welle.app.midiEnv.release,
                            midi: true,
                        });
                        console.log(
                            `MIDI input (${selected.name}) env: ${window.welle.app.midiEnv.attack}, ${window.welle.app.midiEnv.decay},  ${window.welle.app.midiEnv.release}`
                        );
                    }
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

    // ============================================
    // MULTI USER SESSION
    // ============================================

    updateUsers(users) {
        if (this.user != "local") {
            this.session = [];
            this.session = users;
        }
        this.renderContent();
    }
    setUser(name) {
        this.user = name;
        this.session.push(name);
        console.log(`new user name: ${name}`);
        // this.renderSession();
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
    // presets
    // ============================================

    createPreset(name) {
        const preset = {
            name: name,
            bpm: this.bpm,
            samplePack: this.currentSamplePack,
            parts: this.parts,
            activeInstruments: [],
        };
        // iterate through storedInstruments collection
        // mute, name, volume, pattern, patternRaw, sequence, random
        this.activeInstruments.forEach((inst) => {
            this.instruments.forEach((entry) => {
                if (entry.name == inst) {
                    const name = entry.name;
                    const mute = entry.getMute();
                    const volume = Math.round(entry.getVolume() * 100) / 100;
                    const rand = entry.getRand();
                    const sequence = entry.getSequence();
                    const pattern = entry.getPattern();
                    const rawPattern = entry.getPatternRaw();

                    const content = {
                        name: name,
                        mute: mute,
                        rand: rand,
                        volume: volume,
                        sequence: sequence,
                        pattern: pattern,
                        rawPattern: rawPattern,
                    };
                    preset.activeInstruments.push(content);
                }
            });
        });
        console.log(`preset >${name}: `, preset);
        Socket.emit("storePreset", { name: name, preset: preset });
    }

    //
    //
    //

    loadPreset(message) {
        console.log("=======================");
        console.log(`App load preset: "${message.name}"`, message);
        this.presetData = message;
        this.muteApp(true);
        setTimeout(() => {
            this.muteApp(false);
        }, 800);
        // // first delete all:
        // // this.deleteAll();
        if (this.presetData.samplePack == "user") message.samplePack = undefined;

        // init all
        if (message.samplePack) {
            console.log(`sample pack assigned in preset: ${message.samplePack}`);
            this.selectSamplePack(message.samplePack);
        } else {
            console.log(`no sample pack assigned in preset`);
            this.initPresetData(this.presetData);
        }
        // set BPM
        this.setBpm({ bpm: message.bpm });

        // clear screen
        // this.renderContent();
    }

    initPresetData(message) {
        // assign parts:
        this.parts = message.parts;
        // init message for sample creation
        let initMessage = {};
        message.activeInstruments.forEach((inst) => {
            console.log("loadPrest for", inst, inst.name);
            this.instruments.forEach((entry) => {
                if (inst.name == entry.name) {
                    initMessage.instruments = [inst.name];
                    initMessage.pattern = inst.pattern;
                    initMessage.random = inst.random;
                    initMessage.volume = inst.volume;
                    initMessage.rawPattern = inst.rawPattern;
                    console.log("loadPrest initMessage: ", initMessage);
                    this.assignPattern(initMessage);
                    if (inst.mute) entry.setMute(true);
                }
            });
        });
        this.stopAll();
        this.renderContent();
        // reset presetData var
        this.presetData = undefined;
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
