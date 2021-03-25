
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
            for (let i=0; i<input.phrases.length;i++){
                let name = input.phrases[i];
                if (instruments[name]) {
                    printer(debug, context, `assignPatternOne - ${input.pattern} to instrument:`, input.phrases);
                    instruments[name].setPattern(input.pattern);
                } else {
                    printer(debug, context, `assignPatternOne, create inst ${name} + pattern ${input.pattern}`, name);
                    instruments[name] = new Instrument(input.pattern);
                    instruments[name].start();
                }
            };
            if (Tone.Transport.state == 'stopped') Tone.Transport.start();

            break;
        case 'playAllEvent':
            Object.keys(instruments).forEach(instrument => { instruments[instrument].stop(0) });
            Tone.Transport.stop(0);
            Tone.Transport.start();
            Object.keys(instruments).forEach(instrument => { instruments[instrument].restart() });
            console.log('Tone.Transport: ', Tone.Transport);
            console.log('Tone.Transport.state: ', Tone.Transport.state);


            break;
        case 'stopAllEvent':
            Object.keys(instruments).forEach(instrument => { instruments[instrument].stop(0) });
            Tone.Transport.stop();
            console.log('Tone.Transport: ', Tone.Transport)
            console.log('Tone.Transport.state: ', Tone.Transport.state);
            

        break;
        case 'questionEvent':
            Object.keys(instruments).forEach(entry => {
                console.log(`is sequence playing for ${entry}:`, instruments[entry].isPlaying)
            });
        break;
    }
}