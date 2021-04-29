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
let hostname = "localhost"; // const hostname = '127.0.0.1';
let moduleURL = new URL(import.meta.url);
let __dirname = path.dirname(moduleURL.pathname);

// LOCAL
if (path.join(__dirname) != "/var/www/virtual/tangible/html/server") {
    __dirname = path.dirname(moduleURL.pathname);
    hostname = "localhost";
}
// WEBSITE
if (path.join(__dirname) == "/var/www/virtual/tangible/html/server") {
    __dirname = "/home/tangible/html";
    hostname = "tangible.uber.space";
}

const clientDir = path.join(__dirname, "../client/");
const audioPath = path.join(__dirname, "../data/samples");
const alertsPath = path.join(__dirname, "../data/alerts");
const tonePresetsPath = path.join(__dirname, "../data/instruments/instruments.json");
const historyURL = path.join(__dirname, "../data/history");
const presetsURL = path.join(__dirname, "../data/presets");
const restartServerScript = ". /home/tangible/bin/restart_app.sh ";
let tonePresetsJSON = JSON.parse(fs.readFileSync(tonePresetsPath, "utf8"));

// app folders + startpage
// ================================
app.use(express.static(clientDir));
app.use("/audio", express.static(audioPath));
app.use("/alerts", express.static(alertsPath));
app.get("/", function (req, res) {
    res.sendFile(clientDir + "/index.html");
});

console.log(`__dirname = ${__dirname}. Hostname = ${hostname}. port: ${port}`);
//
//
//
//
// ======================================================================
// SOCKETS connection: io.sockets.emit, socket.on
// ======================================================================

const clients = {};
const users = [];

io.on("connection", (socket) => {
    const date = new Date().toISOString().slice(0, 10);
    console.log(`socket connects to client: id: ${socket.id}`);

    clients[socket.id] = { history: [] };
    socket.emit({ message: "new connection", clients: clients });
    const presets = getPresets({ path: presetsURL });
    socket.emit("presets", presets);

    // OSC tests

    // HELLO MESSAGE
    socket.on("message", (message) => {
        // if (debug) console.log(`socket on message: ${message.string}`);
        io.sockets.emit("allUsers", { users: users });
    });

    // new user
    socket.on("newUser", (message) => {
        clients[socket.id].user = message.user;
        if (!users[message.user]) users.push(message.user);
        io.sockets.emit("allUsers", { users: users });
    });

    // session data
    socket.on("sessionData", (message) => {
        console.log(
            `>> received session data from ${message.user}: ${message.string}. users: ${users}`
        );
        io.sockets.emit("sessionData", message);
    });

    // console input
    socket.on("consoleInput", (message) => {
        // console.log(`socket on consoleInput - id: ${message.id} input: ${message.input}`);
        clients[socket.id].history.push(message.input);
    });

    // TONE PRESETS
    socket.on("requestTonePresets", () => {
        // if (debug) console.log(`requestTonePresets for Client`);
        tonePresetsJSON = JSON.parse(fs.readFileSync(tonePresetsPath, "utf8"));
        io.sockets.emit("tonePresets", tonePresetsJSON);
    });

    // AUDIO FILES
    socket.on("requestSampleFiles", () => {
        // if (debug) console.log(`requestSampleFiles for Client`);
        // read & print files 'samples'
        const samples = getSamples({ path: audioPath });
        io.sockets.emit("audioFiles", samples);
    });

    // ALERTS FILES
    socket.on("requestAlerts", () => {
        // if (debug) console.log(`requestAlerts for Client`);
        // read & print files 'samples'
        const samples = getSamples({ path: alertsPath }); // alertsPath, baseUrl, "alerts"
        io.sockets.emit("alerts", samples);
    });

    // store preset
    socket.on("storePreset", (preset) => {
        const file = path.join(presetsURL, `${preset.name}.json`);
        fs.writeFile(file, JSON.stringify(preset, null, 4), (err) => {
            if (err) throw err;
            const presets = getPresets({ path: presetsURL });
            socket.emit("presets", presets);
        });
    });
    // socket on delete Preset
    socket.on("deletePreset", (message) => {
        const file = path.join(presetsURL, `${message.name}.json`);
        fs.unlink(file, function (err) {
            if (err) throw err;
            console.log(`File ${message.name}.json deleted!`);
            const presets = getPresets({ path: presetsURL });
            socket.emit("presets", presets);
        });
    });

    // on disconnect
    socket.on("disconnect", () => {
        // if there is some histoy, save it as file
        if (clients[socket.id].history.length > 0) {
            const file = path.join(historyURL, `${date}-${socket.id}.txt`);
            let history = `WELLE history - date: ${date}\n\n`;
            clients[socket.id].history.map((line) => {
                history += `${line} \n`;
            });
            fs.writeFile(file, history, (err) => {
                if (err) throw err;
            });
        }
        if (clients[socket.id].user) {
            const index = users.indexOf(clients[socket.id].user);
            if (index > -1) {
                users.splice(index, 1);
            }
        }
        io.sockets.emit("allUsers", { users: users });
        delete clients[socket.id];
        console.log(`deleted. client from clients: ${socket.id}`);
    });
});

// start server
// ================================
httpServer.listen(port, () => {
    console.log("");
    console.log(`Serving running at ${hostname}:${port}`);
    console.log("");
});
// start OSC

// functions
const getSamples = (message) => {
    // read sample entries
    const entries = fs.readdirSync(message.path, (err) => {
        if (err) return console.log("Unable to scan directory: " + err);
    });
    const samples = entries.filter((entry) => {
        if (!entry.startsWith(".")) return entry;
    });
    return samples;
};

const getPresets = (message) => {
    const entries = fs.readdirSync(message.path, (err) => {
        if (err) return console.log("Unable to scan directory: " + err);
    });
    const presets = entries.filter((entry) => {
        if (!entry.startsWith(".")) return entry;
    });
    const presetsData = presets.map((preset) => {
        const rawdata = fs.readFileSync(path.join(message.path, preset), (err) => {
            if (err) throw err;
        });
        return JSON.parse(rawdata);
    });
    return presetsData;
};
