

export let presets = {
	'drum': {
		synthType: 'MembraneSynth',
		gain: 1,
		volume: 0.6,
		baseNote: 16,
		transpose: 0,
		triggerFunction: (_synth, _note) => { _synth.triggerAttackRelease(_note, '16n', '@16n')},
		settings: {
			detune: 0.3,
			pitchDecay: 0.05,
			octaves: 13,
			oscillator: {
				type: 'square'
			},
			envelope: {
				attack: 0.001,
				decay: 0.4,
				sustain: 0.01,
				release: 1.4,
				attackCurve: 'exponential'
			},
		},
	},
	'bass': {
		synthType: 'MonoSynth',
		gain: 1,
		volume: 0.6,
		baseNote: 32,
		transpose: 0,
		triggerFunction: (_synth, _note) => { _synth.triggerAttackRelease(_note, '16n', '@16n')},
		settings: {
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
				decay: 0.1,
				sustain: 0.2,
				release: 0.3,
				baseFrequency: 200,
				octaves: 7,
				exponent: 2
			}
		},
	},
	'kick': {    // Sampler, settings.C3 = this.sampleURL;
		synthType: 'Sampler',
		gain: 1,
		volume: 0.6,
		baseNote: 44,
		transpose: 0,
		triggerFunction: (_synth, _note) => { _synth.triggerAttackRelease(_note, '16n', '@16n')},
		settings: {
			'C3': './audio/hit/hit.mp3',   // sample URL
		},
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
