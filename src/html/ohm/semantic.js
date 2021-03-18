
// WELLE - input grammar //
// =============================================================

/*
https://github.com/harc/ohm
use the online tester 

naming relates to grammar functions:
Sequence_seqPattern = topic Sequence, subFunction seqPattern
*/


// libraries
import grammarText from '/html/ohm/grammar';
import ohm from 'ohm-js';
// variables
let livecode = ohm.grammar(grammarText);  // taken from grammar.js
let semantics = livecode.createSemantics();
let debug = true;



// ========================  Grammar & Semantic ====================== //

// SEMANTICS FOR OHM.JS LANGUAGE:
semantics.addOperation('eval', {
    /* 
        Trying to pre-calculate all values here, 
        Delivering easy-to-read array to the page

        Naming convention: [name, val]
        command - play etc.
        instArray - multiple instruments
        pattern - array of pattern
        rand - integer
        inst - string ("bass")
        sel - integer
        vol - float (max 1.0)
        bpm - integer
        concat - ??

        Helper functions: instToArray, handleRand, handlePattern
    */

    /* SEQUENCE HANDLING */
    Sequence_seqPattern: (key, inst, pat, rand) => {
        let instArray = instToArray(inst);
        let random = handleRand(rand.eval());
        let pattern = handlePattern(pat.eval());
        let command = key.eval();
        
        //printer(debug, "Sequence_seqPattern", `process pattern in Control: "${pat.sourceString}" calc: "${pat.eval()}" handle: "${pattern}"`);
        printer(debug, "Sequence_seqPattern", `
        return [
            "transport", "sequenceStart", 
            ["command", ${command}], 
            ["instArray", ${instArray}], 
            ["pattern", ${pattern}], 
            ["rand", ${random}]
        ]`
        );
        
        return [
            "transport", "sequenceStart", 
            ["command", command], 
            ["instArray", instArray], 
            ["pattern", pattern], 
            ["rand", random]
        ];
    },




    General_savePart: (_, name) => {
        name = name.sourceString;
        return [
            "general", "savePart",
            ["savePart", name],
        ];
    },
    General_setPart: function (_, name) {
        name = name.sourceString;
        return [
            "general", "setPart",
            ["setPart", name],
        ];
    },
    General_deleteElement: function (_, name) {
        name = instToArray(name);
        return [
            "general", "deleteElement",
            ["deleteElement", name],
        ];
    },
    General_muteOn: function (name) {
        return [
            "helper", "muteOn", 
        ];
    },
    General_muteOff: function (name) {
        return [
            "helper", "muteOff", 
        ];
    },
    General_recordStart: function (name) {
        return [
            "helper", "recordStart", 
        ];
    },
    General_recordStop: function (name) {
        return [
            "helper", "recordStop", 
        ];
    },
    General_uploadDefault: function (_) {
        return [
            "helper", "uploadFiles", 
        ];
    },
    General_uploadFiles: function (_, file) {
        var string = file.sourceString;
        return [
            "helper", "uploadFiles", 
            ["inst", string], 
        ];
    },
    General_restart: function (cmd) {
        return [cmd.sourceString];
    },
    General_joinName: function (join, list) {
        return ['join', instToArray(list)];
    },
    General_storePreset: function (_, preset) {
        return ["helper", 'store', 
            ['inst', preset.sourceString]
        ];
    },
    General_reloadPreset: function (_, preset) {
        return ["helper_toAll", 'reload', 
            ['inst', preset.sourceString]
        ];
    },






    /* TRANSPORT CONTROL HANDLING */
    Controls_copyPattern: function(instSource, _,  instDest) {
        var inst = instSource.sourceString;
        var dest = instToArray(instDest);
        printer(debug, "Controls_copyPattern", `
            return [
                "control", "patternCopy", 
                ["inst", ${inst}], 
                ["instArray", ${dest}]
            ];
        `);
        return [
            "control", "patternCopy", 
            ["inst", inst], 
            ["instArray", dest]
        ];
    },

    Controls_listInstruments: function(_, inst) {
        var inst = inst.sourceString;
        printer(debug, "Controls_listInstruments", `
        return [
            "helper", "list", 
            ["inst", ${inst}]
        ]`);
        return [
            "helper", "list", 
            ["inst", inst]
        ];
    },

    Controls_selectInstrument: function(_, inst, sel) {
        var inst = inst.sourceString;
        sel = sel.eval();
        
        printer(debug, "Controls_selectInstrument", `
        return [
            "control", "instSelect", 
            ["inst", ${inst}], 
            ["sel", ${sel}],
        ];
        `);
        return [
            "control", "instSelect", 
            ["inst", inst], 
            ["sel", sel],
        ];
    },

    Controls_setInstrumentVolume: function(_, volume, inst) {
        var instArray = instToArray(inst);
        var vol = volume.eval();
        if (vol>1) {vol=1};
    
        printer(debug, "Controls_setInstrumentVolume", `
        return [
            "control", "instVolume",
            ["instArray", ${instArray}],
            ["vol", ${vol}],
        ];
        `);
        return [
            "control", "instVolume",
            ["instArray", instArray],
            ["vol", vol],
        ];
    },

    Controls_assignRandom: function(rand, inst) { 
        var instArray = instToArray(inst);
        var random = handleRand(rand.eval());
        var random = rand.eval();
        
        printer(debug, "Controls_assignRandom", `
        return [
            "control", "instRand", 
            ["instArray", ${instArray}], 
            ["rand", ${random}],
        ];
        `)
        return [
            "control", "instRand", 
            ["instArray", instArray], 
            ["rand", random],
        ];
    },

    Controls_assignPattern: function(inst, pat, rand) {
        var random = handleRand(rand.eval());
        var pattern = pat.eval();
        pattern = [pattern]; // Array conversion only neccessary here, don't know why 
        pattern = handlePattern(pattern);
        
        var instArray = instToArray(inst);
        
        printer(debug, "Controls_assignPattern", `
        return [
            "control", "patternAssign", 
            ["instArray", ${instArray}], 
            ["pattern", ${pattern}], 
            ["rand", ${random}] 
        ];
        `)
        return [
            "control", "patternAssign", 
            ["instArray", instArray], 
            ["pattern", pattern], 
            ["rand", random] 
        ];
    },

    Controls_initInstrument: function(inst,_,name, a, num, b) { 
        inst = inst.sourceString;
        name = name.sourceString;
        num = num.sourceString;
        
        printer(debug, "Controls_initInstrument", `
        return [
            "control", "initInst", 
            ["inst", ${inst}], 
            ["initInst", ${name}],
            ["num", ${num}],
        ];
        `);
        return [
            "control", "initInst", 
            ["inst", inst], 
            ["initInst", name],
            ["num", num],
        ];
    },

    Controls_showInstrument: function(_, instrument) {
        var inst = instrument.sourceString;
        printer(debug, "Controls_showInstrument", `
        return [
            "helper", "show", 
            ["inst", ${inst}],
        ];    
        `)
        return [
            "helper", "show", 
            ["inst", inst],
        ];
    },

    Controls_bpm: function(_, bpm, time) {
        bpm = bpm.sourceString;
        time = time.sourceString;
        printer(debug, "Controls_bpm", `
        return [
            "control", "setBPM", 
            ["bpm", ${bpm}],
            ["num", ${time}],
        ];
        `);
        return [
            "control", "setBPM", 
            ["bpm", bpm],
            ["num", time],
        ];
    },

    // Controls_concatInstruments: function(concat) {
    //     // ???
    //     let instConcat = concat.eval();
    //     //instConcat = concat.sourceString;
    //     if (instConcat=="") {
    //         return ''
    //     } else {
    //         return ["control", "instrumentConcat", instConcat];
    //     }
    // },

    Controls_helpText: function(_, text) {
        text = text.sourceString;
        printer(debug, "Controls_helpText", `
        return [
            "helper", "helpText",
            ["help", ${text}]
        ]; 
        `);
        return [
            "helper", "helpText",
            ["help", text]
        ]; 
    },
    Controls_help: function(_) {
        printer(debug, "Controls_help", `
        return [
            "helper", "help",
        ];
        `);
        return [
            "helper", "help",
        ]; 
    },
    Controls_clear: function(_) {
        printer(debug, "Controls_clear", `
        return [
            "helper", "clear",
        ];`);
        return [
            "helper", "clear",
        ]; 
    },







 
    /* LANGUAGE INTERNAL FUNCTION HANDLING */
    // ============================================= //

    Command_playSeq: function (cmd) {
        return ["play"];
    },
    Command_playSeqPlus: function (cmd) {
        return ["play"];
    },
    /*
    Command_playSeqSolo: function (cmd) {
        return ["", ""];
    },
    */
    Command_stopSeq: function (cmd) {
        return ["stop"];
    },
    Command_stopSeqPlus: function (cmd) {
        return ["stop"];
    },
    Command_forSeq: function (cmd, count) {
        return [cmd.sourceString, parseInt(count.sourceString)];
    },
    Command_inSeq: function (cmd, count) {
        return [cmd.sourceString, parseInt(count.sourceString)];
    },
    Command_reset: function (cmd) {
        return [cmd.sourceString];
    },








    // InstrumentConcat: function (concat) {
    //     var arr = concat.asIteration().eval()
    //     var arrString = JSON.stringify(arr);
    //     if ( (arrString.split(",").length - 1) < 2) {arr=""}
    //     return arr;
    // },
    InstrumentRepeat_instrumentEntry: function (inst, count) {
        var instrument = inst.sourceString;
        var repeat = count.sourceString;
        if (repeat=='') {repeat=1};
        var arr = [instrument, repeat];
        printer(debug, "InstrumentRepeat_instrumentEntry", `
        return ${arr};
        `);
        return arr;
    },

    PatternRandom_randomize: function(cmd, count) {
        count = count.sourceString;
        var intCheck = false;
        if (count.length==0){
            intCheck = false;
            count=0;
        }else{
            intCheck = true;
            count = parseInt(count);
        };
        if (!intCheck){count=1};
        return count;
    },
    PatternRandom_randomizeOff: function(cmd, cmd2) {
        var randVal = 0
        return randVal;
    },
    


    /*
    drums (#2#3-#)3-#3 (#11#22) #1#2
    */
    Pattern: function(pat) {
        var pattern = pat.asIteration().eval();
        //console.log('new at Pattern all incoming: ', pattern)
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
function instToArray (b) {
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



// printer(debug, topic, element, value)
let printer = (debug, element, value) => {
    if (debug==true) {
        console.log(`Semantics - ${element} >> ${value}`);
    };
}



export { livecode, semantics } 
