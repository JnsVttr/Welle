import * as Tone from "tone";

// INSTRUMENT CLASS
// ===================================================================
// main logic for all instrument related stuff. is cleaning the main code immensively

class Instrument {
    // STATIC DEFAULTS - set default properties
    // ================================================
    // can be accessed (get/set) from outside as:  ClassName.property
    // from inside the class. in 'static' scope as this.property, else as ClassName.property
    static baseNoteDefault = 16; // midi notes from lowest 0 upwards
    static transposeDefault = 2; // default transpose
    static samplePathDefault = "../data/defaultSample"; // default sample path, needs review
    static typeDefault = "MembraneSynth"; // default synth type = Sampler
    static gainDefault = 0.6;
    static patternDefault = [0]; // default = one hit
    static masterGain = new Tone.Gain(0.8); // master output for Tone -> Speaker
    static buffers = {}; // place for ToneBuffers

    // CONSTRUCTOR - executed with every new instance
    // ================================================
    constructor(message) {
        // define properties every new Instrument will have
        // this._synthType = Instrument.typeDefault;
        // create tone elements: synth -> gain -> masterOut
        // the synth creates the sound
        console.log(`new Instrument with message: 
        ${JSON.stringify(message)}`);

        this._name = message.name;
        this._isPlaying = false;
        this._synth = undefined;
        this._sequence = undefined;
        this._ticks = 0;
        this.measure = "8n";
        this._rand = message.random || 0;
        this._rawPattern = message.rawPattern || "#";
        this._preset = {};

        // if new instrument is in presets list get content from static stored presets
        if (message.type == "preset") this._preset = message.preset;
        // check if new name = a sample folder
        if (message.type == "sampler") {
            // apply settings for sampler to instrument
            this._preset = message.preset;
            // console.log(`sample URL: ${message.sample.file[0][1]}`);
            this._sampleUrl = message.sample.file[0][1];
        }

        // set synth settings from Instrument default settings(type)
        this._settings = this._preset.settings;
        this._transpose = this._preset.transpose;
        this._baseNote = this._preset.baseNote;
        this._type = this._preset.synthType;
        this._volume = message.volume || this._preset.gain * this._preset.volume;
        // pattern
        this.pattern = message.pattern || Instrument.patternDefault;
        // transform to MIDI pattern. maybe not even neccessary..
        this.midiPattern = this.#translatePatternToMidi(this.pattern);
        // make a trigger function based on preset values
        this._triggerFunction = new Function(
            this._preset.triggerFunction.arguments,
            this._preset.triggerFunction.body
        );
        this._gain = new Tone.Gain(Instrument.gainDefault);
        // connect this synth to master Gain node
        this._gain.connect(Instrument.masterGain);
        this.setVolume(this._volume);

        // STARTING
        // =============
        // start instrument - if preset, than immediately
        if (message.type == "preset") this.#createPreset();
        // start sampler, on Buffer callback
        if (message.type == "sampler") {
            this._buffer = Instrument.buffers[this._name];
            this.#createSampler();
            this.printInfo();
        }
        this.printInfo();
    }

    printInfo() {
        console.log(`
        Instrument: 
        name: ${this._name}
        type: ${this._type}
        isPlaying: ${this._isPlaying}
        pattern: ${this.pattern}
        rawPattern: ${this._rawPattern}
        midiPattern: ${this.midiPattern}
        random: ${this._rand}
        `);
    }

