import Tone from 'tone';


class Instrument {
  constructor() {
    this.synth = null;
    //this.effect = new Tone.Chebyshev(90);
    //this.effect = new Tone.Vibrato(2, 0.3);
    this.effect = new Tone.Chorus(0.2, 4.2, 0.9);
    this.gain = new Tone.Gain(0.1);
    this.gain.connect(this.effect);
    this.effect.toMaster();
    this.tick = 0;
    //this.initializeTransport();
  }

  initializeTransport() {
    let notes = "CDEFGABEDCD".split('').map(n => `${n}4`);
    console.log(notes);
    
    Tone.Transport.scheduleRepeat(time => {
      let note = notes[(this.tick * 2) % notes.length];
      if (this.synth) this.synth.triggerAttackRelease(note, "8n", time);
      this.tick++;

    }, '8n');
    Tone.Transport.start();
    Tone.Transport.bpm.value = 90;
    //console.log(Tone.Transport.ticks);
  }
  
  update(synthType, oscillatorType, oscillatorPartials) {
    this._updateSynthType(synthType);
    this._updateOscillatorType(oscillatorType, oscillatorPartials);
    this.initializeTransport();
  }

  _updateSynthType(synthType) {
    if (this.synth) {
      this.synth.disconnect(this.gain);
      this.synth.dispose();
    }
    let settings = this.defaultSettings[synthType] || {};
    this.synth = new Tone[synthType](settings);
    this.synth.connect(this.gain);
  }

  _updateOscillatorType(oscillatorType, oscillatorPartials) {
    let partials = oscillatorPartials === "none" ? "" : oscillatorPartials;
    this.synth.oscillator.type = `${oscillatorType}${partials}`;
  }

  get defaultSettings() {
    return {
      Synth: {
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.3,
          release: 1
        }
      },
      FMSynth: {
        harmonicity: 3,
        modulationIndex: 10,
        detune: 0,
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.01,
          decay: 0.01,
          sustain: 0.8,
          release: 0.5
        },
        modulation: {
          type: "square"
        },
        modulationEnvelope: {
          attack: 0.2,
          decay: 0,
          sustain: 1,
          release: 0.5
        }
      },
      AMSynth: {
        harmonicity: 3,
        detune: 0,
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.01,
          decay: 0.01,
          sustain: 1,
          release: 0.5
        },
        modulation: {
          type: "square"
        },
        modulationEnvelope: {
          attack: 0.5,
          decay: 0,
          sustain: 1,
          release: 0.5
        }
      }
    };
  }
}



export { Instrument } 