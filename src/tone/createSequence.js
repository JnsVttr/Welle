import Tone from 'tone';


export function createSequence(_instruments, _instName, _patternIn) {
	let synth = _instruments[_instName].synth;
	
    // init new sequence
    let sequence = new Tone.Sequence(function (time, note) {
        // set note first - here midi notes ?
        note = synth.getBaseNote() + (note * 10);
        
        // set sequence envelopes:
        switch (_instruments[_instName].type) {
            case "MetalSynth":
                synth.synth.triggerAttackRelease("16n", '@8n'); // toggle @16n -->time
                break;
            case "NoiseSynth":
                synth.synth.triggerAttackRelease("32n", '@8n');
                break;
            case "FMSynth":
                synth.synth.triggerAttackRelease(note, "32n", '@8n', 0.8);
                break;
            case "AMSynth":
                synth.synth.triggerAttackRelease(note, "8n", '@8n', 1);
                break;
            case "PluckSynth":
                synth.synth.resonance.value = 0.1;
                synth.synth.dampening.value = 5000;
                synth.synth.triggerAttackRelease(note, "32n", '@8n');
                break;
            case "Sampler":
                synth.synth.triggerAttackRelease(note, "1n", '@8n');
                break;
            default:
                synth.synth.triggerAttackRelease(note, "32n", '@8n');
        };

        // ??
        _instruments[_instName].ticks++;
        
    }, _patternIn, '8n');
    
    // return new sequence
    return sequence;
}













/*

if (_instruments[_instName].sequence != null) {
		printer(debug, context, "updateSequence", `updateSequence: Instrument Sequence existing, delete sequence, set new sequence`);

		_instruments[_instName].sequence.stop();
		_instruments[_instName].sequence.dispose();

		setInst();
	} else {
		printer(debug, context, "updateSequence", `updateSequence: Instrument Sequence not existing, set new Sequence`);
		setInst();
	};
*/