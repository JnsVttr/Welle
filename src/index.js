// WELLE - main index file //
// =============================================================

/*
JS shorthand tipps: https://www.sitepoint.com/shorthand-javascript-techniques/
JSON online parser: https://jsonformatter.curiousconcept.com/

tutorial: https://medium.com/@sitapati/avoiding-mutable-global-state-in-browser-js-89437eaebaac
global var naming: GlobalVar
*/

// libraries
// ===================================
import io from "socket.io-client";
import SocketIOFileClient from "socket.io-file-client";
import * as Tone from "tone";
import "regenerator-runtime/runtime"; // for async functions with parcel bundler

// files
// ===================================
import { renderHtmlArrows, renderBPM } from "/html/renderHTML";
import { parser } from "/parser";
import { help } from "/text/helpText";
import { printer } from "/helper/printer";

import { enterFunction } from "/helper/enterFunction";
import { handleReturns } from "./helper/handleReturns";
import { Instrument } from "/instrument";
import { WelleApp } from "/app";

// Tone & Music App
// ===================================
export const App = new WelleApp();

// global variables
// ===================================
export const Socket = io.connect(); // socket var - server connect, also for exports

export let soundMuteState = true;
export let alertMuteState = false; // alerts muted or not?

// audio variables
// ===================================
export let bpm = 120;
export let instruments = {};
export let parts = {};
// list contains synths in presets and sample folders on server as instruments
// coming by sockets
let listOfInstruments = [];
let listOfSamplers = [];
export let listOfAllAvailableInstruments = [];
// Tone Audio Buffer
const bufferDefault = new Tone.ToneAudioBuffer("/audio/kick/animal.mp3", () => {});

// input & console varibles
// ===================================
export let consolePointer = 0; // for arrow functions
export let consoleArray = []; // arrays to store page console etc. output
export let consoleLength = 20; // how many lines are displayed
window.onload = function () {
    document.getElementById("mainInput").focus();
};
let returns = {};

// html variables
// ===================================
let checkMuteSound = document.getElementById("checkMuteSound");
let checkMuteAlerts = document.getElementById("checkMuteAlerts");
let consoleDivID = "console";

// actions
// ===================================
let toneStarted = false;
// initially show BPM
renderBPM(bpm);
// set static variables to class Instrument
Instrument.bpm = bpm;
Instrument.bufferDefault = bufferDefault;
// connect audio to Tone master
Instrument.masterGain.connect(Tone.getDestination()); // assign Instrument class masterOut to Tone master
Tone.Transport.bpm.value = bpm;
// extremly relevant to stability of Tone playback
Tone.context.lookAhead = 0.2;
//
//
//
//
//
// INPUT - manage text input & key interactions
// ============================================

document.getElementById("mainDiv").addEventListener("keydown", async (e) => {
    // START TONE on keydown
    if (toneStarted == false) {
        await Tone.start();
        toneStarted = true;
        console.log("started Tone");
    }
});

document.getElementById("mainInput").addEventListener("keydown", (e) => {
    // ENTER - in main input field
    // ===========================
    if (e.code == "Enter") {
        // if (Tone.Transport.state != "started") Tone.Transport.start();
        // set variable for returns from grammar, parser, tone
        returns = {
            input: "",
            semantic: {},
            parser: "",
            console: {
                array: consoleArray,
                div: consoleDivID,
                length: consoleLength,
            },
        };

        // print empty spaces for debugging
        if (App.debug) console.log("");
        console.log("");
        // POINTER - reset pointer for arrwos
        consolePointer = -1;

        // INPUT - get input string
        returns.input = document.getElementById("mainInput").value.toLowerCase();
        Socket.emit("message", `enter: "${returns.input}"`);

        // GRAMMAR - send string to validate in enterfunction() using semantics.js &  grammar.js
        returns.semantic = enterFunction(returns.input, listOfAllAvailableInstruments);

        // PARSER
        if (returns.semantic.valid) {
            // check if string is part, replace everything and send playAll to parser ??? here ??
            // send results to parser for Tone
            returns.parser = parser(returns.semantic.result);
            // add to consolePointer for arrows
            consolePointer += 1;
        } else consolePointer += 1;

        // PROCESS - handle all returns
        consoleArray = handleReturns(returns, instruments, parts);
        // FOCUS - focus back on textfield
        document.getElementById("mainInput").focus();
    }

    // KEY INTERACTIONS - arrow functions
    // ======================================
    if (e.code == "ArrowUp") {
        // printer(debug, context, "text input", "arrow up pressed");
        consolePointer = renderHtmlArrows(consolePointer, consoleArray, "up");
        App.playAlert("return");
    }
    if (e.code == "ArrowDown") {
        // printer(debug, context, "text input", "arrow down pressed");
        consolePointer = renderHtmlArrows(consolePointer, consoleArray, "down");
        App.playAlert("return");
    }
    // if (e.code=='Digit1') {
    // 	requestServerFiles ("samples");
    // 	printer(debug, context, "request Server Files", `Index: socket send "requestServerFiles", 'samples'.. `)
    // }
});

