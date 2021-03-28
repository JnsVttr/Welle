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

    let random, name, volume;

    switch (input.event) {
        case "plainStartEvent":
            // printer(debug, context, "playMulti, instrument: ", input.phrases[0])
            random = input.random;
            // first check, if input is a part
            name = input.phrases[0];

            // IF PART
            // ===========
            // if input is a part
            if (parts[name]) {
                console.log(`${name} is a part: `, parts[name]);

                // STOP - stop all instruments that are not saved in part
                for (let instrument in instruments) {
                    // if the instrument is not saved in the part
                    if (!parts[name].instrumentCollection[instrument]) {
                        // stop the instrument
                        instruments[instrument].stop();
                        console.log(
                            `stop ${instrument}, because it is not saved in part '${name}'`
                        );
                    }
                }

                // CLEAR TONE
                Tone.Transport.cancel();
                Tone.Transport.clear();

                // CHECK & RESTART
                for (let instrument in parts[name].instrumentCollection) {
                    console.log(`check & restart process for instrument ${instrument}`);
                    // check if saved part instrument exists in instruments
                    if (instruments[instrument]) {
                        console.log(`instrument ${instrument} exists in 'instruments'`);
                        // restart instrument, if it is playing in part
                        if (parts[name].instrumentCollection[instrument].isPlaying) {
                            console.log(
                                `instrument ${instrument} is playing: `,
                                instruments[instrument].isPlaying
                            );
                            // instruments[instrument].start();
                            instruments[instrument].restart();
                        } else {
                            console.log(`stop instrument ${instrument}. `);
                            instruments[instrument].stop();
                        }
                    } else {
                        console.log(`play part ${name}: instrument ${instrument} is gone.`);
                    }
                }

                // NO - get errors with BPM change
                // Tone.Transport.bpm.value = parts[name].bpm;

                // start Tone
                if (Tone.Transport.state != "started") Tone.Transport.start();
            } else {
                // IF INSTRUMENT
                // ===========
                // handle input
                for (let i in input.phrases) {
                    name = input.phrases[i];
                    // if they are valid instruments
                    if (listOfAllAvailableInstruments.includes(name)) {
                        // printer(debug, context, "check instruments", instruments[name])
                        // if they exist already, just start
                        if (instruments[name]) {
                            instruments[name].restart();
                            // if random value, set Instrument
                            if (random != null) instruments[name].random = random;
                        } else {
                            // else make new
                            instruments[name] = new Instrument(name);
                            // if random value, set Instrument
                            if (random != null) instruments[name].random = random;
                        }
                        // push name of running inst for rendering
                        returnMessage.instruments.push(name);
                    } else {
                        returnMessage.cmd = "noSuchInstrument";
                        returnMessage.string = name;
                        returnMessage.noInstrument.push(name);
                    }
                }
            }
            // console.log("Instruments: ", instruments);
            if (Tone.Transport.state != "started") Tone.Transport.start();
            break;

        case "assignPattern":
            volume = input.volume[0];
            random = input.random;
            console.log("volume", volume);
            for (let i in input.phrases) {
                name = input.phrases[i];
                console.log("name", name);
                if (listOfAllAvailableInstruments.includes(name)) {
                    if (instruments[name]) {
                        // printer(debug, context, `assignPatternOne - ${input.pattern} to instrument:`, input.phrases);
                        instruments[name].setPattern(input.pattern, input.patternString);

                        // if random value, set Instrument
                        if (random != null) instruments[name].random = random;

                        // if a volume is specified, set volume
                        if (volume) instruments[name].setVolume(volume);
                        console.log(`setvolume ${volume} for instrument: ${name}`);
                    } else {
                        // printer(debug, context, `assignPatternOne, create inst ${name} + pattern ${input.pattern}`, name);
                        instruments[name] = new Instrument(
                            name,
                            input.pattern,
                            input.patternString,
                            random
                        );
                        // if a volume is specified, set volume
                        if (volume) {
                            instruments[name].setVolume(volume);
                            console.log(`start & setvolume ${volume} for instrument: ${name}`);
                        }
                    }
                } else {
                    // console.log("no such name", name);
                    returnMessage.cmd = "noSuchInstrument";
                    returnMessage.string = name;
                    returnMessage.noInstrument.push(name);
                }
            }

            console.log("Instruments: ", instruments);
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
                            instruments[instrument] = new Instrument(
                                instrument,
                                pattern,
                                rawPattern
                            );
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
            // if (Tone.Transport.state != "stopped") Tone.Transport.stop();
            // Tone.Transport.cancel();
            // Tone.Transport.clear();
            // set time out for stability
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
                    returnMessage.noInstrument.push(instrument);
                }
            }
            // check if other instruments are still playing. if not, stop Tone
            let stillInstrumentsPlaying = false;
            for (let instrument in instruments) {
                console.log(instruments[instrument]);
                if (instruments[instrument].isPlaying) stillInstrumentsPlaying = true;
            }
            // if last playing instrument stopped && Tone still playing, than stop Tone
            if (Tone.Transport.state != "stopped" && !stillInstrumentsPlaying)
                Tone.Transport.stop();
            console.log("Tone.state: ", Tone.Transport.state);
            break;

        case "questionEvent":
            Object.keys(instruments).forEach((entry) => {
                console.log(`is sequence playing for ${entry}:`, instruments[entry].isPlaying);
            });

            break;

        case "setVolume":
            volume = input.volume;
            // for all phrases
            for (let i in input.phrases) {
                let instrument = input.phrases[i];
                // if they are valid instruments
                if (listOfAllAvailableInstruments.includes(instrument)) {
                    // if they exist already, set volume
                    if (instruments[instrument]) {
                        console.log(`setvolume ${volume} for instrument: ${instrument}`);
                        instruments[instrument].setVolume(volume);
                        // if instrument doesn't exist, create one and set volume
                    } else {
                        instruments[instrument] = new Instrument(instrument);
                        instruments[instrument].setVolume(volume);
                        console.log(`start & setvolume ${volume} for instrument: ${instrument}`);
                        // if last playing instrument stopped && Tone still playing, than stop Tone
                        if (Tone.Transport.state != "started") Tone.Transport.start();
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
                // if name free, save it in parts, including current instruments
                // init new part
                parts[part] = {
                    instrumentCollection: {},
                };
                console.log(`store instruments `, instruments);
                // store instruments and their playState in the part
                for (let instrument in instruments) {
                    parts[part].instrumentCollection[instrument] = {
                        isPlaying: instruments[instrument].isPlaying,
                        instrument: instruments[instrument],
                    };
                }
                console.log(`part ${part} saved in parts`, parts[part]);
            }
            break;

        case "setBPM":
            let bpm = input.bpm;
            if (bpm > 140) bpm = 140;
            if (bpm < 10) bpm = 10;
            let factor = input.factor;
            // if no factor, than just set bpm
            if (!factor) Tone.Transport.bpm.value = bpm;
            // if time factor, ramp to bpm
            else Tone.Transport.bpm.rampTo(bpm, factor);
            // send to return to set HTML
            returnMessage.cmd = "setBPM";
            break;

        case "deleteEvent":
            // handle input
            for (let i in input.phrases) {
                name = input.phrases[i];
                // if input is a part
                if (parts[name]) delete parts[name];
                // if they are valid instruments
                else if (listOfAllAvailableInstruments.includes(name)) {
                    // if they exist already, stop and delete
                    if (instruments[name]) {
                        instruments[name].clear();
                        delete instruments[name];
                    }
                } else {
                    returnMessage.cmd = "noSuchInstrument";
                    returnMessage.string = name;
                    returnMessage.noInstrument.push(name);
                }
            }
            break;

        case "deleteAllEvent":
            // clear & delete every instrument
            for (let instrument in instruments) {
                instruments[instrument].clear();
                delete instruments[instrument];
            }
            // delete all parts
            for (let part in parts) {
                delete parts[part];
            }
            // stop Tone
            if (Tone.Transport.state != "stopped") Tone.Transport.stop();
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
            returnMessage.cmd = "emptyInput";
            break;
    } // EO_Switch

    return returnMessage;
}; // EO parser
