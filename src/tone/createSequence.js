import Tone from 'tone';


// CREATE SEQUENCE
// ===================================================================

export function createSequence(_instruments, _instName, _patternIn, playInstrument) {
	let synth = _instruments[_instName].synth;

    // if there is already a sequence
    if (_instruments[_instName].sequence != null) {
		_instruments[_instName].sequence.stop();
		_instruments[_instName].sequence.dispose();
	}
	
    // init new sequence with callback function
    let sequence = new Tone.Sequence(function (time, note) {
        // set note first - here midi notes ?
        //note = synth.getBaseNote() + (note * 10);
        // note = synth.getBaseNote() + note;
        
        // console.log("note: ", note)
        let changedNote = Tone.Frequency(note, "midi").toNote()
        let transpose = synth.getTranspose();
        changedNote = Tone.Frequency(changedNote).transpose(transpose);
        //console.log("change note: ", changedNote)
        note = changedNote;

        
        
        
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

        // to keep track of timeline
        _instruments[_instName].ticks++;
        
        // embed a recursive function to restart the sequence again
        // relates to instruments[instName].randFunction, which generates a new pattern. 
        if (_instruments[_instName].rand > 0) {
            let count = _instruments[_instName].ticks % (_instruments[_instName].pattern.length * _instruments[_instName].rand);
            if ((count+1) ==  ((_instruments[_instName].pattern.length * _instruments[_instName].rand)) ){
                // hardcore recursive shit:
                let newPattern = _instruments[_instName].randFunction();
                // create new sequence
                _instruments[_instName].sequence = createSequence(_instruments, _instName, newPattern);
                // start new sequence
                if (_instruments[_instName].type == 'Sampler'){
                    setTimeout(function(){
                        _instruments[_instName].sequence.start(0);
                        _instruments[_instName].isPlaying = true;		
                    }, 80);
                } else {
                    _instruments[_instName].sequence.start(0);
                    _instruments[_instName].isPlaying = true;		
                };
                // console.log(`execute randfunction: with new pattern ${newPattern}`, _instruments[_instName].sequence)
            };	
        };
        
    }, _patternIn, '8n');
    
    // return new sequence
    return sequence;
}
