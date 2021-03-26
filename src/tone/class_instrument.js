import * as Tone from 'tone';



// INSTRUMENT CLASS
// ===================================================================
// main logic for all instrument related stuff. is cleaning the main code immensively

class Instrument {

    // STATIC DEFAULTS - set default properties 
    // ================================================
    // can be accessed (get/set) from outside as:  ClassName.property
    // from inside the class. in 'static' scope as this.property, else as ClassName.property
    static baseNoteDefault = 16;                    // midi notes from lowest 0 upwards
    static transposeDefault = 2;                    // default transpose
    static samplePathDefault = '../data/defaultSample'; // default sample path, needs review
    static typeDefault = 'MembraneSynth';           // default synth type = Sampler
    static gainDefault = 0.6;
    static patternDefault = [0];                    // default = one hit
    static masterGain = new Tone.Gain(0.98);        // master output for Tone -> Speaker
    static bpm = 120;                               // bpm
    static list = [];                               // list of possible instrument names
    static listSamplers = [];                       // list of all sample folders
    static listAll = [];                            // list of all
    static presets = {};                            // settings for different instrument names
    static bufferDefault = undefined;               // placeholder default buffer
    static files = {};                              // all sample files + URLs  on server


    // CONSTRUCTOR - executed with every new instance
    // ================================================
    constructor(name, pattern, rawPattern) {

        // define properties every new Instrument will have
        // this._synthType = Instrument.typeDefault;       
        // create tone elements: synth -> gain -> masterOut
        // the synth creates the sound

        this._name = name;
        this._isPlaying = false;
        this._synth = undefined;
        this._sequence = undefined;
        this._ticks = 0;
        this.measure = '8n';
        this._rawPattern = rawPattern  || '#';
        this._preset = {};
        this._fileIndex = 0;
        this._buffer = Instrument.bufferDefault;

        // if new instrument is in presets list get content from static stored presets
        if (Instrument.list.includes(this._name)) {
            this._preset = Instrument.presets[this._name];
            this._settings = this._preset.settings;   
        }
        // else check if new name = a sample folder
        else if (Instrument.listSamplers.includes(this._name)) {
            // console.log("detected sampler");
            // apply settings for sampler to instrument
            this._preset = Instrument.presets['sampler'];
            this._settings = this._preset.settings;   
            // get the URL for the sample:
            for (let entry in Instrument.files) {
                if (entry == this._name) {
                    // console.log('entry found', Instrument.files[entry][0][1]);
                    this._sampleUrl = Instrument.files[entry][this._fileIndex][1]; 
                    // assign buffer to setting before buffer is actually loaded
                    this._settings.C3 = this._buffer;
                    // this._settings.C3 = this._sampleUrl;
                }
            };
        }
        
        // set synth settings from Instrument default settings(type)
        this._transpose = this._preset.transpose;
        this._baseNote = this._preset.baseNote;
        this._type = this._preset.synthType;
        this._volume = this._preset.gain * this._preset.volume;
        // pattern
        this.pattern = pattern || Instrument.patternDefault;
        // transform to MIDI pattern. maybe not even neccessary..
        this.midiPattern = this.#translatePatternToMidi(this.pattern); 
        // make a trigger function based on preset values
        this._triggerFunction = new Function(this._preset.triggerFunction.arguments, this._preset.triggerFunction.body);
        this._gain = new Tone.Gain(Instrument.gainDefault);
        // connect this synth to master Gain node
        this._gain.connect(Instrument.masterGain);   
        this.#setVolume();

        // STARTING
        // =============
        // start instrument - if preset, than immediately
        if (Instrument.list.includes(this._name)) {
            this.#createPreset();
        }
        // start sampler, on Buffer callback
        else if (Instrument.listSamplers.includes(this._name)) {
            this._buffer = new Tone.ToneAudioBuffer(this._sampleUrl, () => {
                // console.log("buffer loaded");
                this.#createSampler();
            });
        }
    }
    


