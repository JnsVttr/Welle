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
import multer from "multer";

// app + server + sockets
// ===========================
// create app - will be the app that points to client dir *
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
let clientDir = path.join(__dirname, "../client/");

// LOCAL
if (path.join(__dirname) != "/var/www/virtual/tangible/html/server") {
    hostname = "localhost";
    clientDir = path.join(__dirname, "../client/");
}
// WEBSITE
if (path.join(__dirname) == "/var/www/virtual/tangible/html/server") {
    hostname = "tangible.uber.space";
    clientDir = path.join(__dirname, "../client_build/");
}

let audioPath = path.join(__dirname, "../data/samplePacks/default");
const alertsPath = path.join(__dirname, "../data/alerts");
const historyURL = path.join(__dirname, "../data/history");
const restartServerScript = ". /home/tangible/bin/restart_app.sh ";
const downloadPresetURL = path.join(__dirname, "../data/presetDownload");
const uploadPresetURL = path.join(__dirname, "../data/presetUpload");
const samplePacksURL = path.join(__dirname, "../data/samplePacks");
const presetsURL = path.join(__dirname, "../data/preset");
let userURL = path.join(__dirname, "../data/user");
// const tonePresetsPath = path.join(__dirname, "../data/instruments/instruments.json");
// let tonePresetsJSON = JSON.parse(fs.readFileSync(tonePresetsPath, "utf8"));

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
// app folders + startpage
// ================================
app.use(express.static(clientDir));
app.use("/audio", express.static(audioPath));
app.use("/samplePacks", express.static(samplePacksURL));
app.use("/user", express.static(userURL));
app.use("/alerts", express.static(alertsPath));
app.use("/uploadPresets", express.static(uploadPresetURL));
app.get("/", function (req, res) {
    res.sendFile(clientDir + "/index.html");
});
app.get("/downloadPreset", function (req, res) {
    const file = path.join(downloadPresetURL, "composition.json");
    res.download(file); // Set disposition and send it.
});

console.log(`__dirname = ${__dirname}. Hostname = ${hostname}. port: ${port}`);
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

// MULTER FILE UPLOAD
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPresetURL);
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + path.extname(file.originalname));
    },
});
const storageSamples = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log("req body", req.body);
        cb(null, userURL);
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.originalname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});
const samplesFilter = function (req, file, cb) {
    // Accept mp3s only
    if (!file.originalname.match(/\.(mp3|MP3)$/)) {
        req.fileValidationError = "Only mp3 files are allowed!";
        return cb(new Error("Only mp3 files are allowed!"), false);
    }
    cb(null, true);
};
const jsonFilter = function (req, file, cb) {
    // Accept  only json files
    if (!file.originalname.match(/\.(json)$/)) {
        req.fileValidationError = "Only json files are allowed!";
        return cb(new Error("Only json files are allowed!"), false);
    }
    cb(null, true);
};
app.post("/upload-preset", (req, res, next) => {
    console.log("incoming composition file..");

    let upload = multer({ storage: storage, fileFilter: jsonFilter }).single("composition");

    upload(req, res, function (err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        if (req.fileValidationError) {
            return res.json({
                success: false,
                message: "upload error: no json file",
                data: "",
            });
        } else if (!req.file) {
            return res.json({
                success: false,
                message: "...",
                data: "",
            });
        } else if (err instanceof multer.MulterError) {
            return res.json({
                success: false,
                message: "upload error",
                data: "",
            });
        } else if (err) {
            return res.json({
                success: false,
                message: "upload error",
                data: "",
            });
        }
        // success feedback
        res.json({
            success: true,
            message: "upload success",
            data: "",
        });
    });
});

