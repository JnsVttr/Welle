import { sampleURL } from '/index';
import { printer } from '/helper/printer';
import { debug, context } from '/tone/main-tone';

// important: UPDATE only arrives after connection to server
// update_InstrumentsList();


// sampleURL.default = a folder on server called "default"

export function update_InstrumentsList() {
    let _instrumentsList = {};
    
    printer(debug, context, "update_InstrumentsList", `attempting to update sample paths...`);
    if (sampleURL != undefined) {
        _instrumentsList = {
            drums: { name: 'drums', type: 'MembraneSynth', baseNote: 30, gain: 1, vol: 0.7, },
            metal: { name: 'metal', type: 'MetalSynth', baseNote: 30, gain: 0.4, vol: 0.7, },
            bass: { name: 'bass', type: 'DuoSynth', baseNote: 70, gain: 1, vol: 0.7, },
            string: { name: 'string', type: 'AMSynth', baseNote: 180, gain: 1, vol: 0.7, },
            acid: { name: 'acid', type: 'MonoSynth', baseNote: 30, gain: 0.23, vol: 0.7, },
            pad: { name: 'pad', type: 'Synth', baseNote: 130, gain: 1, vol: 0.7, },
    
            s_ambient: { name: 's_ambient', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[0] },
            s_bass: { name: 's_bass', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[1] },
            s_fx: { name: 's_fx', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[2] },
    
            s_hh: { name: 's_hh', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[3] },
            s_hit: { name: 's_hit', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[4] },
            s_kick: { name: 's_kick', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[5] },
            s_loop: { name: 's_loop', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[6] },
            s_mix: { name: 's_mix', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[7] },
            s_noise: { name: 's_noise', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[8] },
            s_perc: { name: 's_perc', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[9] },
    
            s_snare: { name: 's_snare', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[10] },
            s_voc: { name: 's_voc', type: 'Sampler', baseNote: 100, gain: 1.4, vol: 0.7, url: sampleURL.default[11] },
        };

        printer(debug, context, "update_InstrumentsList", `updated sample paths based on sampleURL`);
        printer(debug, context, "update_InstrumentsList: ", _instrumentsList);
        
        return _instrumentsList;
    };
	
    
}
;
