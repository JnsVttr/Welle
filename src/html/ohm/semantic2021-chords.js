// WELLE - grammar and semantic
// =============================================================

// libraries
import grammarText from "/html/ohm/grammar2021";
import ohm from "ohm-js";
import { printer } from "/helper/printer";

// variables
let livecode = ohm.grammar(grammarText); // taken from grammar.js
let semantics = livecode.createSemantics();
let debug = true;
let context = "semantics";

// printer(debug, context, "consoletest", `debugSemantic: ${debugSemantic}/ debug: ${debug}`);

// SEMANTICS FOR OHM.JS LANGUAGE:
semantics.addOperation("eval", {
    Commands_questionEvent: (_, phrases) => {
        phrases = phrasesToArray(phrases);
        let event = "questionEvent";
        // if (phrases.length>1) event = 'playMultiEvent'
        return {
            event: event,
            phrases: phrases,
        };
    },

    Commands_playMultiEvent: (_, phrases) => {
        phrases = phrasesToArray(phrases);
        // is the same event like plainStartEvent, just with > at the beginning
        let event = "plainStartEvent";
        return {
            event: event,
            phrases: phrases,
        };
    },
    Commands_stopMultiEvent: (_, phrases) => {
        phrases = phrasesToArray(phrases);
        let event = "stopEvent";
        // if (phrases.length > 1) event = 'stopMultiEvent'
        return {
            event: event,
            phrases: phrases,
        };
    },
    Commands_savePartEvent: (_, phrase) => {
        phrase = phrase.sourceString;
        let event = "savePartEvent";
        return {
            event: event,
            phrase: phrase,
        };
    },
    Commands_deletEvent: (_, phrases) => {
        phrases = phrasesToArray(phrases);
        let event = "deleteEvent";
        if (phrases.length > 1) event = "deleteMultiEvent";
        return {
            event: event,
            phrases: phrases,
        };
    },
    Commands_saveEvent: (_, phrase) => {
        phrase = phrase.sourceString;
        let event = "saveEvent";
        return {
            event: event,
            phrase: phrase,
        };
    },
    Commands_joinEvent: (_, phrase) => {
        phrase = phrase.sourceString;
        let event = "joinEvent";
        return {
            event: event,
            phrase: phrase,
        };
    },
    Commands_restartEvent: (_, phrase) => {
        phrase = phrase.sourceString;
        let event = "restartEvent";
        return {
            event: event,
            phrase: phrase,
        };
    },
    Commands_storeEvent: (_, phrase) => {
        phrase = phrase.sourceString;
        let event = "storeEvent";
        return {
            event: event,
            phrase: phrase,
        };
    },
    Commands_loadEvent: (_, phrase) => {
        phrase = phrase.sourceString;
        let event = "loadEvent";
        return {
            event: event,
            phrase: phrase,
        };
    },
    Commands_uploadEvent: (_, phrase) => {
        phrase = phrase.sourceString;
        let event = "uploadEvent";
        return {
            event: event,
            phrase: phrase,
        };
    },
    Commands_muteEvent: (_) => {
        let event = "muteAllEvent";
        return {
            event: event,
        };
    },
    Commands_unmuteEvent: (_) => {
        let event = "unmuteAllEvent";
        return {
            event: event,
        };
    },
    Commands_playAllEvent: (_) => {
        let event = "playAllEvent";
        return {
            event: event,
        };
    },
    Commands_stopAllEvent: (_) => {
        let event = "stopAllEvent";
        return {
            event: event,
        };
    },
    Commands_deleteAllEvent: (_) => {
        let event = "deleteAllEvent";
        return {
            event: event,
        };
    },

    Assignments_copyPattern: (source, _, phrases) => {
        source = source.sourceString;
        phrases = phrasesToArray(phrases);
        let event = "copyPattern";
        return {
            event: event,
            source: source,
            phrases: phrases,
        };
    },

    Assignments_assignPattern: (phrases, volume, pattern, random) => {
        volume = volume.eval();
        // console.log("semantics - assignPattern, randomSourceString: ", random.sourceString);
        if (random.sourceString == "") random = null;
        else {
            random = random.sourceString.replace("%", ""); // '%2'
            random = parseInt(random);
        }
        let patternString = pattern.sourceString;
        phrases = phrasesToArray(phrases);
        pattern = pattern.eval();
        let event = "assignPattern";
        if (phrases.length > 1) event = "assignPattern";
        return {
            event: event,
            phrases: phrases,
            pattern: pattern,
            patternString: patternString,
            volume: volume,
            random: random,
        };
    },

    Assignments_setBPM: (_, bpm, factor) => {
        bpm = bpm.sourceString;
        factor = factor.sourceString;
        let event = "setBPM";
        return {
            event: event,
            bpm: bpm,
            factor: factor,
        };
    },
    Assignments_setVolume: (phrases, volume) => {
        volume = volume.eval();
        phrases = phrasesToArray(phrases);
        let event = "setVolume";
        return {
            event: event,
            phrases: phrases,
            volume: volume,
        };
    },
    Assignments_plainStartEvent: (phrases, random) => {
        if (random.sourceString == "") random = null;
        else {
            random = random.sourceString.replace("%", ""); // '%2'
            random = parseInt(random);
        }
        phrases = phrasesToArray(phrases);
        let event = "plainStartEvent";
        return {
            event: event,
            phrases: phrases,
            random: random,
        };
    },
    Assignments_emptyEvent: (_) => {
        let event = "emptyEvent";
        return {
            event: event,
        };
    },

    // PATTERN CREATION
    // ======================================

    Pattern: function (pattern) {
        // here the incoming pattern gets evaluated
        pattern = pattern.asIteration().eval();
        console.log('Pattern: incoming: ', pattern);
        var finalPattern = [];

        for (let i in pattern) {
            if (pattern[i] == null) {
                console.log(`pattern is pause: ${pattern[i]}`);
                finalPattern.push(pattern[i]);
            } else if (pattern[i].eventsRepeats) {
                console.log(`pattern is eventsRepeats: ${pattern[i].eventsRepeats}`);
                let subPattern = pattern[i].eventsRepeats;
                for (let a in subPattern) {
                    if (subPattern[a].notesChord) {
                        console.log(`subPattern is notesChord: ${subPattern[a].notesChord}`);
                        finalPattern.push(subPattern[a].notesChord);
                    } else {
                        console.log(`subPattern is note: ${subPattern[a]}`);
                        finalPattern.push(subPattern[a]);
                    };
                };
            } else if (pattern[i].notesChord) {
                console.log(`pattern is notesChord: ${pattern[i].notesChord}`);
                finalPattern.push(pattern[i].notesChord);
            } else {
                console.log(`pattern is note: ${pattern[i]}`);
                finalPattern.push(pattern[i]);
            }
        }

        console.log('Pattern: out finalPattern: ', finalPattern)
        return finalPattern;
    },

    EventsRepeats: function (_, pattern, __, int) {
        pattern = pattern.asIteration().eval();
        console.log(`EventsRepeats pattern: ${pattern}`)
        var eventsRepeats = [];
        int = int.eval();
        if (int.length != 0) {
            // if muliplier, then repeat to push each entry to newPattern
            for (let i = 0; i < int; i++) {
                for (let j = 0; j < pattern.length; j++) {
                    eventsRepeats.push(pattern[j]);
                }
            }
        } else {
            eventsRepeats = pattern;
        }
        console.log('EventsRepeats: eventsRepeats * int: ', eventsRepeats);
        return {eventsRepeats: eventsRepeats};
    },

    

    Event: function (event) {
        // console.log(`Event: ${event.eval()}`)
        return event.eval();
    },

    NotesChord: function(_, chord, __) {
        console.log(`NotesChord chord source: ${chord.sourceString}`);
        chord = chord.asIteration().eval();
        // console.log(`NotesChord chord asIteration eval: ${chord}`);
        let notesChord = [];
        for (let item in chord) {
            // console.log(`chord item: chord[item] ${chord[item]}`)
            notesChord.push(chord[item]);
        };
        console.log(`NotesChord: array: ${notesChord}`);
        return {notesChord: notesChord};
    },

    Notes_soundNote: function (_, note) {
        if (note.sourceString != "") {
            return parseInt(note.sourceString);
        } else {
            return 1;
        }
    },
    Notes_soundPause: function (_) {
        return null;
    },
    floatPos: function (float) {
        float = parseFloat(float.sourceString);
        return float;
    },
    intPos: function (int) {
        int = parseInt(int.sourceString);
        return int;
    },
});

// ============================================================================= //

// Helper function for semantics.addOperation
function phrasesToArray(phrases) {
    // convert multiple instruments from String to Array
    phrases = phrases.sourceString;
    let phrasesArray = [];
    if (phrases == "") {
        phrasesArray = [];
    } else {
        phrases = phrases.split(" ");
        for (var i = 0; i < phrases.length; i++) {
            if (phrases[i] != "") {
                phrasesArray.push(phrases[i]);
            }
        }
    }
    return phrasesArray;
}

export { livecode, semantics };
