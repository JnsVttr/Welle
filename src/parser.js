
// WELLE - parser
// =============================================================

/*
manage semantics returns
delegate input to tone, sockets, html
*/


// libraries
import * as Tone from 'tone';

// files
import { printer } from '/helper/printer';
import { Instrument } from '/tone/class_instrument'
import { instruments, parts, thisBPM } from '/index' 

// local variables
let debug = true;
let context = "parser";




// function to interpret input and send to TONE via transport or to html etc.
export const parser = (input) => {
    printer(debug, context, "input: ", input)

    switch(input.event) {
        case 'playMulti':
            printer(debug, context, "playMulti, instrument: ", input.phrases[0])
            for (let i=0; i<input.phrases.length;i++){
                let name = input.phrases[i];
                instruments[name] = new Instrument();
                instruments[name].start();
            };
            console.log("instruments object ", instruments);
            Tone.Transport.start();
            break;
        case 'playMultiEvent':
            printer(debug, context, "playMultiEvent, instrument: ", input.phrases);
            for (let i=0; i<input.phrases.length;i++){
                let name = input.phrases[i];
                instruments[name].start();
            };
            Tone.Transport.start();
            break;
        case 'assignPatternOne':
            printer(debug, context, "assignPatternOne, instruments: ", input.phrases);
            printer(debug, context, "assignPatternOne, pattern: ", input.pattern);
            for (let i=0; i<input.phrases.length;i++){
                let name = input.phrases[i];
                if (instruments[name]!=undefined) {
                    printer(debug, context, "assignPatternOne, pattern to inst: ", name);
                    instruments[name].setPattern(input.pattern);
                    console.log("instruments[name].getPattern()", instruments[name].getPattern())
                }
                
            };
            Tone.Transport.start();
            break;
        case 'playAllEvent':
            Object.keys(instruments).forEach(instrument => {
                instrument.start()
            });
            // Tone.Transport.start();
            break;
        case 'stopAllEvent':
            Object.keys(instruments).forEach(instrument => {
                instrument.stop();
            });
        break;
        case 'questionEvent':
            Object.keys(instruments).forEach(instrument => {
                console.log(`is sequence playing for ${instrument}: ${instrument.playState()}`)
            });
        break;
    }
}