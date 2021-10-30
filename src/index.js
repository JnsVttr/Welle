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
import { Tone } from "tone/build/esm/core/Tone";

// global variables
// ===================================
export const App = new WelleApp();
export const Socket = io.connect(); // socket var - server connect, also for exports
const debug = true;
let presetRequest = false;
let socketID = "";
//

// IMPORTANT: teleport functions to document scope by creating
// window object and storing functions/classes there
window.welle = { name: "welle", app: App, instruments: {} };
// console.log(`
// Window: this is the document window's name: ${window.welle.name}.
// And this is the App: ${JSON.stringify(window.welle.app)}`);

function checkDevice() {
    let device = "else";
    var isMac = /(Mac)/i.test(navigator.platform);
    var isWindows = /(Windows)/i.test(navigator.platform);
    var isIOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);
    var isAndroid = /(Android)/i.test(navigator.platform);
    var isWindowsPhone = /(Windows Phone)/i.test(navigator.platform);

    if (isMac) device = "mac";
    if (isWindows) device = "windows";
    if (isIOS) device = "ios";
    if (isAndroid) device = "android";
    if (isWindowsPhone) device = "windowsPhone";
    return device;
}
console.log("checkdevice: ", checkDevice());
if (checkDevice() == "ios" || checkDevice() == "android" || checkDevice() == "windowsPhone") {
    document.getElementById("rec-button").style.display = "none";
    document.getElementById("file").style.display = "none";
    document.getElementById("filesDiv").style.display = "none";
}

// ============================================
// INPUT - manage text input & key interactions
// ============================================

// display eventlistener
document.getElementById("language-button").addEventListener("click", (e) => {
    const val = document.getElementById("language-button").value;
    console.log("change texts and language", val);

    if (val == "deutsch") {
        App.setLanguage("deutsch");
    }
    if (val == "english") {
        App.setLanguage("english");
    }
});

// focus on main input field: - maybe not to explore the whole site before..
// for development
// document.getElementById("mainInput").focus();

// start Tone.js on keydown
document.getElementById("mainDiv").addEventListener("click", (e) => {
    App.startTone();
});

// Eventlistener for Start/ Stop Button
document.getElementById("transport-button").addEventListener("click", () => {
    const val = document.getElementById("transport-button").value;
    if (val == "PLAY") {
        App.startTransport();
    }
    if (val == "STOP") {
        App.stopTransport();
    }
});

// Eventlistener for Input field
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
    socketID = Socket.id;
    console.log(`Socket Connected! Id: ${App.id}, user: ${App.user}`);
    if (App.getAlertsNum() == 0) Socket.emit("requestAlerts");
    if (App.getSamplesNum() == 0) Socket.emit("requestSampleFiles");
    // if (App.getInstrumentsNum() == 0) Socket.emit("requestTonePresets");
    Socket.emit("requestSamplePacks");
});

// SOCKET on receiving audioFile Paths
Socket.on("sampleFiles", (message) => {
    let samples = message.files.samples;
    let samplesPath = undefined;
    if (message.path) samplesPath = message.path;
    console.log(`Incoming samples: path: ${samplesPath} get (${samples}) samples. `);
    // console.log(`#samples num ... (${App.getSamplesNum()})`);

    // check Transport state:
    console.log(`configLoop started? ${App.configLoopStarted}`);

    // if (Tone.Transport != undefined) Tone.Transport.get();
    if (App.getSamplesNum() == 0) {
        if (samplesPath) App.addSamples({ files: samples, path: samplesPath });
        else App.addSamples({ files: samples });
    }
    // create all Instruments + Grid, when loading finished
    if (App.getSamplesNum() == message.files.count) {
        // console.log(`start instrument creation with ${App.getSamplesNum()} samples`);
        App.instruments = App.makeSynths({ count: App.getSamplesNum(), samples: App.samples });
        // console.log(`new instruments: `);
        // console.log(App.instruments);
        App.grid = App.makeGrid(App.instruments);
        // console.log(App.grid);
        if (!App.configLoopStarted) App.configLoop();
        // App.instruments[1].sequence[0] = "C3";
        // App.instruments[0].sequence[6] = "C3";
        // console.log(`App.instruments .. ${App.instruments[1].sequence}`);
        // App.startTransport();
        App.renderContent();
        console.log(`App files loaded`);
        document.getElementById("loaderDiv").style.display = "none";

        // delay for sample buffers
        setTimeout(() => {
            console.log(`is there preset data? : ${App.presetData}`);
            if (App.presetData != undefined) {
                App.initPresetData(App.presetData);
            }
        }, 500);
    }
});

