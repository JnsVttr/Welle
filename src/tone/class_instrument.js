import * as Tone from 'tone';

// INSTRUMENT CLASS
// ===================================================================

class Instrument {
    // STATIC DEFAULTS - set default properties 
    // can be accessed (get/set) from outside as:  ClassName.property
    // from inside the class. in 'static' scope as this.property, else as ClassName.property
    static baseNoteDefault = 32;                    // midi notes from lowest 0 upwards
    static transposeDefault = 2;                    // default transpose
    static samplePathDefault = '../data/defaultSample'; // default sample path, needs review
    static typeDefault = 'MembraneSynth';           // default synth type = Sampler
    static gainDefault = 0.6;
    static patternDefault = [0, 1, 2, -3, 4];
    static masterGain = new Tone.Gain(0.9);          // master output for Tone -> Speaker

    // CONSTRUCTOR - executed with every new instance
    constructor(pattern) {

        // define properties every new Instrument will have
        // this.synthType = Instrument.typeDefault;       
        // this.samplePath = Instrument.samplePathDefault;
        
        // create tone elements: synth -> gain -> masterOut
        // the synth creates the sound
        this._isPlaying = false;
        this.synth = new Tone[Instrument.typeDefault]();;
        this.gain = new Tone.Gain(Instrument.gainDefault);
        this.synth.connect(this.gain);
        this.gain.connect(Instrument.masterGain);   // connect this synth to master Gain node
        
        this.ticks = 0;
        this.transpose = Instrument.transposeDefault;
        this.baseNote = Instrument.baseNoteDefault;
        this.measure = '8n';
        this.pattern = Instrument.patternDefault;
        if (pattern != undefined) this.pattern = pattern;
        this.midiPattern = this.#translatePatternToMidi(this.pattern); // placeholder for pattern translation

        // create sequence 
        // the sequence calls the synth at time+note defined by the pattern
        this.sequence = new Tone.Sequence(this.#callbackSequence, this.midiPattern, '8n');   // '8n' == speed, eight bars/second
    }

    start (){
        if (this._isPlaying==false) {
            this.sequence.start(this.#quant(), 0);
            this._isPlaying = true;
        }
    }

    restart (){
        this.sequence.stop();
        this.sequence.start(this.#quant());
        this._isPlaying = true;
    }
    
    stop (){
        this.sequence.stop(this.#quant()-0.1); // stop just before next quant
        this._isPlaying = false;
    }


    // GETTER & SETTER - only one value
    get isPlaying (){
        return this._isPlaying;
    }
    set isPlaying (state){
        this._isPlaying = state;
    }


    getPattern () {
        return [this.pattern, this.midiPattern]
    }

    setPattern (pattern) {
        this.pattern = pattern;
        this.midiPattern = this.#translatePatternToMidi(this.pattern);
        this.sequence.stop();
        // this.sequence.dispose();
        this.sequence = new Tone.Sequence(this.#callbackSequence, this.midiPattern, '8n');
        this.sequence.start(this.#quant());  // start sequence at calculated quant time 
        this._isPlaying = true;
    }

    // callback for sequence
    #callbackSequence = (time, note) => {
        this.synth.triggerAttackRelease(note, '16n', '@16n');
        // console.log("sequence note: ", note);
        this.ticks++;
    }

    // translate pattern [0, 1, 2, -4] to midi pattern ['C1', 'A2']. based on basenote/ transpose
    #translatePatternToMidi = (pattern) => {
        let _midiPattern = [];
        for (let i=0; i< pattern.length; i++) {
            let note = pattern[i];
            // console.log("changed note", note);
            note = note + this.baseNote;
            // console.log("changed note+baseNote", note);
            // transpose note
            if (this.transpose<0) note-=this.transpose;
            if (this.transpose>0) note+=this.transpose;
            // console.log("transpose", this.transpose);
            // console.log("note after transpose: ", note);
            // set notes from pattern note
            note = Tone.Frequency(note, "midi").toNote();
            // console.log("changed note+baseNote to Freq", note);
            _midiPattern.push(note);
        }
        return _midiPattern
    }

    // get quant
    #quant = () => {
        // sync to actual time
        let factor = 1;
        let now = Tone.TransportTime().valueOf();
        let quant = Tone.Time(now).quantize(factor);
        // console.log(`now: ${now}. quant factor: ${factor}. quant: ${quant}`);
    
        if (quant < now){
            now+=1;
            quant = Tone.Time(now).quantize(factor);
            // console.log("quant < now. new calc: ", `now: ${now}. quant factor: ${factor}. quant: ${quant}`)
        }
        // console.log(`now: ${now} - play at ${now + 0.2}`)
        return quant;
    }

    static getGainDefault () {
        return this.gainDefault;
    }
};

export { Instrument }