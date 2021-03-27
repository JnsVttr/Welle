// WELLE - parser
// =============================================================

/*
manage semantics returns
delegate input to tone, sockets, html
*/

// libraries
import * as Tone from "tone";

// files
import { printer } from "/helper/printer";
import { Instrument } from "/tone/class_instrument";
import { instruments, listOfAllAvailableInstruments, parts, thisBPM } from "/index";

// local variables
let debug = true;
let context = "parser";

// function to interpret input and send to TONE via transport or to html etc.
export const parser = (input) => {
    printer(debug, context, "input: ", input);
    let returnMessage = {
        cmd: "",
        string: "",
        instruments: [],
        parts: [],
        noInstrument: [],
        noPart: [],
        phrases: input.phrases,
        patternString: input.patternString,
    };

    switch (input.event) {
        case "plainStartEvent":
            // printer(debug, context, "playMulti, instrument: ", input.phrases[0])
            // for all phrases
            for (let i in input.phrases) {
                let name = input.phrases[i];
                // if they are valid instruments
                if (listOfAllAvailableInstruments.includes(name)) {
                    // printer(debug, context, "check instruments", instruments[name])
                    // if they exist already, just start
                    if (instruments[name]) instruments[name].restart();
                    // else make new
                    else instruments[name] = new Instrument(name);
                    // push name of running inst for rendering
                    returnMessage.instruments.push(name);
                } else {
                    returnMessage.cmd = "noSuchInstrument";
                    returnMessage.string = name;
                    returnMessage.noInstrument.push(name);
                }
            }
            // console.log("instruments object ", instruments);
            if (Tone.Transport.state != "started") Tone.Transport.start();
            break;

        case "assignPattern":
            for (let i = 0; i < input.phrases.length; i++) {
                let name = input.phrases[i];
                if (instruments[name]) {
                    // printer(debug, context, `assignPatternOne - ${input.pattern} to instrument:`, input.phrases);
                    instruments[name].setPattern(input.pattern, input.patternString);
                } else {
                    if (listOfAllAvailableInstruments.includes(name)) {
                        // printer(debug, context, `assignPatternOne, create inst ${name} + pattern ${input.pattern}`, name);
                        instruments[name] = new Instrument(name, input.pattern, input.patternString);
                    } else {
                        returnMessage.cmd = "noSuchInstrument";
                        returnMessage.string = name;
                    }
                }
            }
            if (Tone.Transport.state != "started") Tone.Transport.start();
            break;

        case "copyPattern":
            let source = input.source;
            let destinantions = input.phrases;
            let pattern = "";
            let rawPattern = "";

            // check if source is valid. if exists, else create
            if (listOfAllAvailableInstruments.includes(source)) {
                console.log("source instrument valid: ", source);
                // if instrument exists
                if (instruments[source]) {
                    console.log("source instrument exists: ", source);
                    instruments[source].restart();
                } else {
                    console.log("source instrument doesn't exist: ", source);
                    instruments[source] = new Instrument(source);
                }
                // extract pattern
                pattern = instruments[source].getPattern();
                rawPattern = instruments[source].getRawPattern();
                console.log(`extract pattern: ${pattern} and rawPattern: ${rawPattern}`);
            } else {
                returnMessage.cmd = "noSuchInstrument";
                returnMessage.noInstrument.push(source);
            }

            // if source is valid and exists as an instrument, than:
            if (instruments[source]) {
                // for all destinations
                for (let i in destinantions) {
                    let instrument = destinantions[i];
                    // check if instrument is valid. if exists, else create
                    if (listOfAllAvailableInstruments.includes(instrument)) {
                        console.log("instrument valid: ", instrument);
                        // if instrument exists
                        if (instruments[instrument]) {
                            console.log("source instrument exists: ", instrument);
                            // set pattern
                            instruments[instrument].setPattern(pattern, rawPattern);
                        } else {
                            console.log("instrument doesn't exist: ", instrument);
                            // create instrument with source pattern
                            instruments[instrument] = new Instrument(instrument, pattern, rawPattern);
                        }
                    } else {
                        // instrument is not valid
                        returnMessage.cmd = "noSuchInstrument";
                        returnMessage.noInstrument.push(instrument);
                    }
                }
            }

            // console.log("instruments object ", instruments);
            if (Tone.Transport.state != "started") Tone.Transport.start();
            break;

        case "playAllEvent":
            // if Tone is not started, start it
            if (Tone.Transport.state != "started") Tone.Transport.start();
            // restart all instruments in sync
            Object.keys(instruments).forEach((instrument) => {
                instruments[instrument].restart();
            });

            break;

        case "stopAllEvent":
            Object.keys(instruments).forEach((instrument) => {
                instruments[instrument].stop();
            });
            if (Tone.Transport.state != "stopped") Tone.Transport.stop();
            break;

        case "stopEvent":
            for (let i in input.phrases) {
                let instrument = input.phrases[i];
                console.log("stop phrases: ", instrument);
                // if instrument is a valid instrument
                if (listOfAllAvailableInstruments.includes(instrument)) {
                    console.log("instrument valid: ", instrument);
                    // if instrument exists
                    if (instruments[instrument]) {
                        console.log("instrument exists: ", instrument);
                        // stop instrument
                        instruments[instrument].stop();
                    } else {
                        console.log("instrument doesn't exist: ", instrument);
                    }
                } else {
                    returnMessage.cmd = "noSuchInstrument";
                    returnMessage.string = instrument;
                }
            }
            // check if other instruments are still playing. if not, stop Tone
            let stillInstrumentsPlaying = false;
            for (let instrument in instruments) {
                console.log(instruments[instrument]);
                if (instruments[instrument].isPlaying) stillInstrumentsPlaying = true;
            }
            // if last playing instrument stopped && Tone still playing, than stop Tone
            if (Tone.Transport.state != "stopped" && !stillInstrumentsPlaying) Tone.Transport.stop();
            console.log("Tone.state: ", Tone.Transport.state);
            break;

        case "questionEvent":
            Object.keys(instruments).forEach((entry) => {
                console.log(`is sequence playing for ${entry}:`, instruments[entry].isPlaying);
            });

            break;

        case "setVolume":
            let volume = input.volume;
            // for all phrases
            for (let i in input.phrases) {
                let instrument = input.phrases[i];
                // if they are valid instruments
                if (listOfAllAvailableInstruments.includes(instrument)) {
                    // if they exist already, set volume
                    if (instruments[instrument]) {
                        console.log(`setvolume ${volume} for instrument: ${instrument}`);
                        instruments[instrument].setVolume(volume);
                    }
                } else {
                    returnMessage.cmd = "noSuchInstrument";
                    returnMessage.noInstrument.push(instrument);
                }
            }
            break;

        case "savePartEvent":
            let part = input.phrase;
            console.log(`save part: "${part}"`);
            // check if name is reserved as instrument
            if (listOfAllAvailableInstruments.includes(part)) {
                returnMessage.cmd = "partNameReserved";
                returnMessage.string = part;
            } else {
                // if name free, save it in parts, including current instruments, bpm
                parts[part] = {
                    instruments: instruments,
                    bpm: Tone.Transport.bpm.value,
                    listOfAllAvailableInstruments: listOfAllAvailableInstruments,
                };
                console.log(`part ${part} saved in parts`, parts);
            }
            break;

        case "setBPM":
            break;

        case "deleteEvent":
            break;

        case "deleteAllEvent":
            break;

        case "saveEvent":
            break;

        case "joinEvent":
            break;

        case "restartEvent":
            break;

        case "storeEvent":
            break;

        case "loadEvent":
            break;

        case "uploadEvent":
            break;

        case "muteAllEvent":
            break;

        case "unmuteAllEvent":
            break;

        case "emptyEvent":
            break;
    } // EO_Switch

    return returnMessage;
}; // EO parser