Socket.on("samplePacks", (message) => {
    let packs = undefined;
    let numPacks = undefined;
    if (message != undefined) {
        if (message.samplePacks != undefined) {
            packs = message.samplePacks;
            numPacks = packs.length;
        }
    }
    console.log(`incoming smaplePacks (${numPacks}): ${packs}`);
    App.addSamplePacks({ packs: packs });
});

// SOCKET receive alerts - createAlerts(alerts);
Socket.on("alerts", (message) => {
    // console.log(`Socket: get (${message.count}) alerts. `);
    if (App.getAlertsNum() == 0) {
        App.addAlerts(message.samples);
    }
});

// SOCKET new User
Socket.on("allUsers", (message) => {
    console.log(`incoming all users: ${message.users}`);
    App.updateUsers(message.users);
});

// SOCKET session data
Socket.on("sessionData", (message) => {
    console.log(`incoming session data: ${JSON.stringify(message)}`);
    App.handleRemoteInput(message);
});

// SOCKET preset URL
Socket.on("presetURL", (message) => {
    console.log(`message.url: ${message.url}, file: ${message.file}`);
    const anchor = document.createElement("a", { href: message.url });
    anchor.download = "composition.json";
    anchor.href = message.url;
    anchor.setAttribute("visibility", "hidden");
    anchor.setAttribute("display", "none");
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
});

Socket.on("presetData", (message) => {
    if (presetRequest) {
        console.log("preset arrived in client:", message);
        presetRequest = false;
        setTimeout(() => {
            App.loadPreset(message);
        }, 200);
    }
});

const submitComposition = (e) => {
    e.preventDefault();
    let message = "";
    let formData = new FormData(document.getElementById("compositionForm"));
    let options = { body: formData, method: "POST" };
    fetch("/upload-preset", options)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // have the JSON response from the POST operation here
            console.log(data);
            message = data.message;
            document.getElementById("jsonFeedbackText").style.display = "block";
            document.getElementById(
                "jsonFeedbackText"
            ).innerHTML = `<p><span class="serverFeedback">${message}</span></p>`;
            if (data.success) {
                console.log("load composition from server : )");
                presetRequest = true;
                Socket.emit("requestPreset");
                // mute app temporarily
                setTimeout(() => {
                    App.playAlert("enter");
                }, 800);
            }
            if (data.success == false) App.playAlert("error");
        })
        .catch(function (err) {
            console.log(err);
        });
};
document.getElementById("compositionLoad").addEventListener("change", submitComposition);

const submitSamplePack = (e) => {
    e.preventDefault();
    let message = "";
    let formData = new FormData(document.getElementById("uploadSamplePackForm"));
    formData.append("id", socketID);
    // console.log("form data: ", formData.get("samples"), "------ ID: ", formData.get("id"));
    // formData.forEach((file) => console.log("File: ", file));
    let options = { body: formData, method: "POST" };
    fetch("/upload-samples", options)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // have the JSON response from the POST operation here
            console.log(data);
            message = data.message;
            document.getElementById("samplePackFeedbackText").style.display = "block";
            document.getElementById(
                "samplePackFeedbackText"
            ).innerHTML = `<p><span class="serverFeedback">${message}</span></p>`;
            if (data.success) {
                console.log("load samples from server : )");
                App.getUserSamples(socketID);

                setTimeout(() => {
                    App.playAlert("enter");
                }, 800);
            }
            if (data.success == false) App.playAlert("error");
        })
        .catch(function (err) {
            console.log(err);
        });
};
document.getElementById("uploadSamplePackFormLoad").addEventListener("change", submitSamplePack);

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