    // PUBLIC FUNCTIONS - to use inside, prepend a 'this.'
    // ====================================================
    start() {
        this._sequence.start(this.#quant(), 0);
        this._isPlaying = true;
        this._ticks = 0;
    }

    restart() {
        // console.log("Tone.now()", Tone.now());
        if (this._isPlaying) this._sequence.stop(Tone.now());
        this._sequence.clear();
        this._ticks = 0;
        this.#initSequence();
        this.start();
    }

    stop(quant) {
        // console.log("stop() quant: ", quant);
        if (quant == undefined) this._sequence.stop(); // stop just before next quant
        if (quant != undefined) this._sequence.stop(quant); // stop just before next quant
        this._isPlaying = false;
        this._ticks = 0;
        // console.log("this._sequence.state: ", this._sequence.state);
    }

    clear() {
        if (this._isPlaying) this._sequence.stop();
        this._sequence.clear();
        // this._rawPattern = [];
        // this.midiPattern = [];
        this._isPlaying = false;
        this._ticks = 0;
    }

    // GETTER & SETTER - only one value each
    // =========================================
    get isPlaying() {
        return this._isPlaying;
    }
    set isPlaying(state) {
        this._isPlaying = state;
    }
    get sequence() {
        return this._sequence;
    }
    set sequence(dummy) {
        //
    }
    get random() {
        return this._rand;
    }
    set random(random) {
        this._rand = random;
    }

    getVolume() {
        return this._volume;
    }

    getPattern() {
        return this.pattern;
    }
    getRawPattern() {
        return this._rawPattern;
    }
    setPattern(pattern, rawPattern) {
        this._rawPattern = rawPattern || "";
        this.pattern = pattern;
        this.midiPattern = this.#translatePatternToMidi(this.pattern);
        if (this._isPlaying) this._sequence.stop();
        this._ticks = 0;
        this.#initSequence();
        this.start();
        this._isPlaying = true;
    }

    setVolume(volume) {
        if (volume > 1) volume = 1;
        this._volume = volume;
        this._gain.gain.rampTo(this._volume, 0.1);
        // console.log(`this._gain.gain: ${this._gain}, this._volume: ${this._volume}`);
    }
    name() {
        return this._name;
    }
    volume() {
        return this._volume;
    }
    rawPattern() {
        return this._rawPattern;
    }

    // PRIVATE FUNCTIONS - start with #
    // =========================================
    #createPreset() {
        // create Synth
        this.#initSynth();
        this._synth.connect(this._gain);
        // create sequence - the sequence calls the synth at time+note defined by the pattern
        this.#initSequence();
        this.start();
        this._isPlaying = true;
    }

    #createSampler() {
        this._settings.C3 = this._buffer;
        // create Synth
        this.#initSynth();
        this._synth.connect(this._gain);
        // create sequence - the sequence calls the synth at time+note defined by the pattern
        this.#initSequence();
        this.start();
        this._isPlaying = true;
    }

    // init synth
    #initSynth = () => {
        this._synth = new Tone[this._type](this._settings);
    };

    // init a sequence
    #initSequence = () => {
        this._ticks = 0;
        this._sequence = new Tone.Sequence(this.#callbackSequence, this.midiPattern, "16n"); // '8n' == speed, eight bars/second
    };
    // callback for sequence
    #callbackSequence = (time, note) => {
        this._triggerFunction(this._synth, note, time);
        this._ticks++;
        if (this._rand > 0) {
            if (this._ticks % (this.midiPattern.length * this._rand) == 0) {
                // console.log("rand: ", this._rand);
                this.#createRandomPattern();
            }
        }
    };

    #createRandomPattern() {
        // console.log("new sequence cylce (seq * rand)");
        // console.log("this._sequence: ", this._sequence.events[0]);
        let length = this.pattern.length;
        let pattern = [];
        for (let i = 0; i < length; i++) {
            // console.log("this._sequence.events[i]", this._sequence.events[i]);
            pattern.push(this._sequence.events[i]);
            // console.log("pattern: ", pattern);
        }
        for (var i = length - 1; i >= 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i + 1));
            let itemAtIndex = pattern[randomIndex];
            pattern[randomIndex] = pattern[i];
            pattern[i] = itemAtIndex;
        }
        // console.log("pattern randomized: ", pattern);
        this._sequence.set({ events: pattern });
        this.midiPattern = pattern;
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
                note = note + this._baseNote;
                // console.log("changed note+baseNote", note);
                // transpose note
                if (this._transpose < 0) note -= this._transpose;
                if (this._transpose > 0) note += this._transpose;
                // console.log("transpose", this._transpose);
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
