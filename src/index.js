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
import { Instrument } from "/instrument";
import { WelleApp } from "/app";

// global variables
// ===================================
export const App = new WelleApp();
export const Socket = io.connect(); // socket var - server connect, also for exports

//
//
//
//
//
//
//
//

// audio variables
// ===================================
export let instruments = {};
export let parts = {};
// list contains synths in presets and sample folders on server as instruments
// coming by sockets
let listOfInstruments = [];
let listOfSamplers = [];
export let listOfAllAvailableInstruments = [];
// connect audio to Tone master
Instrument.masterGain.connect(Tone.getDestination()); // assign Instrument class masterOut to Tone master

//
//
//
//
//
//
//
//

// ============================================
// INPUT - manage text input & key interactions
// ============================================

// start Tone.js on keydown
document.getElementById("mainDiv").addEventListener("keydown", (e) => {
    App.startTone();
});

document.getElementById("mainInput").addEventListener("keydown", (e) => {
    // ENTER - in main input field
    if (e.code == "Enter") {
        // get input string
        const input = document.getElementById("mainInput").value.toLowerCase();
        Socket.emit("message", `enter: "${input}"`);
        // send input to App to handle
        App.handleMainInput(input);
    }

    // arrow functions
    if (e.code == "ArrowUp") {
        App.arrowUp();
    }
    if (e.code == "ArrowDown") {
        App.arrowDown();
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
//
//
//

// ============================================
// SOCKET HANDLING
// ============================================

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
    for (let i in alertFiles) App.addAlert(alertFiles[i]);
    App.printAlerts();
});
