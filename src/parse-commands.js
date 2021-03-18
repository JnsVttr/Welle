
// WELLE - parse commands //
// =============================================================

/*
https://github.com/harc/ohm
use the online tester 

all commands are coming from semantic.js

parser getting/setting plenty of stuff from other parts, tone/html/index

basically triggers all relevant functions in other files.
not nice
*/



import { transport }  from '/tone/main-tone' 
import { renderHtmlHelp }  from  '/html/renderHTML';
import { help }  from '/text/helpText';
import { 
    setUser,
    showFiles, 
    alertState, 
    presetHandling
}  from '/index' 
import { printer } from '/helper/printer';
import { restartServer } from '/socket/restartServer';
import { playAlerts } from '/helper/playAlerts';


let debug = true;
let context = "parser";

const parseInput = (input) => {
    
    // all possible semantic variables 
    let type='', desc='', cmd='', inst='', instArray='', patternParse='', 
        rand='', sel='', vol='', name='', bpm='', helpText='', num='';

    // extract input from semantic.js parsing:
    type = input[0] || '';
    desc = input[1] || '';

    //if messages come ["name", value]
    Object.keys(input).forEach(key => {
        if (Array.isArray(input[key])){
            var desc = input[key][0];
            var value = input[key][1];
            switch (desc) {
                case "command":
                    cmd = value;
                break;
                case "pattern":
                    patternParse = value;
                break;
                case "instArray":
                    instArray = value;
                break;
                case "inst":
                    inst = value;
                break;
                case "rand":
                    rand = parseInt(value);
                break;
                case "sel":
                    sel = value;
                break;
                case "vol":
                    vol = value;
                break;
                case "bpm":
                    bpm = value;
                break;
                case "savePart":
                    name = value;
                break;
                case "setPart":
                    name = value;
                break;
                case "deleteElement":
                    instArray = value;
                break;
                case "initInst":
                    name = value;
                break;
                case "help":
                    helpText = value;
                break;
                case "num":
                    num = value;
                break;
            };
        };
    });

    printer(debug, context, "incoming", `
            type: \t\t ${type}
            desc: \t\t ${desc}
            cmd: \t\t ${cmd}
            inst: \t\t ${inst}
            instArray: \t ${instArray}
            pattern: \t ${patternParse}
            rand: \t\t ${rand}
            sel: \t\t ${sel}
            vol: \t\t ${vol}
            bpm: \t\t ${bpm}
            name: \t\t ${name}
            help: \t\t ${helpText}
            num: \t\t ${num}
    `);

    




    // tests:
    if (patternParse=='' && Array.isArray(patternParse)) {patternParse[0] = null};
    

    // ==================================================================== //
    // assign input "Sequence" (play etc.)
    if (desc=="sequenceStart"){
        // play instrument function
        if (cmd=="play" && instArray.length>0) {
            // for every instrument send name, pattern and random statement 
            for (let i=0;i<instArray.length;i++){
                let singleInst = instArray[i];
                setTimeout(function(){
                    //do what you need here
                    transport('play', singleInst, instArray, patternParse, rand, vol, bpm, name, num);    
                }, (i+1)*30);
            };
        // playAgainFunc() - if just "play" command without instruments
        } else if (cmd=="play") {
            transport('playAll');
        };

        // stopFunc() - for individual instruments
        if (cmd=="stop" && instArray.length>0) {
            for (let i=0;i<instArray.length;i++){
                let singleInst= instArray[i];
                transport('stop', singleInst);
            };
        // stopAll() - for overall stop     
        } else if (cmd=="stop"){
            transport('stopAll')
        };
        if (cmd[0]=="reset") {
            transport('reset')
        };
    };    
    

    // CtrlAssFunc() - assign "Pattern" to instruments 
    if (desc=="patternAssign"){
        for (let i=0;i<instArray.length;i++){
            let singleInst = instArray[i];
            setTimeout(function(){
                //do what you need here
                transport('play', singleInst, instArray, patternParse, rand, vol, bpm, name, num);
            }, (i+1)*30);
        };
    };
    
    // patternCopyFunc() - copy pattern to multiple instruments and play them
    if (desc=="patternCopy"){
        transport('patternCopy', inst, instArray, patternParse, rand, vol, bpm, name, num);
    };

    // setVolFunc
    if (desc=="instVolume"){
        for (let i=0;i<instArray.length;i++){
            let singleInst = instArray[i];
            transport('setVolume', singleInst, instArray, patternParse, rand, vol, bpm, name, num);
        };
    };

    // ctrlRandFunc
    if (desc=="instRand"){
        for (let i=0;i<instArray.length;i++){
            let singleInst = instArray[i];
            transport('setRandom', singleInst, instArray, patternParse, rand, vol, bpm, name, num);
        };
    };

    // ctrlBpmFunc() - set BPM 
    if (desc=="setBPM"){
        transport('setBPM', inst, instArray, patternParse, rand, vol, bpm, name, num);
    };

    // list stuff
    if (desc=="list"){
        let string = inst; // e.g. files
        showFiles(string);
    };
    // mute On
    if (desc=="muteOn"){
        printer(debug, context, "muteOn", "mute audio")
        transport('muteOn');
    };
    // mute Off
    if (desc=="muteOff"){
        printer(debug, context, "muteOff", "unmute audio")
        transport('muteOff');
    };
    // record start
    if (desc=="recordStart"){
        transport('recordStart');
    };
    // record stop
    if (desc=="recordStop"){
        transport('recordStop');
    };
    // upload Files
    if (desc=="uploadFiles"){
        var file = inst;
        transport('uploadFiles', file);
    };
    // restart server
    if (type=="restart server"){
        printer(debug, context, "restart server", "restart server")
        restartServer();
    };
    // join session    
    if (type=="join"){
        let session = desc[1];
        let user = desc[0];
        printer(debug, context, "join", `join session "${session}" as user "${user}"`);
        setUser(user, session);
    };
    // presets store
    if (type=="helper"){
        let action = desc;
        let preset = inst;
        if (action=='store') {
            printer(debug, context, "preset store", `${action} preset "${preset}" on server"`);
            presetHandling(preset, action);
        };
        if (action=='reload') {
            printer(debug, context, "preset reload", `${action} preset "${preset}" on server"`);
            presetHandling(preset, action);
        };
    };
    // presets reload to all
    if (type=="helper_toAll"){
        let action = desc;
        let preset = inst;
        if (action=='reload') {
            printer(debug, context, "preset reload to all", `${action} preset "${preset}" on server"`);
            presetHandling(preset, action);
        };
    };








    // ctrlHelpFunc  
    if (desc=="helpText"){
        helpText; // this is the destination
        help; // this is the help container
        if (help[helpText] != undefined) {
            if (helpText=='examples') { 
                // render with links
                let links = true;
                renderHtmlHelp(help[helpText],'help-container', 100, links);
                playAlerts('bottom', alertState);   
            } else {
                // render without links
                renderHtmlHelp(help[helpText],'help-container', 100);
                playAlerts('bottom', alertState);   
            };
            
        } else {
            playAlerts('error', alertState);
        };
    };

    // save part
    if (desc=="savePart"){
        transport('savePart', inst, instArray, patternParse, rand, vol, bpm, name, num);
        playAlerts('bottom', alertState);
    };
    // set part
    if (desc=="setPart"){
        transport('setPart', inst, instArray, patternParse, rand, vol, bpm, name, num);
    };
    // delete element
    if (desc=="deleteElement"){
        transport('deleteElement', inst, instArray, patternParse, rand, vol, bpm, name, num);
    };
    // clear part
    if (desc=="clear"){
        transport('clearPart', inst, instArray, patternParse, rand, vol, bpm, name, num);
    };

    // initInstrument
    if (desc=="initInst"){
        transport('initInst', inst, instArray, patternParse, rand, vol, bpm, name, num);
    };
    

    
    // ctrlShowFunc
    // ctrlListFunc
    // ctrlSelFunc
    // ctrlSetFunc
    
    // update & return valid input
    if (type == '') {return false} else {return true};
};








export { parseInput }

