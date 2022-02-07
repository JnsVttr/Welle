// WELLE - parser
// =============================================================

/*
manage semantics returns
delegate input to tone, sockets, html
*/

// libraries, functions, classes
import { App, Socket } from "/index";

// function to interpret input and send to TONE via transport or to html etc.
export const parser = (input) => {
    // show parser input
    // console.log(`Parser inputs: ${JSON.stringify(input, null, 2)}`);

    switch (input.event) {
        case "instrumentPreview":
            App.instrumentPreview({
                instruments: input.phrases,
            });
            // App.sendMidiSelectedInstState();
            break;

        case "assignPattern":
            App.assignPattern({
                instruments: input.phrases,
                pattern: input.pattern,
                rawPattern: input.patternString,
                volume: input.volume[0],
                random: input.random,
            });
            setTimeout(() => {
                // App.sendMidiSelectedInstState();
            }, 100);
            break;

        case "copyPattern":
            App.copyPattern({
                source: [input.source],
                destinations: input.phrases,
            });
            // App.sendMidiSelectedInstState();
            break;

        case "playAllEvent":
            App.playAll();
            break;

        case "stopAllEvent":
            App.stopAll();
            break;

        case "stopEvent":
            App.stopInstruments(input.phrases);
            break;

        case "questionEvent":
            // App.setSelectedEq();
            // App.setEnvToSelected();
            break;

        case "setVolume":
            App.setVolume({ instruments: input.phrases, volume: input.volume });
            // App.sendMidiSelectedInstState();
            break;
        case "setVolumeRandom":
            App.setVolumeRandom({ instruments: input.phrases, volume: input.volume, random: input.random });
            // App.sendMidiSelectedInstState();
            break;

        case "savePartEvent":
            App.savePart(input.phrase);
            break;

        case "setBPM":
            App.setBpm({ bpm: input.bpm, factor: input.factor });
            break;

        case "setEnv":
            App.setEnvelope({
                instruments: input.phrases,
                attack: input.attack,
                decay: input.decay,
                release: input.release,
            });
            break;

        case "deleteEvent":
            App.delete(input.phrases);
            break;
        case "deleteWordEvent":
            // App.deletePreset(input.phrase);
            break;

        case "deleteAllEvent":
            App.deleteAll();
            break;

        case "saveEvent":
            break;

        case "joinEvent":
            // App.setUser(input.phrase);
            // Socket.emit("newUser", { user: input.phrase });
            break;

        case "restartEvent":
            break;

        case "storeEvent":
            // const preset = App.createPreset(input.phrase);
            // console.log(`preset ${preset.name}: ${JSON.stringify(preset, null, 0)}`);
            // if (preset) Socket.emit("storePreset", preset);
            break;

        case "loadEvent":
            // const name = input.phrase;
            // App.loadPreset(name);
            break;

        case "uploadEvent":
            break;

        case "recordEvent":
            const recordAction = input.phrase;
            // console.log(`Record action: ${recordAction}`);
            if (recordAction == "start") App.handleRecord();
            if (recordAction == "stop") App.handleRecord();
            break;

        case "muteAllEvent":
            break;

        case "unmuteAllEvent":
            break;

        case "emptyEvent":
            break;
    } // EO_Switch
}; // EO parser
