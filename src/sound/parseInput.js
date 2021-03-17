import { transport }  from '/sound/toneTest' 
import { renderHtml, renderHtmlArrows, renderHtmlHelp }  from  '/html/renderHTML';
import { help }  from '/help/helpText';
import { setUser, showFiles, playAlerts, alertState, restartServer, presetHandling }  from '/index' 





const parseInput = (input) => {
    let debugParser=true;
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

    if (debugParser) {
        console.log("Parser: parser Income: ",'\n',  
            " type: ", type, '\n', 
            " desc: ", desc, '\n', 
            " cmd: ", cmd, '\n', 
            " inst: ", inst, '\n', 
            " instArray: ", instArray, '\n', 
            " pattern: ", patternParse, '\n', 
            " rand: ", rand, '\n', 
            " sel: ", sel, '\n', 
            " vol: ", vol, '\n', 
            " bpm: ", bpm, '\n', 
            " name: ", name, '\n', 
            " help: ", helpText, '\n', 
            " num: ", num, '\n', 
        );
    };




    // tests:
    // if (debugParser) {console.log(`Parse: patternParse Test.. if pattern "${patternParse}" is empty + array, then patternParse[0]=0. otherwise Original Value: ${patternParse}.`)};
    if (patternParse=='' && Array.isArray(patternParse)) {patternParse[0] = null};
    // if (debugParser) {console.log(`Parse: patternParse Test --> patternParse: "${patternParse}"`)};

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
        if (debugParser) {console.log('Parser: send: list ' + string);}
        showFiles(string);
    };
    // mute On
    if (desc=="muteOn"){
        console.log('mute the Audio Output');
        transport('muteOn');
    };
    // mute Off
    if (desc=="muteOff"){
        console.log('unmute the Audio Output');
        transport('muteOff');
    };
    // record start
    if (desc=="recordStart"){
        transport('recordStart');
        // showFiles('.. recording started. Type "record stop" to stop recording!');
    };
    // record stop
    if (desc=="recordStop"){
        transport('recordStop');
        // showFiles('.. recording stopped. See audio at the top of the page!');
    };
    // upload Files
    if (desc=="uploadFiles"){
        var file = inst;
        transport('uploadFiles', file);
        console.log('parser: upload to server: ' + file);
    };
    // restart server
    if (type=="restart server"){
        console.log('parser: restart server..');
        restartServer();
    };
    // join session    
    if (type=="join"){
        let session = desc[1];
        let user = desc[0];
        console.log(`Parser: join session "${session}" as user "${user}"`);
        setUser(user, session);
    };
    // presets store
    if (type=="helper"){
        let action = desc;
        let preset = inst;
        if (action=='store') {
            console.log(`Parser: ${action} preset "${preset}" on server.."`);
            presetHandling(preset, action);
        };
        if (action=='reload') {
            console.log(`Parser: ${action} preset "${preset}" on server.."`);
            presetHandling(preset, action);
        };
    };
    // presets reload to all
    if (type=="helper_toAll"){
        let action = desc;
        let preset = inst;
        if (action=='reload') {
            console.log(`Parser: ${action} preset "${preset}" on server.."`);
            presetHandling(preset, action);
        };
    };








    // ctrlHelpFunc  
    if (desc=="helpText"){
        helpText; // this is the destination
        help; // this is the help container
        // console.log('check help container for this element: ' + helpText);
        if (help[helpText] != undefined) {
            // console.log('render help.' + helpText);
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

