import Tone from 'tone';
import { printer } from '/helper/printer';
import { instruments, debugTone, randInPattern, debug, context } from './main-tone';


export function updateSequence(instName, pat) {
	let inst = instruments[instName].synth;
	let patAdapt = pat; //adaptPattern(pat);

	printer(debug, context, "updateSequence", `create New Sequence: ${instName} with this pattern: ${patAdapt}`);
	

	let setInst = function () {
		instruments[instName].sequence = new Tone.Sequence(function (time, note) {
			// set note first
			note = inst.getBaseNote() + (note * 10);
			// console.log(`freq ${note}`);
			// set sequence:
			switch (instruments[instName].type) {
				case "MetalSynth":
					inst.synth.triggerAttackRelease("16n", '@8n'); // toggle @16n -->time
					break;
				case "NoiseSynth":
					inst.synth.triggerAttackRelease("32n", '@8n');
					break;
				case "FMSynth":
					inst.synth.triggerAttackRelease(note, "32n", '@8n', 0.8);
					break;
				case "AMSynth":
					inst.synth.triggerAttackRelease(note, "8n", '@8n', 1);
					break;
				case "PluckSynth":
					inst.synth.resonance.value = 0.1;
					inst.synth.dampening.value = 5000;
					inst.synth.triggerAttackRelease(note, "32n", '@8n');
					if (debugTone) { console.log(`Tone: pattern PluckSynth, resonance: ${inst.synth.resonance.value}.. `); };

					break;
				case "Sampler":
					inst.synth.triggerAttackRelease(note, "1n", '@8n');
					break;
				default:
					inst.synth.triggerAttackRelease(note, "32n", '@8n');
				// if (debugTone){console.log(`pattern synth, inst: ${inst}, instSynth: ${inst.synth}.. `)};
			};
			instruments[instName].ticks++;
			randInPattern(instName);


			// if (debugTone){console.log(`updateSequence: CHECK time: ${time},  Tone.Transport.ticks: ${Tone.Transport.ticks}, instrumentTicks: ${instruments[instName].ticks}`)};
		}, patAdapt, '8n');
	};

	if (instruments[instName].sequence != null) {
		printer(debug, context, "updateSequence", `updateSequence: Instrument Sequence existing, delete sequence, set new sequence`);

		instruments[instName].sequence.stop();
		instruments[instName].sequence.dispose();

		setInst();
	} else {
		printer(debug, context, "updateSequence", `updateSequence: Instrument Sequence not existing, set new Sequence`);
		setInst();
	};
}
;


