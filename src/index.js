// WELLE - main index file //
// =============================================================

/*
JS shorthand tipps: https://www.sitepoint.com/shorthand-javascript-techniques/
JSON online parser: https://jsonformatter.curiousconcept.com/

tutorial: https://medium.com/@sitapati/avoiding-mutable-global-state-in-browser-js-89437eaebaac
global var naming: GlobalVar
*/

// libraries + class
// ===================================
import io from "socket.io-client";
import SocketIOFileClient from "socket.io-file-client";
import "regenerator-runtime/runtime"; // for async functions with parcel bundler
import { WelleApp } from "/app";

// global variables
// ===================================
export const App = new WelleApp();
export const Socket = io.connect(); // socket var - server connect, also for exports

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
    App.addSamples(files);
    // App.printAllInstruments();
});

// SOCKET receive tonePresets
Socket.on("tonePresets", (presets) => {
    for (let preset in presets) App.addInstrument({ name: preset, preset: presets[preset] });
    App.printAllInstruments();
});

// SOCKET receive alerts - createAlerts(alerts);
Socket.on("alerts", (files) => {
    App.addAlerts(files);
    App.printAlerts();
});
