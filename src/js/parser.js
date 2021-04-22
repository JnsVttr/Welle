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
    // if (App.debug) console.log(`Parser inputs: ${JSON.stringify(input, null, 2)}`);

    switch (input.event) {
        case "plainStartEvent":
            App.plainStartInstruments({
                instruments: input.phrases,
                random: input.random,
            });
            break;

        case "assignPattern":
            App.assignPattern({
                instruments: input.phrases,
                pattern: input.pattern,
                rawPattern: input.patternString,
                volume: input.volume[0],
                random: input.random,
            });
            break;

        case "copyPattern":
            App.copyPattern({
                source: [input.source],
                destinations: input.phrases,
            });
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
            break;

        case "savePartEvent":
            App.savePart(input.phrase);
            break;

        case "setBPM":
            App.setBpm({ bpm: input.bpm, factor: input.factor });
            break;

        case "deleteEvent":
            App.delete(input.phrases);
            break;
        case "deleteWordEvent":
            App.deletePreset(input.phrase);
            break;

        case "deleteAllEvent":
            App.deleteAll();
            break;

        case "saveEvent":
            break;

        case "joinEvent":
            App.setUser(input.phrase);
            Socket.emit("newUser", { user: input.phrase });
            break;

        case "restartEvent":
            break;

        case "storeEvent":
            const preset = App.createPreset(input.phrase);
            // console.log(`preset ${preset.name}: ${JSON.stringify(preset, null, 0)}`);
            if (preset) Socket.emit("storePreset", preset);
            break;

        case "loadEvent":
            const name = input.phrase;
            App.loadPreset(name);
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
}; // EO parser
