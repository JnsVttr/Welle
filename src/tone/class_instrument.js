import * as Tone from 'tone';

// INSTRUMENT CLASS
// ===================================================================

class Instrument {

    // STATIC DEFAULTS - set default properties 
    // can be accessed (get/set) from outside as:  ClassName.property
    // from inside the class. in 'static' scope as this.property, else as ClassName.property
    static baseNoteDefault = 16;                    // midi notes from lowest 0 upwards
    static transposeDefault = 2;                    // default transpose
    static samplePathDefault = '../data/defaultSample'; // default sample path, needs review
    static typeDefault = 'MembraneSynth';           // default synth type = Sampler
    static gainDefault = 0.6;
    static patternDefault = [0, 1,  null, -3, 4];
    static masterGain = new Tone.Gain(0.9);         // master output for Tone -> Speaker
    static bpm = 120;                               // bpm
    static list = [];                               // list of possible instrument names
    static presets = {};                            // settings for different instrument names
    static bufferDefault = undefined;               // placeholder default buffer


    // CONSTRUCTOR - executed with every new instance
    constructor(name, pattern, rawPattern) {

        // define properties every new Instrument will have
        // this._synthType = Instrument.typeDefault;       
        // this.samplePath = Instrument.samplePathDefault;
        
        // create tone elements: synth -> gain -> masterOut
        // the synth creates the sound
        this._name = name;
        this._isPlaying = false;
        this._synth = undefined;
        this._sequence = undefined;
        this._ticks = 0;
        this.measure = '8n';
        this._rawPattern = rawPattern  || '# #1 - #-3 #4';
        
        this._preset = Instrument.presets[this._name];
        console.log('preset', this._preset);
        this._settings = this._preset.settings;   // set synth settings from Instrument default settings(type)
        this._transpose = this._preset.transpose;
        this._baseNote = this._preset.baseNote;
        this._type = this._preset.synthType;
        this._triggerFunction = this._preset.triggerFunction;
        this._volume = this._preset.gain * this._preset.volume;
        this._sampleUrl = this._preset.settings.C3;
        this._settings.C3 = Instrument.bufferDefault;

        this.pattern = pattern || Instrument.patternDefault;
        this.midiPattern = this.#translatePatternToMidi(this.pattern); // placeholder for pattern translation
        
        // create Synth
        this.#initSynth();
        // create sequence 
        // the sequence calls the synth at time+note defined by the pattern
        // init sequence;
        this.#initSequence();
        this._gain = new Tone.Gain(Instrument.gainDefault);
        this._synth.connect(this._gain);
        this._gain.connect(Instrument.masterGain);   // connect this synth to master Gain node
        this.#setVolume();

    }

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
        console.log("stop() quant: ", quant);
        if (quant==undefined) this._sequence.stop(); // stop just before next quant
        if (quant!=undefined) this._sequence.stop(quant); // stop just before next quant
        this._isPlaying = false;
        console.log("this._sequence.state: ", this._sequence.state);
    }


    // GETTER & SETTER - only one value
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


    getPattern () {
        return [this.pattern, this.midiPattern]
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







    // init synth
    #initSynth = () => {
        this._synth = new Tone[this._type](this._settings);
        if (this._type == 'Sampler') this._synth.buffer = this._buffer; 
    }
    // set volume
    #setVolume = (gain) => {
        this._gain.gain.rampTo(this._volume, 0.1);
        console.log(`this._gain.gain: ${this._gain.gain}, this._volume: ${this._volume}`);
    }
    
    // init a sequence
    #initSequence = () => {
        this._sequence = new Tone.Sequence(this.#callbackSequence, this.midiPattern, '8n');   // '8n' == speed, eight bars/second
    }
    // callback for sequence
    #callbackSequence = (time, note) => {
        // console.log("note: ", note);
        this._triggerFunction(this._synth, note);
        // this._synth.triggerAttackRelease(note, '16n', '8n');
        // this._synth.triggerAttackRelease("C1", '16n', '@16n');
        // console.log("sequence note: ", note);
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

        console.log(`now: ${now}. quant factor: ${factor}. quant: ${quant}`);
        
        // if transport starts, set quant to 0
        if (now == 0) { playTime = 0}
        else if (now >= 0 && now <= 0.01) { playTime = 0.01}
        else if (quant < now){
            playTime= now + 0.5;
            playTime = Tone.Time(playTime).quantize(factor);
            console.log("quant < now. new calc: ", `now: ${now}, playTime: ${playTime}. quant factor: ${factor}. quant: ${quant}`)
        }
        console.log(`now: ${now} - play at: ${playTime}`)
        
        // safety: if below 0 than playTime is zero
        if (playTime<0) playTime=0
        // return quant playTime
        return playTime;
    }

    static getGainDefault () {
        return this._gainDefault;
    }
};

export { Instrument }