
import { Instrument } from '/tone/instruments';
import { printer } from '/helper/printer';
import { debug, context } from './main-tone';


// INSTRUMENTS & SEQUENCE
// ===================================================================

export function createInstrument(_instruments, _instrumentsList, 
    _instName, _patternIn, _rand, _masterOut) {
	
    // create new instrument, based on stored params:
    let inst = new Instrument();


    // params taken from instrumentsList
    let instType    = _instrumentsList[_instName].type;
    let defaultVol  = _instrumentsList[_instName].vol * _instrumentsList[_instName].gain;
    let url         = _instrumentsList[_instName].url;
    let note        = _instrumentsList[_instName].baseNote;

    // update the new Instrument:
    // set volume
    inst.setVolume(defaultVol);
    // set basenote
    if (_instrumentsList[_instName].baseNote != undefined) { inst.setBaseNote(note); };
    // set URL if sampler
    if (_instrumentsList[_instName].type == 'Sampler') {
        inst.updateSampleURL(url);
        // printer(debug, context, "updateInstrument", `CHECK - sample URL: ${url}`);
    };
    // set instrument type
    inst.updateType(instType);
    // connect instrument output to Master
    inst.connect(_masterOut);

    
    

    // _instruments[_instName].randFunction = function () {
    //     let shufflePattern = shuffleArray(_instruments[_instName].pattern);
    //     _instruments[_instName].pattern = shufflePattern;
    //     if (_instruments[_instName].isPlaying) {
    //         updateSequence(_instruments[_instName].name, shufflePattern);
    //         playSequence(_instruments[_instName].name);
    //     } else {
    //         updateSequence(_instruments[_instName].name, shufflePattern);
    //     }
    // };


    // store new instrument in "Instrument" collection as return
    // _instruments[_instName] = {
    return {
        name: _instName,
        synth: inst,
        type: instType,
        vol: defaultVol,
        pattern: _patternIn,
        rand: _rand,
        ticks: 0,
        url: url,
        note: note,
        isPlaying: false,
    };
}
