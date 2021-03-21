
import { Instrument } from '/tone/instruments';


// CREATE INSTRUMENT
// ===================================================================

export function createInstrument(_instruments, _instrumentsList, 
    _instName, _patternIn, _rand, _masterOut) {
	
    // create new instrument, based on stored params:
    let inst = new Instrument();


    // params taken from instrumentsList
    let instType    = _instrumentsList[_instName].type;
    let defaultVol  = _instrumentsList[_instName].vol * _instrumentsList[_instName].gain;;
    let url         = _instrumentsList[_instName].url;
    let note        = _instrumentsList[_instName].baseNote;
    let transpose   = _instrumentsList[_instName].transpose;

    // update the new Instrument:
    // set volume
    inst.setVolume(defaultVol);
    // set basenote
    if (_instrumentsList[_instName].baseNote != undefined) { inst.setBaseNote(note); };
    // set transpose
    inst.setTranspose(transpose);
    // set URL if sampler
    if (_instrumentsList[_instName].type == 'Sampler') {
        inst.updateSampleURL(url);
        // printer(debug, context, "updateInstrument", `CHECK - sample URL: ${url}`);
    };
    // set instrument type
    inst.updateType(instType);
    // connect instrument output to Master
    inst.connect(_masterOut);

    // create a random function and store in instruments
    let randFunction = function () {
        // take pattern as input
        let input = _instruments[_instName].pattern;
        let newPattern = null;
        for (var i = input.length-1; i >=0; i--) {
            var randomIndex = Math.floor(Math.random()*(i+1)); 
            var itemAtIndex = input[randomIndex]; 
            input[randomIndex] = input[i]; 
            input[i] = itemAtIndex;
        };
        newPattern = input; // shuffled input 
        _instruments[_instName].pattern = newPattern;
        return newPattern;
    };


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
        randFunction: randFunction,
        transpose: transpose,
    };
}
