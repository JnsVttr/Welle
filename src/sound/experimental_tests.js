



Object.keys(instruments).forEach((instName) => {
        instruments[instName].sequence.stop(0);     
        instruments[instName].isPlaying = false;
    });

// switch (synthType) {
    //   case "sampler1":
    //       synthType = 'Sampler';
    //       this.release = 0.4;
    //   break;
    //   case "metal":
    //       synthType = 'MetalSynth';
    //       this.baseNote = 30;
    //   break;
    //   case "leave":
    //       synthType = 'MonoSynth';
    //       this.baseNote = 30;
    //   break;
       //  case "bass":
    //       synthType = 'PluckSynth';
    //       this.baseNote = 30;
    //   break;
    //   case "noise":
    //       synthType = 'DuoSynth';
    //       // this.noise = 'white';
    //   break;
    //   case "drums":
    //      synthType = 'MembraneSynth';
    //      this.baseNote = 30;
    //   break;
    //   case "pad":
    //      synthType = 'AMSynth';
    //      this.baseNote = 230;
    //   break;
    //   case "string":
    //      synthType = 'FMSynth';
    //      this.baseNote = 130;
    //   break;
    //   default:
    //      synthType = 'Synth';
    // }

















console.clear();

// UPDATE: there is a problem in chrome with starting audio context
//  before a user gesture. This fixes it.
var started = false;
document.documentElement.addEventListener('mousedown', () => {
  if (started) return;
  started = true;
  const audio = document.querySelector('audio');
  const synth = new Tone.Synth();
  const actx  = Tone.context;
  const dest  = actx.createMediaStreamDestination();
  const recorder = new MediaRecorder(dest.stream);

  synth.connect(dest);
  synth.toMaster();

  const chunks = [];

  const notes = 'CDEFGAB'.split('').map(n => `${n}4`);
  let note = 0;
  Tone.Transport.scheduleRepeat(time => {
    if (note === 0) recorder.start();
    if (note > notes.length) {
      synth.triggerRelease(time)
      recorder.stop();
      Tone.Transport.stop();
    } else synth.triggerAttack(notes[note], time);
    note++;
  }, '4n');

  recorder.ondataavailable = evt => chunks.push(evt.data);
  recorder.onstop = evt => {
    let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
    audio.src = URL.createObjectURL(blob);
  };

  Tone.Transport.start();
});













MediaRecorder recorder = new MediaRecorder();
recorder.setAudioSource(MediaRecorder.AudioSource.MIC);
recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
recorder.setOutputFile(Environment.getExternalStorageDirectory()
        .getAbsolutePath() + "/myrecording.mp3");
recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
recorder.prepare();
recorder.start();



