//
//
//
//
//
// SOCKET HANDLING
// ======================
// SOCKET on initial connection
Socket.on("connect", function (data) {
    console.log("Socket Connected!");
    Socket.emit("message", { message: "Hello from client!" });
    Socket.emit("requestAlerts");
    Socket.emit("requestSampleFiles");
    Socket.emit("requestTonePresets");
});
// SOCKET on receiving audioFile Paths
Socket.on("audioFiles", (files) => {
    // console.log("incoming server files: ", files);
    Instrument.files = files;
    for (let file in files) {
        console.log(": ", file);
        listOfSamplers.push(file);
        listOfAllAvailableInstruments.push(file);
    }
    console.log("listOfSamplers", listOfSamplers);
    // console.log("listOfAllAvailableInstruments", listOfAllAvailableInstruments);
    Instrument.listSamplers = listOfSamplers;
});
// SOCKET receive tonePresets
Socket.on("tonePresets", (presets) => {
    Instrument.presets = presets;
    // console.log('incoming presets: ', presets);
    for (let preset in presets) {
        listOfInstruments.push(preset);
        listOfAllAvailableInstruments.push(preset);
    }
    console.log("listOfInstruments", listOfInstruments);
    console.log("listOfAllAvailableInstruments", listOfAllAvailableInstruments);
    Instrument.list = listOfInstruments;
});

// SOCKET receive alerts - createAlerts(alerts);
Socket.on("alerts", (alertFiles) => {
    if (App.debug) for (let i in alertFiles) console.log("incoming alerts: ", alertFiles[i]);
    for (let i in alertFiles) App.addAlert(alertFiles[i]);
    App.printAlerts();
    // setTimeout(() => {
    //     App.playAlert("error");
    // }, 1000);
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// initial request for samples on server
// const requestServerFiles = (string) => {
// 	printer(debug, context, "requestServerFiles", "request sample paths from server...")
// 	socket.emit('requestServerFiles', string);
// }
// requestServerFiles ("samples");
// socket.emit('requestServerFiles', 'samples');
// // receive files via socket, assign them to global variables
// socket.on("filesOnServer", function(folder, samples, what) {
// 	serverFolders = folder;
// 	serverSamples = samples;
// 	printer(debug, context, "filesOnServer - received", `
// 		folders: ${serverFolders}
// 		file paths: ${serverSamples}`);
// 	sampleURL = extractSamplePaths (serverSamples);

// 	// instrumentsList = update_InstrumentsList(); // create list
// 	// Instrument.createList(sampleURL);
// });

// ==================================================================
// EOF - index.js

// class Sound {
// 	static soundStyle = "techno";
// 	constructor(name, bpm) {
// 		this.name = name;
// 		this.bpm = bpm;
// 		this.isPlaying = false;
// 		this.style = 'default';
// 		console.log(`
// 		name: ${this.name},
// 		BPM:${this.bpm},
// 		style: ${this.style}
// 		Sound.style: ${Sound.soundStyle}`)

// 	}
// 	// static get soundStyle() {
// 	// 	// console.log(`log this: ${Sound.style}`);
// 	// 	return Sound.soundStyle;
// 	// }
// 	// static set soundStyle(style) {
// 	// 	this.style = style;
// 	// 	Sound.soundStyle = style;
// 	// }

// }

/*
overview keycodes

The available properties for KeyboardEvents are described on the linked page on MDN. They include:
https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

KeyboardEvent.altKey
KeyboardEvent.charCode (Deprecated)
KeyboardEvent.code
KeyboardEvent.ctrlKey
KeyboardEvent.isComposing
KeyboardEvent.key
KeyboardEvent.keyCode (Deprecated)
KeyboardEvent.location
KeyboardEvent.metaKey
KeyboardEvent.shiftKey
KeyboardEvent.which (Deprecated)

also a tester here:
https://css-tricks.com/snippets/javascript/javascript-keycodes/

*/