app.post("/upload-samples", (req, res, next) => {
    console.log("incoming sample files ..");
    let userID = "";
    let userDirPath = userURL;
    let uploadText = undefined;
    let upload = undefined;
    let store = undefined;

    store = multer.diskStorage({
        destination: function (req, file, cb) {
            console.log("store path multer:", userDirPath);
            // console.log("req.files", req.files);
            cb(null, userDirPath);
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, file.originalname);
        },
    });
    upload = multer({
        storage: store,
        fileFilter: samplesFilter,
        limits: { fileSize: 200000 },
    }).fields([{ name: "samples", maxCount: 30 }]);
    upload(req, res, (err) => {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any
        // console.log(`check files: `, req.files);
        // console.log(`check id: `, req.body["id"]);
        userID = req.body["id"];
        userDirPath = `${userDirPath}/${userID}`;
        if (!fs.existsSync(userDirPath)) {
            console.log(`${userDirPath} doesn't exist..`);
            console.log(`mkdir ${userID}`);
            fs.mkdirSync(userDirPath);
        }
        Object.entries(req.files).forEach(([key, value]) => {
            console.log(`${key} ${value}`);
            value.forEach((file) => {
                console.log(file.originalname);
                var oldPath = file.path;
                var newPath = `${userURL}/${userID}/${file.originalname.toLowerCase()}`;
                // console.log(`paths from: ${oldPath}`);
                // console.log(`paths to: ${newPath}`);
                // console.log(`filename: ${file.originalname}, lowerCase: ${file.originalname.toLowerCase()}`);
                fs.rename(oldPath, newPath, function (err) {
                    if (err) throw err;
                    // console.log(file.originalname, "Successfully renamed - AKA moved!");
                });
            });
        });

        if (req.fileValidationError) {
            return res.json({
                success: false,
                message: "upload error: no mp3 file",
                data: "",
            });
        } else if (!req.files) {
            return res.json({
                success: false,
                message: "don't know",
                data: "",
            });
        } else if (err instanceof multer.MulterError) {
            return res.json({
                success: false,
                message: "too many or too big files",
                data: "",
            });
        } else if (err) {
            return res.json({
                success: false,
                message: "upload error",
                data: "",
            });
        }
        // success feedback
        res.json({
            success: true,
            message: "upload success",
            data: "",
        });
    });
});
//
////
//
//
//
//
//
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
    // const presets = getPresets({ path: presetsURL });
    // socket.emit("presets", presets);

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
        console.log(`added new user: ${message.user}`);
        io.sockets.emit("allUsers", { users: users });
    });

    // session data
    // socket.on("sessionData", (message) => {
    //     console.log(
    //         `>> received session data from ${message.user}: ${message.string}. users: ${users}`
    //     );
    //     io.sockets.emit("sessionData", message);
    // });

    // console input
    socket.on("consoleInput", (message) => {
        // console.log(`socket on consoleInput - id: ${message.id} input: ${message.input}`);
        clients[socket.id].history.push(message.input);
    });

    // TONE PRESETS
    // STORE PRESET
    socket.on("storePreset", (message) => {
        console.log(`receive preset ${message.name}`);
        const fileName = `${message.name}.json`;
        const fileURL = path.join(downloadPresetURL, fileName);
        fs.writeFile(fileURL, JSON.stringify(message.preset, null, 4), (err) => {
            if (err) throw err;
            //const presets = getPresets({ path: presetsURL });
            socket.emit("presetURL", { url: "/downloadPreset", file: fileName });
        });
    });
    // REQUEST PRESET
    socket.on("requestPreset", () => {
        console.log(`request presets for client`);
        let preset = JSON.parse(fs.readFileSync(path.join(uploadPresetURL, "composition.json"), "utf8"));
        io.sockets.emit("presetData", preset);
    });

    // });
    // socket on delete Preset
    // socket.on("deletePreset", (message) => {
    //     const file = path.join(presetsURL, `${message.name}.json`);
    //     fs.unlink(file, function (err) {
    //         if (err) throw err;
    //         console.log(`File ${message.name}.json deleted!`);
    //         const presets = getPresets({ path: presetsURL });
    //         socket.emit("presets", presets);
    //     });
    // });
    socket.on("requestSamplePacks", () => {
        console.log(`request samplePacks for client`);
        // let samplePacks = JSON.parse(fs.readFileSync(samplePacksURL, "utf8"));
        const samplePacks = getSamplePacks({ path: samplePacksURL });
        console.log(samplePacks);
        io.sockets.emit("samplePacks", { samplePacks: samplePacks });
    });

    // AUDIO FILES
    socket.on("requestSampleFiles", (message) => {
        console.log(`request sample files..`);
        // get samplePacks and if no message, than deliver defaults
        // const samplePacks = getSamplePacks({ path: samplePacksURL });
        let samples = undefined;
        let packUrl = "default";
        let packPath = path.join(samplePacksURL, packUrl);
        if (message != undefined) {
            if (message.samplePack != undefined) {
                packUrl = message.samplePack;
                audioPath = path.join(samplePacksURL, packUrl);
                app.use("/audio", express.static(audioPath));
                console.log(`for "${packUrl}"`);
            }
        } else {
            audioPath = packPath;
            app.use("/audio", express.static(audioPath));
        }
        samples = getSamples({ path: audioPath });
        console.log(`app audioPath: ${audioPath}`);
        io.sockets.emit("sampleFiles", { files: samples });
    });

    socket.on("requestUserSamples", (message) => {
        console.log(`request samples from: ${message.id}`);
        let socketID = message.id;
        let samples = undefined;
        let packPath = path.join(userURL, socketID);
        samples = getSamples({ path: packPath });
        console.log(`socketID: ${socketID}, app audioPath: ${packPath}`);
        io.sockets.emit("sampleFiles", { files: samples, path: `/user/${socketID}` });
    });

    // ALERTS FILES
    socket.on("requestAlerts", () => {
        // if (debug) console.log(`requestAlerts for Client`);
        // read & print files 'samples'
        const samples = getSamples({ path: alertsPath }); // alertsPath, baseUrl, "alerts"
        io.sockets.emit("alerts", samples);
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
        let userDir = path.join(userURL, socket.id);
        if (fs.existsSync(userDir)) {
            console.log(`${socket.id} exist  -> delete !!`);
            fs.rmdirSync(userDir, { recursive: true });
        }
        // if (clients[socket.id].user) {
        //     const index = users.indexOf(clients[socket.id].user);
        //     if (index > -1) {
        //         users.splice(index, 1);
        //     }
        // }
        // io.sockets.emit("allUsers", { users: users });
        // delete clients[socket.id];
        // console.log(`deleted. client from clients: ${socket.id}`);
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
    let count = 0;
    // read sample entries
    const entries = fs.readdirSync(message.path, (err) => {
        if (err) return console.log("Unable to scan directory: " + err);
    });
    const samples = entries.filter((entry) => {
        if (!entry.startsWith(".")) {
            count = count + 1;
            return entry;
        }
    });
    // console.log(`samples count: ${count}`);
    return { samples: samples, count: count };
};

const getSamplePacks = (message) => {
    const entries = fs.readdirSync(message.path, (err) => {
        if (err) return console.log("Unable to scan directory: " + err);
    });
    // console.log("samplePack entries: ", entries);
    const packs = entries.filter((entry) => {
        if (!entry.startsWith(".")) {
            if (!entry.endsWith(".zip")) return entry;
        }
    });
    return packs;
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
