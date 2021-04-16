// ============================================================
// WELLE - server app
// ============================================================

// libraries
// ===================
import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import path from "path";
import fs from "fs";

// app + server + sockets
// ===========================
// create app - will be the app that points to client dir
const app = express();
const port = process.env.PORT || 3000;
// create a server with the app
const httpServer = createServer(app);
const io = new Server(httpServer);

// local resources
// ===================
const pageSource = "../client/";
const audioSource = "../data/samples";
const alertSource = "../data/alerts";
const historySource = "../data/history";
const presetsSource = "../data/presets";
const tonePresets = "../data/tonePresets/tonePresets.json";
// const hostname = '127.0.0.1';
const hostname = "localhost";
// get paths and set __dirname (not there in es6)
const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);
const clientDir = path.join(__dirname, pageSource);
const audioPathRel = "audio";
const audioPath = path.join(__dirname, audioSource);
const alertsPath = path.join(__dirname, alertSource);
const tonePresetsPath = path.join(__dirname, tonePresets);
const historyURL = path.join(__dirname, historySource);
const presetsURL = path.join(__dirname, presetsSource);
const restartServerScript = ". /home/tangible/bin/restart_app.sh ";

// variables
// ===================
const debug = true;
let baseUrl = "";
// check, if server is local or on tangible.uber.space
if (path.join(__dirname) != "/var/www/virtual/tangible/html/server")
    baseUrl = "http://localhost:3000/";
if (path.join(__dirname) == "/var/www/virtual/tangible/html/server")
    baseUrl = "https://tangible.uber.space/";
let tonePresetsJSON = JSON.parse(fs.readFileSync(tonePresetsPath, "utf8"));

// app folders + startpage
// ================================
app.use(express.static(clientDir));
app.use("/audio", express.static(path.join(__dirname, audioSource)));
app.use("/alerts", express.static(path.join(__dirname, alertSource)));
app.get("/", function (req, res) {
    res.sendFile("index.html");
});

//
//
//
//
// ======================================================================
// SOCKETS connection: io.sockets.emit, socket.on
// ======================================================================

io.on("connection", (socket) => {
    console.log("");
    console.log("socket connects to client");

    // HELLO MESSAGE
    socket.on("message", (string) => {
        if (debug) console.log(`socket on message: ${string}`);
    });

    // TONE PRESETS
    socket.on("requestTonePresets", () => {
        if (debug) console.log(`requestTonePresets for Client`);
        tonePresetsJSON = JSON.parse(fs.readFileSync(tonePresetsPath, "utf8"));
        io.sockets.emit("tonePresets", tonePresetsJSON);
    });

    // AUDIO FILES
    socket.on("requestSampleFiles", () => {
        if (debug) console.log(`requestSampleFiles for Client`);
        // read & print files 'samples'
        const samples = getSamples({ path: audioPath });
        io.sockets.emit("audioFiles", samples);
    });

    // ALERTS FILES
    socket.on("requestAlerts", () => {
        if (debug) console.log(`requestAlerts for Client`);
        // read & print files 'samples'
        const samples = getSamples({ path: alertsPath }); // alertsPath, baseUrl, "alerts"
        io.sockets.emit("alerts", samples);
    });
});

// start server
// ================================
httpServer.listen(port, hostname, () => {
    console.log("");
    console.log(`Serving running at http://${hostname}:${port}`);
    console.log("");
});

// functions

// Samples - get files from folders, save URL according to baseUrl
const getSamples = (message) => {
    // read sample entries
    const entries = fs.readdirSync(message.path, (err) => {
        if (err) return console.log("Unable to scan directory: " + err);
    });

    const samples = entries.filter((entry) => {
        if (!entry.startsWith(".")) return entry;
    });
    console.log(`getSamples(): `, samples);

    return samples;
};