    // PUBLIC FUNCTIONS - to use inside, prepend a 'this.'
    // ====================================================
    start (){
        this._sequence.start(this.#quant(), 0);
        this._isPlaying = true;
    }

    restart (){
        // this._sequence.stop();
        // this._sequence.clear();
        this.#initSequence();
        this.start();
        this._isPlaying = true;
    }
    
    stop (quant){
        // console.log("stop() quant: ", quant);
        if (quant==undefined) this._sequence.stop(); // stop just before next quant
        if (quant!=undefined) this._sequence.stop(quant); // stop just before next quant
        this._isPlaying = false;
        // console.log("this._sequence.state: ", this._sequence.state);
    }

    setPattern (pattern, rawPattern) {
        this._rawPattern = rawPattern  || '';
        this.pattern = pattern;
        this.midiPattern = this.#translatePatternToMidi(this.pattern);
        this._sequence.stop();
        this.#initSequence();
        this.start();
        this._isPlaying = true;
    }



    // GETTER & SETTER - only one value each
    // =========================================
    get isPlaying (){
        return this._isPlaying;
    }
    set isPlaying (state){
        this._isPlaying = state;
    }
    get sequence (){
        return this._sequence
    }
    set sequence (dummy){
        //
    }
    name () {
        return this._name;
    }
    volume () {
        return this._volume;
    }
    rawPattern () {
        return this._rawPattern;
    }


    


    // PRIVATE FUNCTIONS - start with #
    // =========================================
    #createPreset () {
        // create Synth
        this.#initSynth();
        this._synth.connect(this._gain);
        // create sequence - the sequence calls the synth at time+note defined by the pattern
        this.#initSequence();
        this.start();
        this._isPlaying = true;
    }
    #createSampler () {
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
    }
    // set volume
    #setVolume = (gain) => {
        this._gain.gain.rampTo(this._volume, 0.1);
        // console.log(`this._gain.gain: ${this._gain.gain}, this._volume: ${this._volume}`);
    }
    
    // init a sequence
    #initSequence = () => {
        this._sequence = new Tone.Sequence(this.#callbackSequence, this.midiPattern, '8n');   // '8n' == speed, eight bars/second
    }
    // callback for sequence
    #callbackSequence = (time, note) => {
        this._triggerFunction(this._synth, note);
        this._ticks++;
    }

    // translate pattern [0, 1, 2, -4] to midi pattern ['C1', 'A2']. based on basenote/ transpose
    #translatePatternToMidi = (pattern) => {
        let _midiPattern = [];
        for (let i=0; i< pattern.length; i++) {
            let note = pattern[i];
            // if note is a rest, push as 'null', else calculate midi notes
            if (note == null) _midiPattern.push(note);
            else {
                // console.log("changed note", note);
                note = note + this._baseNote;
                // console.log("changed note+baseNote", note);
                // transpose note
                if (this._transpose<0) note-=this._transpose;
                if (this._transpose>0) note+=this._transpose;
                // console.log("transpose", this._transpose);
                // console.log("note after transpose: ", note);
                // set notes from pattern note
                note = Tone.Frequency(note, "midi").toNote();
                // console.log("changed note+baseNote to Freq", note);
                _midiPattern.push(note);
            };
            
        }
        return _midiPattern;
    }

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
        if (now == 0) { playTime = 0}
        else if (now >= 0 && now <= 0.01) { playTime = 0.01}
        else if (quant < now){
            playTime= now + 0.5;
            playTime = Tone.Time(playTime).quantize(factor);
            // console.log("quant < now. new calc: ", `now: ${now}, playTime: ${playTime}. quant factor: ${factor}. quant: ${quant}`)
        }
        // console.log(`now: ${now} - play at: ${playTime}`)
        
        // safety: if below 0 than playTime is zero
        if (playTime<0) playTime=0
        // return quant playTime
        return playTime;
    }
};

export { Instrument }