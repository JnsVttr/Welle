import * as Tone from "tone";
import WebMidi from "webmidi";
import { App } from "/index";

// INSTRUMENT CLASS
// ===================================================================
// main logic for all instrument related stuff. is cleaning the main code immensively

class Instrument {
    // STATIC DEFAULTS - set default properties
    // ================================================
    // can be accessed (get/set) from outside as:  ClassName.property
    // from inside the class. in 'static' scope as this.property, else as ClassName.property
    static baseNoteDefault = 24; // midi notes from lowest 0 upwards
    static transposeDefault = 2; // default transpose
    static typeDefault = "MembraneSynth"; // default synth type = Sampler
    static gainDefault = 0.6;
    static patternDefault = [0]; // default = one hit
    static masterGain = new Tone.Gain(0.8); // master output for Tone -> Speaker
    static buffers = {}; // place for ToneBuffers
    static playMidiNote = undefined;
    static presetSampler = {
        synthType: "Sampler",
        gain: 1,
        volume: 0.6,
        baseNote: 48,
        transpose: 0,
        triggerFunction: {
            arguments: "_synth, _note, _time",
            body: `_synth.triggerAttack(_note, '@16n');`,
        },
        settings: {
            C3: "./audio/hit/hit.mp3",
        },
    };

    name = "Synth";
    isPlaying = false;
    midiChan = 1;
    envSettings = {
        attack: 0.1,
        decay: 0.1,
        sustain: 0.2,
        release: 0.01,
    }; // attk, dec, sus, rel
    #pattern = Instrument.patternDefault;
    #synth = undefined;
    #envelope = [];
    #eqSettings = {
        high: 0,
        highFrequency: 5000,
        mid: 0,
        lowFrequency: 400,
        low: 0,
    };
    #eq = new Tone.EQ3();
    #sequence = undefined;
    #ticks = 0;
    #rand = 0;
    #rawPattern = "#";
    #midiPattern = ["C3"];
    #preset = Instrument.presetSampler;
    #settings = this.#preset.settings;
    #transpose = this.#preset.transpose;
    #type = this.#preset.synthType;
    #baseNote = this.#preset.baseNote;
    #triggerFunction = new Function(
        this.#preset.triggerFunction.arguments,
        this.#preset.triggerFunction.body
    );
    #volume = this.#preset.gain * this.#preset.volume;
    #gain = new Tone.Gain(Instrument.gainDefault);
    #sampleUrl = "";
    #buffer = "";

    // CONSTRUCTOR - executed with every new instance
    // ================================================
    constructor(message) {
        // define properties every new Instrument will have
        // this.#synthType = Instrument.typeDefault;
        // create tone elements: synth -> gain -> masterOut
        // the synth creates the sound
        // console.log(`new Instrument with message:
        // ${JSON.stringify(message)}
        // `);

        this.name = message.name;
        this.assignMidiChan(this.name);
        this.#rand = message.random || 0;
        this.#volume = message.volume || this.#volume;

        // if new instrument is in presets list get content from static stored presets
        if (message.type == "preset") {
            this.#preset = message.preset;
            this.#settings = message.preset.settings;
            this.#transpose = message.preset.transpose;
            this.#baseNote = this.#preset.baseNote;
            this.#type = message.preset.synthType;
            this.#triggerFunction = new Function(
                message.preset.triggerFunction.arguments,
                message.preset.triggerFunction.body
            );
        }

        // check if new name = a sample folder
        if (message.type == "sampler") this.#sampleUrl = message.sample.file[0][1];

        // pattern
        this.#pattern = message.pattern || this.#pattern;
        this.#rawPattern = message.rawPattern || this.#rawPattern; // #-1#2#1#2#---
        this.#midiPattern = this.#translatePatternToMidi(this.#pattern);

        // connect this synth to master Gain node
        this.#gain.connect(Instrument.masterGain);
        this.setVolume(this.#volume);

        // STARTING
        // =============
        // start instrument - if preset, than immediately
        if (message.type == "preset") this.#createPreset();
        // start sampler, on Buffer callback
        if (message.type == "sampler") {
            this.#buffer = Instrument.buffers[this.name];
            this.#createSampler();
            // this.printInfo();
        }
        // this.printInfo();
        this.constantLog();
    }

    printInfo() {
        console.log(`
        Instrument: 
        name: ${this.name}
        type: ${this.#type}
        isPlaying: ${this.isPlaying}
        pattern: ${this.#pattern}
        rawPattern: ${this.#rawPattern}
        midiPattern: ${this.#midiPattern}
        random: ${this.#rand}
        basenote: ${this.#baseNote}
        `);
    }
    constantLog() {
        const logEvent = new Tone.ToneEvent((time, chord) => {
            // console.log(`loop to display or send data ${time}`);
        });
        logEvent.start();
        // loop it every measure for 8 measures
        logEvent.loop = true;
        logEvent.loopEnd = "32n";
    }

    assignMidiChan(name) {
        switch (name) {
            case "kick":
                this.midiChan = 1;
                break;
            case "snare":
                this.midiChan = 2;
                break;
            case "hh":
                this.midiChan = 3;
                break;
            case "bass":
                this.midiChan = 4;
                break;
            case "string":
                this.midiChan = 5;
                break;
            case "hit":
                this.midiChan = 6;
                break;
            case "fx":
                this.midiChan = 7;
                break;
        }
    }

    // PUBLIC FUNCTIONS - to use inside, prepend a 'this.'
    // ====================================================
    start() {
        this.#sequence.start(this.#quant(), 0);
        this.isPlaying = true;
        this.#ticks = 0;
    }

    restart() {
        // console.log("Tone.now()", Tone.now());
        if (this.isPlaying) this.#sequence.stop(Tone.now());
        this.#sequence.clear();
        this.#ticks = 0;
        this.#initSequence();
        this.start();
    }

    stop(quant) {
        // console.log("stop() quant: ", quant);
        if (quant == undefined) this.#sequence.stop(); // stop just before next quant
        if (quant != undefined) this.#sequence.stop(quant); // stop just before next quant
        this.isPlaying = false;
        this.#ticks = 0;
        // console.log("this.#sequence.state: ", this.#sequence.state);
    }

    clear() {
        if (this.isPlaying) this.#sequence.stop();
        this.#sequence.clear();
        // this.#rawPattern = [];
        // this.#midiPattern = [];
        this.isPlaying = false;
        this.#ticks = 0;
    }

    // GETTER & SETTER - only one value each
    // =========================================
    get isPlaying() {
        return this.isPlaying;
    }
    set isPlaying(state) {
        this.isPlaying = state;
    }

    get random() {
        return this.#rand;
    }
    set random(random) {
        this.#rand = random;
    }

    getPattern() {
        return this.#pattern;
    }
    getRawPattern() {
        return this.#rawPattern;
    }
    setPattern(pattern, rawPattern) {
        this.#rawPattern = rawPattern || "";
        this.#pattern = pattern;
        this.#midiPattern = this.#translatePatternToMidi(this.#pattern);
        if (this.isPlaying) this.#sequence.stop();
        this.#ticks = 0;
        this.#initSequence();
        this.start();
        this.isPlaying = true;
    }
    getVolume() {
        return this.#volume;
    }
    setVolume(volume) {
        if (volume > 1) volume = 1;
        this.#volume = volume;
        this.#gain.gain.rampTo(this.#volume, 0.1);
    }
    getEq() {
        return this.#eqSettings;
    }
    setEq(message) {
        this.#eqSettings.high = message.high;
        this.#eqSettings.highFrequency = message.highFrequency;
        this.#eqSettings.mid = message.mid;
        this.#eqSettings.lowFrequency = message.lowFrequency;
        this.#eqSettings.low = message.low;
        this.#eq.set(this.#eqSettings);
    }
    getEnv() {
        return this.envSettings;
    }
    setEnv(message) {
        if (this.#type != "Sampler") {
            // no envelope at Samplers
            this.envSettings.attack = message.attack;
            this.envSettings.decay = message.decay;
            this.envSettings.sustain = message.sustain;
            this.envSettings.release = message.release;

            this.#synth.envelope.attack = this.envSettings.attack;
            this.#synth.envelope.decay = this.envSettings.decay;
            this.#synth.envelope.sustain = this.envSettings.sustain;
            this.#synth.envelope.release = this.envSettings.release;
        }
    }

    // PRIVATE FUNCTIONS - start with #
    // =========================================
    #createPreset() {
        // create Synth
        this.#initSynth();
        // this.#synth.connect(this.#gain);
        this.#synth.connect(this.#eq);
        this.#eq.connect(this.#gain);
        // create sequence - the sequence calls the synth at time+note defined by the pattern
        this.#initSequence();
        this.start();
        this.isPlaying = true;
    }

    #createSampler() {
        this.#settings.C3 = this.#buffer;
        // create Synth
        this.#initSynth();
        // this.#synth.connect(this.#gain);
        this.#synth.connect(this.#eq);
        this.#eq.connect(this.#gain);
        // create sequence - the sequence calls the synth at time+note defined by the pattern
        this.#initSequence();
        this.start();
        this.isPlaying = true;
    }

    // init synth
    #initSynth = () => {
        this.#synth = new Tone[this.#type](this.#settings);
        this.#synth.attack = 0.01;
    };

    // init a sequence
    #initSequence = () => {
        this.#ticks = 0;
        this.#sequence = new Tone.Sequence(this.#callbackSequence, this.#midiPattern, "16n"); // '8n' == speed, eight bars/second
    };
    // callback for sequence
    #callbackSequence = (time, note) => {
        this.#triggerFunction(this.#synth, note, time);
        this.#ticks++;
        // random
        const events = this.#midiPattern.filter((x) => x); // (filter(x => x)) removes undefined/null/NaN from array
        const patternTicks = events.length;
        if (this.#rand > 0) {
            if (this.#ticks % (patternTicks * this.#rand) == 0) {
                // console.log("rand: ", this.#rand);
                this.#createRandomPattern();
            }
        }
        // MIDI
        const diffTime = WebMidi.time - Tone.now() * 1000;
        const midiTime = Tone.Time("@16n").toSeconds() * 1000;
        const toneDiff = Tone.now() - midiTime + this.midiChan * 10;
        const chanDelay = this.midiChan * 7;
        const sendTime = midiTime + diffTime + chanDelay + 500;

        Instrument.playMidiNote({
            note: note,
            channel: this.midiChan,
            velocity: this.#volume,
            duration: 10,
            time: sendTime, // midiChan short delay for MIDI connection
        });

        // setTimeout(() => {
        //     App.MIDIOutput.playNote(note, this.midiChan, {
        //         time: sendTime,
        //         velocity: this.#volume,
        //         duration: 200,
        //     });
        // }, toneDiff);

        // console.log(`
        // :::midiTime: ${midiTime}
        // ::send time: ${sendTime}
        // webMidiTime: ${WebMidi.time}
        // :::Tone.now: ${Tone.now() * 1000}
        // :::diffTime: ${diffTime}
        // :chan Delay: ${chanDelay}
        // :::toneDiff: ${toneDiff}
        //         `);
    };

    #createRandomPattern() {
        // console.log("new sequence cylce (seq * rand)");
        // console.log("this.#sequence: ", this.#sequence.events[0]);
        let length = this.#pattern.length;
        let pattern = [];
        for (let i = 0; i < length; i++) {
            // console.log("this.#sequence.events[i]", this.#sequence.events[i]);
            pattern.push(this.#sequence.events[i]);
            // console.log("pattern: ", pattern);
        }
        for (var i = length - 1; i >= 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i + 1));
            let itemAtIndex = pattern[randomIndex];
            pattern[randomIndex] = pattern[i];
            pattern[i] = itemAtIndex;
        }
        // console.log("pattern randomized: ", pattern);
        this.#sequence.set({ events: pattern });
        this.#midiPattern = pattern;
    }

    // translate pattern [0, 1, 2, -4] to midi pattern ['C1', 'A2']. based on basenote/ transpose
    #translatePatternToMidi = (pattern) => {
        let _midiPattern = [];
        for (let i = 0; i < pattern.length; i++) {
            let note = pattern[i];
            // if note is a rest, push as 'null', else calculate midi notes
            if (note == null) _midiPattern.push(note);
            else {
                // console.log("changed note", note);
                note = note + this.#baseNote;
                // console.log("changed note+baseNote", note);
                // transpose note
                if (this.#transpose < 0) note -= this.#transpose;
                if (this.#transpose > 0) note += this.#transpose;
                // console.log("transpose", this.#transpose);
                // console.log("note after transpose: ", note);
                // set notes from pattern note
                note = Tone.Frequency(note, "midi").toNote();
                // console.log("changed note+baseNote to Freq", note);
                _midiPattern.push(note);
            }
        }
        return _midiPattern;
    };

    // get quant
    #quant = () => {
        // get time
        let now = Tone.TransportTime().valueOf();
        // set quantize factor
        let factor = 1;
        // get quant time
        let quant = Tone.Time(now).quantize(factor);
        let playTime = quant;

        // console.log(`now: ${now}. quant factor: ${factor}. quant: ${quant}`);

        // if transport starts, set quant to 0
        if (now == 0) {
            playTime = 0;
        } else if (now >= 0 && now <= 0.01) {
            playTime = 0.01;
        } else if (quant < now) {
            playTime = now + 0.5;
            playTime = Tone.Time(playTime).quantize(factor);
            // console.log("quant < now. new calc: ", `now: ${now}, playTime: ${playTime}. quant factor: ${factor}. quant: ${quant}`)
        }
        // console.log(`now: ${now} - play at: ${playTime}`);

        // safety: if below 0 than playTime is zero
        if (playTime < 0) playTime = 0;
        // return quant playTime
        return playTime;
    };
}

export { Instrument };
