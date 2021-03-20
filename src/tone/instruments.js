import Tone from 'tone';

// INSTRUMENT CLASS
// ===================================================================

class Instrument {
  constructor() {
    this.synth = null;
    this.synthType = null;
    this.gain = new Tone.Gain(0.3);
    // this.gain.toMaster();
    // this.tick = 0;
    this.baseNote = 130;
    this.sampleURL;
    this.transpose = 2;
  }


  // from OUTSIDE
  updateType(synthType) {
    this._updateSynthType(synthType);
  }
  connect(output) {
    this.gain.connect(output);
  }
  updateSampleURL(url) {
    this.sampleURL = url;
    // console.log('--> instrument constructor sampleURL: ' + this.sampleURL);
  }
  setVolume(vol) {
    vol = (vol / 100) * 50;
    this.gain.gain.value = vol;
  }
  setBaseNote(note) {
    this.baseNote = note;
  }
  getBaseNote() {
    return this.baseNote;
  }
  setTranspose(transpose) {
    this.transpose = transpose;
  }
  getTranspose() {
    return this.transpose;
  }
  dispose(synthType) {
    if (this.synth) {
      this.synth.disconnect(this.gain);
      this.synth.dispose();
    }
  }
  sync(bool) {
    if (bool) { this.synth.sync(); }
    else { this.synth.unsync(); }
  }
  resonance(val) {
    this.synth.resonance(val);
  }

  trigAtkRel(note, seq, time) {
    this.synth.triggerAttackRelease(note, seq, time);
    // console.log(`--> triggerAttackRelease(){}: with this params: ${note}, ${seq}, ${time}`);
  }

  // from INSIDE
  _updateSynthType(synthType) {
    this.synthType = synthType;
    if (this.synth) {
      this.synth.disconnect(this.gain);
      this.synth.dispose();
    }


    let settings = this.defaultSettings[synthType] || {};

    if (synthType == 'Sampler') {
      // console.log('--> this are the default settings type: ' + synthType +  ' + settings.C3: ' + settings.C3);
      settings.C3 = this.sampleURL;
      // here: callback func for sampler
      // console.log('--> this are the new settings "C3": ' + settings.C3);
    };

    this.synth = new Tone[this.synthType](settings);
    this.synth.connect(this.gain);
    // this.synth.sync();
  }




  get defaultSettings() {
    return {
      MonoSynth: {
        frequency: 'C4',
        detune: 0,
        oscillator: {
          type: 'square'
        },
        filter: {
          Q: 6,
          type: 'lowpass',
          rolloff: -24
        },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.9,
          release: 1
        },
        filterEnvelope: {
          attack: 0.06,
          decay: 0.2,
          sustain: 0.5,
          release: 1,
          baseFrequency: 200,
          octaves: 7,
          exponent: 2
        }
      },


      DuoSynth: {
        vibratoAmount: 0.5,
        vibratoRate: 5,
        harmonicity: 1.5,
        voice0: {
          volume: -10,
          portamento: 0,
          oscillator: {
            type: 'sine'
          },
          filterEnvelope: {
            attack: 0.01,
            decay: 0,
            sustain: 1,
            release: 0.5
          },
          envelope: {
            attack: 0.01,
            decay: 0,
            sustain: 1,
            release: 0.5
          }
        },
        voice1: {
          volume: -10,
          portamento: 0,
          oscillator: {
            type: 'sine'
          },
          filterEnvelope: {
            attack: 0.01,
            decay: 0,
            sustain: 1,
            release: 0.5
          },
          envelope: {
            attack: 0.01,
            decay: 0,
            sustain: 1,
            release: 0.5
          }
        }
      },

      Sampler: {
        'C3': '../',
      },


      NoiseSynth: {
        noise: {
          type: 'white'
        },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0
        },
      },

      Synth: {
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.3,
          release: 1
        }
      },

      MembraneSynth: {
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: {
          type: 'sine'
        },
        envelope: {
          attack: 0.001,
          decay: 0.4,
          sustain: 0.01,
          release: 1.4,
          attackCurve: 'exponential'
        }
      },

      MetalSynth: {
        frequency: 200,
        envelope: {
          attack: 0.001,
          decay: 0.4,
          release: 0.2
        },
        harmonicity: 5.1,
        modulationIndex: 12,
        resonance: 4000,
        octaves: 1.5
      },

      PluckSynth: {
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.6
      },

      FMSynth: {
        harmonicity: 2,
        modulationIndex: 10,
        detune: 0.2,
        oscillator: {
          type: "square64"
        },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.1,
          release: 0.1
        },
        modulation: {
          type: "square64"
        },
        modulationEnvelope: {
          attack: 0.1,
          decay: 0.5,
          sustain: 0.1,
          release: 0.2
        }
      },

      AMSynth: {
        harmonicity: 3,
        detune: 1,
        oscillator: {
          type: "square32"
        },
        envelope: {
          attack: 0.1,
          decay: 0.1,
          sustain: 0.1,
          release: 0.3
        },
        modulation: {
          type: "square"
        },
        modulationEnvelope: {
          attack: 0.1,
          decay: 0.01,
          sustain: 0.1,
          release: 0.2
        }
      }
    };
  }
}



export { Instrument }