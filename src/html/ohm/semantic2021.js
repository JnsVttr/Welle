
// WELLE - input grammar //
// =============================================================

/*
https://github.com/harc/ohm
use the online tester 

naming relates to grammar functions:
Sequence_seqPattern = topic Sequence, subFunction seqPattern

all returns are send to parseInput file
*/


// libraries
import grammarText from '/html/ohm/grammar2021';
import ohm from 'ohm-js';
import { printer } from '/helper/printer';

// variables
let livecode = ohm.grammar(grammarText);  // taken from grammar.js
let semantics = livecode.createSemantics();
let debug = true;
let context = "semantics2021";

// printer(debug, context, topic, element, value)
// let printer = (debug, element, value) => {
//     if (debug==true) {
//         console.log(`Semantics \t - ${element} >> ${value}`);
//     };
// }

// printer(debug, context, "consoletest", `debugSemantic: ${debugSemantic}/ debug: ${debug}`);





// ========================  Grammar & Semantic ====================== //

// SEMANTICS FOR OHM.JS LANGUAGE:
semantics.addOperation('eval', {
   
    Assignments_copyPattern: (source, _, phrases) => {
        source = source.sourceString;
        phrases = phrasesToArray(phrases);
        let event = 'copyPattern';
        return {
            event: event,
            source: source,
            phrases: phrases,
        }
    },

    Assignments_assignPattern: (phrases, pattern) => {
        let patternString = pattern.sourceString;
        phrases = phrasesToArray(phrases);
        pattern = pattern.eval();
        let event = 'assignPatternOne';
        if (phrases.length>1) event = 'assignPatternMulti'        
        return {
            event: event,
            phrases: phrases,
            pattern: pattern,
            patternString: patternString,
        }
    },

    Assignments_setBPM: (_, bpm, factor) => {
        bpm = bpm.sourceString;
        factor = factor.sourceString;
        let event = 'setBPM';
        if (factor!='') event = 'setExtraBPM';
        return {
            event: event,
            bpm: bpm,
            factor: factor,
        }
    },
    Assignments_setVolume: (phrases, volume) => {
        volume = volume.eval();
        phrases = phrasesToArray(phrases);
        let event = 'setVolume';
        return {
            event: event,
            phrases: phrases,
            volume: volume,
        }
    },
    Assignments_playListEvent: (phrases) => {
        phrases = phrasesToArray(phrases);
        let event = 'playList'
        return {
            event: event,
            phrases: phrases,
        }
    },








    // HELPER
    // ======================================
    
    Pattern: function(patternIn) {
        // here the incoming pattern gets evaluated
        var pattern = patternIn.asIteration().eval();
        // console.log('new at Pattern all incoming: ', pattern)
        var newPattern = [];
        for (let i=0;i<pattern.length;i++) {
            if (Array.isArray(pattern[i]) ) {
                for (let j=0; j<pattern[i].length;j++){
                    newPattern.push(pattern[i][j])
                };
            } else {
                newPattern.push(pattern[i]);
            };
            
        };
        //console.log('new at Pattern all: ', newPattern)
        return newPattern;
    },
    NestedEvents: function (b1,pat,b2,int) {
        var pattern = pat.asIteration().eval();
        var newPattern = [];
        int = int.eval();
        if (int.length!=0){
            // if muliplier, then repeat to push each entry to newPattern 
            for (let i=0; i<int;i++){
                for (let j=0; j<pattern.length;j++){
                    newPattern.push(pattern[j])
                };
            };    
        } else {
            newPattern = pattern;
        };
        //console.log('NestedEvents, pattern + newPattern + int: ', pattern, newPattern, int);
        return newPattern;
    },

    Events: function(a){
        return a.eval();
    },
    Events_soundNote: function (a, b) {
        if (b.sourceString!='') {
            return parseInt(b.sourceString);
        } else {
            return 1;
        }
    },
    Events_soundPause: function (a) {
        return 0;
    },
    floatPos: function(a) {
        var val = parseFloat(a.sourceString);
        return val;
    },
    intPos: function(a) {
        var val = parseInt(a.sourceString);
        return val;
    },
});












// ============================================================================= //

// Helper function for semantics.addOperation
function phrasesToArray (b) {
    // convert multiple instruments from String to Array
    var list = b.sourceString;
    var newArray = [];
    if (list==""){
        newArray = [];
    } else {
        list = list.split(' ');
        for (var i=0;i<list.length;i++){
            if (list[i]!=''){
                newArray.push(list[i]);
            };
        };
    };
    return newArray;
};

function handleRand(rand){
    if (rand==""){rand=0};
    return rand;
};

function handlePattern(pat){
    var pattern = pat;
    if (pattern.length==0){pattern=[]} else {pattern = pattern[0];};
    return pattern;
};







export { livecode, semantics } 