/*

// ========================  audio.js ====================== //
let myAudioContext;

let instruments = {};   // object - store 
let parts = {};   // object - store 
let savedParts = {}; // object to hold info about instruments for saved parts
let score;          // hold the overall score
let currentPart;  // hold current running part

let currentBPM=90;
let bars=8, measure=1/16, takes = 0;  // initial define part 

var click;
var looper1;



// prelode audio data
const preload = () => {
    //mySound = loadSound('assets/beatbox.mp3');
    click = loadSound('audio/click.wav');
    console.log('p5 preload done.')
};
// called at very beginning from index.html
const audioStart = () => {
  // if (getAudioContext().state !== 'running') {
  //   getAudioContext().resume();
  // };
};





// ==================================================== //
// setup up basic functionality & instruments
const setup = () => {
    //let myAudioContext = getAudioContext();

    //currentPart = makeNewPart("default");
    // score = new p5.Score();
    //score.parts = [currentPart.part];
    // score.loop();
    looper1 = new p5.SoundLoop(function(timeFromNow){
        click.play(timeFromNow);
    }); 
    
    //stop after 10 iteratios;
    looper1.maxIterations = 10;
    //start the loop
    looper1.start();
    console.log('p5 sound setup done..');
};






function makeNewPart(name) {
    var part = new p5.Part(bars, measure);
    parts[name] = { name: name, part: part};   // object - store 
    part.looping = true;
    part.setBPM(currentBPM);
    return parts[name];
};

















// ============= Function calls from parseInput.js ========================= //


// called on play events
function playFunc (inst, pattern, rand) {
    // var for raw pattern at restarting instrument
    var patternRaw = pattern; 
    // assign [1] hit, if pattern comes in empty
    pattern = patternCheck(pattern); 
    // assign part (default, if no other parts)
    var part;
    //if (Object.size(parts)<2){part = parts.default; } else {part = currentPart;}
    part = currentPart

    // if the instrument doesn't exists in instruments{}: 
    if (instruments[inst]==null){
        createNewInst(inst, pattern, part, rand);
    } else {
        // if instruments exists and is playing, just replace pattern
        if (instruments[inst].isPlaying==true) {
            replacePattern(inst, pattern, rand);
        };
        // if instrument exists but is not playing:
        if (instruments[inst].isPlaying==false) {
            // previously stored pattern
            var prevPattern = instruments[inst].pattern;
            // if no pattern assigned, take previously saved pattern
            if (patternRaw=="") {
                addPhrase(inst, prevPattern, part, rand);
                instruments[inst].isPlaying==true;
            } else {
                addPhrase(inst, pattern, part, rand);
                instruments[inst].isPlaying==true;
            };
        };
    };
    score.loop();
};


// add all instruments to the current part, reset() counter and loop()
const playAllFunc = () => {
    reset();
    Object.keys(instruments).forEach(key => {
      var instName = instruments[key].name;
      var pattern = instruments[key].pattern;
      instruments[key]. isPlaying = true;
      addPhrase(instName, pattern, currentPart);
    });
    score.loop();
};


function stopFunc (inst) {
    if (instruments[inst]!=null) {
        instruments[inst].part.removePhrase(instruments[inst].name);
        instruments[inst].isPlaying = false;
        // if stopping the last instrument:
        var counter = 0;
        Object.keys(instruments).forEach(key => {
          if (instruments[key].isPlaying) {counter +=1}
        });
        if (counter == 0){
            currentPart.part.stop();
            reset();
        };
    };
};

function stopAllFunc () {
    Object.keys(instruments).forEach(key => {
      //instruments[key].isPlaying = false;
    });
    currentPart.part.stop();
    reset();
};







// called on control COPY events
function patternCopyFunc (inst, instArray) {
    var pattern = instruments[inst].pattern;
    var newPattern = detachArray(pattern);
    
    if (instruments[inst]!=null){

        for (i=0;i<instArray.length;i++) {
            var newInst = instArray[i];
            // if destination instrument exists:
            if (instruments[newInst]!=null){
                replacePattern(newInst, newPattern);
            // if destination instrument doesn't exists, create a new one:
            } else {
                createNewInst(
                    newInst, 
                    newPattern,
                    currentPart,
                    0 // rand is 0, change in rand assign > instruments[inst].rand
                );
            };
        };
    };    
};





// called on control events 
function patternAssignFunc (inst, pattern, rand) {
    if (instruments[inst]!=null){
        replacePattern(inst, pattern, rand); // not for rand, cause rand is at inst creation?
    // if instrument doesn't exist:
    } else {
        console.log("no such instrument active..");
    };
};






function ctrlBpmFunc (bpm) {
    console.log("set BPM", bpm);
    currentBPM = bpm;
    currentPart.part.setBPM(currentBPM);
};


function setVolFunc (inst, vol) {
    console.log("set Volume ", vol, " for ", inst);
    // p5.js -> map(value, start1, stop1, start2, stop2, [withinBounds])
    instruments[inst].vol = vol;
    var volume = instruments[inst].vol;
    volume = map(volume, 0, 1.0, 0, 0.7);
    inst = instruments[inst].env.setRange(volume, 0);
};


function setRandFunc (inst, rand) {
    if (instruments[inst]!=null){
        replacePattern(inst, instruments[inst].pattern, rand);
    };
};





 

function savePartFunc(name) {
    console.log("save part under this name: ", name);
    savedParts[name] = {name: name};
    savedParts[name].instruments = {};

    console.log("followinginst ar playing: "),
    Object.keys(instruments).forEach(key => {
        if (instruments[key].isPlaying){
            console.log(instruments[key].name);
            var instName = instruments[key].name;
            var pattern = instruments[key].pattern;
            var rand = instruments[key].rand;
            var vol = instruments[key].vol;
            console.log(name, pattern, rand);
            savedParts[name].instruments[instName] = {
                name: instName,
                pattern: pattern,
                rand: rand,
                vol: vol,
            };
        };
    });
};

function setPartFunc(name) {
    // check if part exists before settings
    var check = false;
    Object.keys(savedParts).forEach(key => {
        if (key == name) {
            console.log("set part: ", name);
            currentPart.part.phrases = [];
            instruments = {};

            Object.keys(savedParts[name].instruments).forEach(key => {
                console.log("play following instruments: ", key);
                var instName = savedParts[name].instruments[key].name;
                var pattern = savedParts[name].instruments[key].pattern;
                var rand = savedParts[name].instruments[key].rand;
                var vol = savedParts[name].instruments[key].vol;
                console.log("Inst: ", instName, " pat: ", pattern, " rand: ", rand);
                playFunc(instName, pattern, rand);
                setVolFunc(instName, vol);
            });
            currentPart.part.loop();
            reset();
            check = true;
        };
    });
    if (!check) {console.log("no such part..")}
};

function clearPartsFunc() {
    savedParts = {};
};


























// ========= Constructors & Helpers ====================================== //


function createNewInst (inst, pattern, part, rand) {
    // initial assign to object instruments{}:
    instruments[inst] = { 
        name: inst, 
        rand: rand,
        pattern: pattern,
    };
    // new Synth
    var instSynth = new Synth(inst);
    var instEnv = new Env(inst);

    // new instrument function
    var instFunc = createInstFunc(inst);

    // new Phrase
    var instPhrase = new Phrase(inst, pattern, instFunc);

    // store all new items (before calling part)
    instruments[inst] = {
        name: inst, 
        isPlaying: true,
        freq: instSynth.f,
        synth: instSynth, 
        env: instEnv, 
        vol: 1,
        pattern: pattern,
        func: instFunc, 
        phrase: instPhrase,
        partName: part.name,
        part: part.part,
        rand: rand,
    };
    // add to default part:
    part.part.addPhrase(instruments[inst].phrase);
    console.log("created new Instrument: ", inst);
};



// init new instrument
function Synth(inst) {
    switch(inst) {
        case "bass":
            inst = new p5.Oscillator();
            inst.setType('sawtooth');
            inst.freq(80);
            inst.amp(0);
            inst.start(); 
        break;
        case "drums":
            inst = new p5.Noise();
            inst.amp(0);
            inst.start();
        break;
        case "pad":
            inst = new p5.Oscillator();
            inst.setType('sine');
            inst.freq(1080);
            inst.amp(0);
            inst.start();  
        break;
        case "string":
            inst = new p5.Oscillator();
            inst.setType('triangle');
            inst.freq(220);
            inst.amp(0);
            inst.start();  
        break;
    };
    return inst;
};

// init new envelope
function Env (inst) {
    switch(inst) {
        case "bass":
            var env = new p5.Envelope();
            env.setADSR(0.01, 0.1, 0.1, 0.01);
            env.setRange(0.7, 0);
        break;
        case "drums":
            var env = new p5.Envelope();
            env.setADSR(0.01, 0.05, 0.02, 0.01);
            env.setRange(0.7, 0);
        break;
        case "pad":
            var env = new p5.Envelope();
            env.setADSR(0.1, 0.1, 0.4, 0.01);
            env.setRange(0.7, 0);
        break;
        case "string":
            var env = new p5.Envelope();
            env.setADSR(0.1, 0.1, 0.4, 0.3);
            env.setRange(0.7, 0);
        break;
    };
    return env;
};



// construct new instrument function
function createInstFunc (inst) {  
    var func = new Function(
        'time', 'params', '\
        var rand =      instruments["'+inst+'"].rand;\
        var freq =      instruments["'+inst+'"].freq;\
        var name =      instruments["'+inst+'"].name;\
        var instSynth = instruments["'+inst+'"].synth;\
        var pattern =   instruments["'+inst+'"].pattern;\
        var env =       instruments["'+inst+'"].env;\
        \
        var counter =   currentPart.part.metro.metroTicks;\
        var repeater =  bars * rand;\
        var hits =      counter % repeater;\
        \
        params = freq * (params*0.6);\
        if (name != "drums") { instSynth.freq(params, 0, time) };\
        env.play(instSynth, time);\
        \
        if (hits==0  && rand >0){\
            var randPattern = shuffleArray(pattern);\
            replacePattern(name, randPattern, rand) \
        };'
    );
    return func;
};


// init new phrase
function Phrase(inst, pattern, instFunc){
    var instPhrase = new p5.Phrase(inst, instFunc, pattern);
    return instPhrase;
};


// init new Part
function initPart(inst, instPhrase) {
    var instPart = new p5.Part();
    instPart.setBPM(60);
    instPart.addPhrase(instPhrase);
    console.log("Part constructor: init part: " + inst);
    return instPart;
    //this.changeName = function (name) {
    //  this.lastName = name;
    //};
} ;





function replacePattern (inst, pattern, rand) {
    instruments[inst].pattern = pattern;
    instruments[inst].rand = rand;
    instruments[inst].part.replaceSequence(instruments[inst].name, pattern);
};






function addPhrase (inst, pattern, part, rand) {
    var newPhrase = new Phrase(inst, pattern, instruments[inst].func);
    // store new items (before calling part)
    instruments[inst].rand = rand;
    instruments[inst].pattern = pattern;
    instruments[inst].phrase = newPhrase;
    instruments[inst].isPlaying = true;
    // add to default part:
    part["part"].addPhrase(instruments[inst].phrase);
    console.log("addPhrase to: ", inst, " with this pattern: ", pattern);
};






























 
// ======================== HELPER FUNCTIONS ========================= //


function reset () {
    currentPart.part.metro.metroTicks = 0;
};

// if the pattern is empty, then assign a pattern with one hit
function patternCheck(pattern){
    if (pattern.length==0){pattern=[1]};
    return pattern;
};


// random helper, randomize patterns
function shuffleArray(array) {
    var input = array;
    for (var i = input.length-1; i >=0; i--) {
     
        var randomIndex = Math.floor(Math.random()*(i+1)); 
        var itemAtIndex = input[randomIndex]; 
         
        input[randomIndex] = input[i]; 
        input[i] = itemAtIndex;
    }
    array = input;
    //console.log("New shuffleArray: ", array);
    return array;
};



// Get the size of an object
// var size = Object.size(myObj);
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


// cannot assign stored pattern directly, needs to be detached from origin..
function detachArray (pattern) {
    var newPattern = [];
    for (i=0;i<pattern.length;i++) {
        newPattern.push(pattern[i]);
    };
    return newPattern;
}; 


*/



/*

import p5 from 'p5';
import 'p5/lib/addons/p5.sound.min';
import 'p5/lib/addons/p5.dom.min';

// FINALLY WORKING!!!!!!



const print = (o) => {
    console.log(`func from outside, passing to inside`);
    return "(1) --> most amazing val from outside";
};

let myp5 = new p5(( sketch ) => {

  let x = 100;
  let y = 100;
  let click, looper1;
  let clickUrl = require('/audio/click.mp3');
  console.log(clickUrl);
  let val = print();
  console.log(`outside val: ${val}`);

  sketch.preload = () => {
    click = sketch.loadSound(clickUrl);
  };

  sketch.setup = () => {
    sketch.createCanvas(200, 200);
    looper1 = new p5.SoundLoop(function(timeFromNow){
        click.play(timeFromNow);
        sketch.background(255 * (looper1.iterations % 2));
    }, "8n");


    //stop after 10 iteratios;
    looper1.maxIterations = 10;
    //start the loop
    looper1.start();
  };

  sketch.draw = () => {
    //sketch.background(0);
    sketch.fill(255);
    sketch.rect(x,y,50,50);
  };
}, 'help');



*/