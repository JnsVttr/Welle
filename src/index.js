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
import "regenerator-runtime/runtime"; // for async functions with parcel bundler
import { WelleApp } from "/js/app";

// global variables
// ===================================
export const App = new WelleApp();
export const Socket = io.connect(); // socket var - server connect, also for exports
const debug = true;
//

// IMPORTANT: teleport functions to document scope by creating
// window object and storing functions/classes there
window.welle = { name: "welle", app: App, instruments: {} };
// console.log(`
// Window: this is the document window's name: ${window.welle.name}.
// And this is the App: ${JSON.stringify(window.welle.app)}`);

// ============================================
// INPUT - manage text input & key interactions
// ============================================

// focus on main input field: - maybe not to explore the whole site before..
// for development
document.getElementById("mainInput").focus();

// start Tone.js on keydown
document.getElementById("mainDiv").addEventListener("keydown", (e) => {
    App.startTone();
});

document.getElementById("mainInput").addEventListener("keydown", (e) => {
    // ENTER - in main input field
    if (e.code == "Enter") {
        App.tutorial = false;
        // get input string
        const input = document.getElementById("mainInput").value.toLowerCase();
        Socket.emit("consoleInput", { id: App.id, input: input });
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
    App.id = Socket.id;
    console.log(`Socket Connected! Id: ${App.id}, user: ${App.user}`);
    if (App.getAlertsNum() == 0) Socket.emit("requestAlerts");
    if (App.getSamplesNum() == 0) Socket.emit("requestSampleFiles");
    // if (App.getInstrumentsNum() == 0) Socket.emit("requestTonePresets");
});

// SOCKET on receiving audioFile Paths
Socket.on("audioFiles", (message) => {
    console.log(`Socket: get (${message.count}) samples. `);
    // console.log(`#samples num ... (${App.getSamplesNum()})`);
    if (App.getSamplesNum() == 0) {
        App.addSamples(message.samples);
    }
    // create all Instruments + Grid, when loading finished
    if (App.getSamplesNum() == message.count) {
        console.log(`start instrument creation with ${App.getSamplesNum()} samples`);
        App.instruments = App.makeSynths({ count: App.getSamplesNum(), samples: App.samples });
        console.log(`new instruments: `);
        console.log(App.instruments);
        App.grid = App.makeGrid(App.instruments);
        console.log(App.grid);
        App.configLoop();
        // App.instruments[1].sequence[0] = "C3";
        // App.instruments[0].sequence[6] = "C3";
        // console.log(`App.instruments .. ${App.instruments[1].sequence}`);
        // App.startTransport();
    }
});

// SOCKET receive alerts - createAlerts(alerts);
Socket.on("alerts", (message) => {
    console.log(`Socket: get (${message.count}) alerts. `);
    if (App.getAlertsNum() == 0) {
        App.addAlerts(message.samples);
    }
});

// SOCKET receive tonePresets
// Socket.on("tonePresets", (presets) => {
//     if (App.getInstrumentsNum() == 0) {
//         App.addInstruments(presets);
//         App.printAllInstruments();
//         App.renderInstrumentsOverview();
//     }
// });

// SOCKET presets
// Socket.on("presets", (presets) => {
//     console.log(`incoming presets: `, presets);
//     App.storePresets(presets);
// });

// SOCKET new User
// Socket.on("allUsers", (message) => {
//     console.log(`incoming all users: ${message.users}`);
//     App.updateUsers(message.users);
// });

// SOCKET session data
// Socket.on("sessionData", (message) => {
//     console.log(`incoming session data: ${JSON.stringify(message)}`);
//     App.handleRemoteInput(message);
// });
