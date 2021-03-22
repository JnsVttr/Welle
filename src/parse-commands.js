
// WELLE - parse commands //
// =============================================================

/*
https://github.com/harc/ohm
use the online tester 

all commands are validated by semantic.js

sends message via 'transport' to tone
updates html, server, etc.
*/


// libraries
import { transport }  from '/tone/main-tone' 
import { printer } from '/helper/printer';

// local variables
let debug = true;
let context = "parser";




// function to interpret input and send to TONE via transport or to html etc.
export const parseInput = (input) => {

    printer(debug, context, "incoming content from index/semantic: ", input);

    // variable for transport return
    let parserReturnData = {
        toneReturn: {},
        parserReturn: {},
    };

    // declare object/ container for all possible semantic variables 
    let inputContent = {
        type: '', desc: '', cmd: '', inst: '', instArray: '', pattern: '', 
        rand: '', sel: '', vol: '', name: '', bpm: '', helpText: '', num:''
    }; 

    inputContent.type = input[0];
    inputContent.desc = input[1];

    
    // extract subarrays: if messages come ["name", value], assign values to previously created variables
    Object.keys(input).forEach(key => {

        // only if key of input is an (sub) array
        if (Array.isArray(input[key])){
            // content to iterate
            let desc = input[key][0];
            let value = input[key][1];
            
            switch (desc) {
                case 'command':
                    inputContent.cmd = value.toString();
                break;
                case "pattern":
                    inputContent.pattern = value;
                break;
                case "instArray":
                    inputContent.instArray = value;
                break;
                case "inst":
                    inputContent.inst = value;
                break;
                case "rand":
                    inputContent.rand = parseInt(value);
                break;
                case "sel":
                    inputContent.sel = value;
                break;
                case "vol":
                    inputContent.vol = value;
                break;
                case "bpm":
                    inputContent.bpm = value;
                break;
                case "savePart":
                    inputContent.name = value;
                break;
                case "setPart":
                    inputContent.name = value;
                break;
                case "deleteElement":
                    inputContent.instArray = value;
                break;
                case "initInst":
                    inputContent.name = value;
                break;
                case "help":
                    inputContent.helpText = value;
                break;
                case "num":
                    inputContent.num = value;
                break;
            };

            
        };
    });
    

    printer(debug, context, "fixing pattern: ", inputContent.pattern)
    // change pattern to notes:
    for (let i=0; i<inputContent.pattern.length; i++){
        if (inputContent.pattern[i]=='-') inputContent.pattern[i] = null;
        if (inputContent.pattern[i]=='#') inputContent.pattern[i] = 1;
        printer(debug, context, "iterate pattern: ", inputContent.pattern)
    }
    




    // ===================== Tone functions =============================================== //

    // assign input "Sequence" (play etc.)
    if (inputContent.desc=="sequenceStart"){
        // play instrument function
        if (inputContent.cmd=="play" && inputContent.instArray.length>0) {
            // for every instrument send name, pattern and random statement 
            for (let i=0;i<inputContent.instArray.length;i++){
                let singleInst = inputContent.instArray[i];
                // overwrite single inst in inputContent
                inputContent.inst = singleInst;
                //do what you need here
                parserReturnData.toneReturn = transport(inputContent);    
            };
        // playAgainFunc() - if just "play" command without instruments
        } else if (inputContent.cmd=="play") {
            inputContent.cmd="playAll";
            parserReturnData.toneReturn = transport(inputContent);
        };

        // stopFunc() - for individual instruments
        if (inputContent.cmd=="stop" && inputContent.instArray.length>0) {
            for (let i=0;i<inputContent.instArray.length;i++){
                let singleInst= inputContent.instArray[i];
                inputContent.inst = singleInst;
                parserReturnData.toneReturn = transport(inputContent);
            };
        // stopAll() - for overall stop     
        } else if (inputContent.cmd=="stop"){
            inputContent.cmd="stopAll";
            parserReturnData.toneReturn = transport(inputContent)
        };
        if (inputContent.cmd[0]=="reset") {
            inputContent.cmd = 'reset';
            parserReturnData.toneReturn = transport(inputContent)
        };
    };    

    // CtrlAssFunc() - assign "Pattern" to instruments 
    if (inputContent.desc=="patternAssign"){
        for (let i=0;i<inputContent.instArray.length;i++){
            let singleInst = inputContent.instArray[i];
            inputContent.inst = singleInst;
            inputContent.cmd = "play";
            //do what you need here
            parserReturnData.toneReturn = transport(inputContent);
        };
    };
    
    // patternCopyFunc() - copy pattern to multiple instruments and play them
    if (inputContent.desc=="patternCopy"){
        inputContent.cmd = inputContent.desc;
        parserReturnData.toneReturn = transport(inputContent);
    };

    // setVolFunc
    if (inputContent.desc=="setVolume"){
        for (let i=0;i<inputContent.instArray.length;i++){
            let singleInst = inputContent.instArray[i];
            inputContent.inst = singleInst;
            inputContent.cmd = inputContent.desc;
            parserReturnData.toneReturn = transport(inputContent);
        };
    };

    // ctrlRandFunc
    if (inputContent.desc=="setRandom"){
        for (let i=0;i<inputContent.instArray.length;i++){
            let singleInst = inputContent.instArray[i];
            inputContent.inst = singleInst;
            inputContent.cmd = inputContent.desc;
            parserReturnData.toneReturn = transport(inputContent);
        };
    };

    // ctrlBpmFunc() - set BPM 
    if (inputContent.desc=="setBPM"){
        inputContent.cmd = inputContent.desc;
        parserReturnData.toneReturn = transport(inputContent);
    };

    // mute On
    if (inputContent.desc=="muteOn"){
        inputContent.cmd = inputContent.desc;
        printer(debug, context, "muteOn", "mute audio")
        parserReturnData.toneReturn = transport(inputContent);
    };
    // mute Off
    if (inputContent.desc=="muteOff"){
        inputContent.cmd = inputContent.desc;
        printer(debug, context, "muteOff", "unmute audio")
        parserReturnData.toneReturn = transport(inputContent);
    };
    // save part
    if (inputContent.desc=="savePart"){
        inputContent.cmd = inputContent.desc;
        parserReturnData.toneReturn = transport(inputContent);
        // playAlerts('bottom', alertState);
    };
    // set part
    if (inputContent.desc=="setPart"){
        inputContent.cmd = inputContent.desc;
        parserReturnData.toneReturn = transport(inputContent);
    };
    // delete element
    if (inputContent.desc=="deleteElement"){
        inputContent.cmd = inputContent.desc;
        parserReturnData.toneReturn = transport(inputContent);
    };
    // clear part
    if (inputContent.desc=="clear"){
        inputContent.cmd = "clearPart";
        parserReturnData.toneReturn = transport(inputContent);
    };

    
























    // ===================== HTML, server, socket functions ===================== //

    // record start
    if (inputContent.desc=="recordStart"){
        // parserReturnData.toneReturn = transport('recordStart');
        // if (device != 'ios') { audioRecord(true) };
    };
    // record stop
    if (inputContent.desc=="recordStop"){
        // parserReturnData.toneReturn = transport('recordStop');
        // if (device != 'ios') { audioRecord(false) };
    };
    // upload Files
    if (inputContent.desc=="uploadFiles"){
        // var file = inst;
        // uploadToServer(instName);
        // parserReturnData.toneReturn = transport('uploadFiles', file);
    };
    // restart server
    if (inputContent.type=="restart server"){
        printer(debug, context, "restart server", "restart server")
        // restartServer(); // in socket/
    };
    // join session    
    if (inputContent.type=="join"){
        // let session = desc[1];
        // let user = desc[0];
        printer(debug, context, "join", `join session "${session}" as user "${user}"`);
        // setUser(user, session); // in index-safe
    };
    // presets store
    if (inputContent.type=="helper"){
        // let action = inputContent.desc;
        // let preset = inst;
        // if (action=='store') {
        //     printer(debug, context, "preset store", `${action} preset "${preset}" on server"`);
        //     // presetHandling(preset, action); // in index-safe
        // };
        // if (action=='reload') {
        //     printer(debug, context, "preset reload", `${action} preset "${preset}" on server"`);
        //     // presetHandling(preset, action);// in index-safe
        // };
    };
    // presets reload to all
    if (inputContent.type=="helper_toAll"){
        // let action = inputContent.desc;
        // let preset = inst;
        // if (action=='reload') {
        //     printer(debug, context, "preset reload to all", `${action} preset "${preset}" on server"`);
        //     // presetHandling(preset, action);// in index-safe
        // };
    };
    // list stuff
    if (inputContent.desc=="list"){
        // let string = inst; // e.g. files
        // showFiles(string); // in index-safe
    };


    // ctrlHelpFunc  
    if (inputContent.desc=="helpText"){
        // helpText; // this is the destination
        // help; // this is the help container
        // if (help[helpText] != undefined) {
        //     if (helpText=='examples') { 
        //         // render with links
        //         let links = true;
        //         // renderHtmlHelp(help[helpText],'help-container', 100, links);
        //         // playAlerts('bottom', alertState);   
        //     } else {
        //         // render without links
        //         // renderHtmlHelp(help[helpText],'help-container', 100);
        //         // playAlerts('bottom', alertState);   
        //     };
            
        // } else {
        //     // playAlerts('error', alertState);
        // };
    };

    
    

    
    return parserReturnData
};









