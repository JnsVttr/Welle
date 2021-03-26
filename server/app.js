// ============================================================
// WELLE - server app 
// ============================================================

// libraries
// ===================
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import fs from 'fs';

// files
// ===================
import { printer } from './printer.js';
import { readFiles } from './files.js'



// app + server + sockets
// ===========================
// create app - will be the app that points to client dir
let app = express();
const port = process.env.PORT || 3000;
// create a server with the app
const httpServer = createServer(app);
const io = new Server(httpServer);


// local resources 
// ===================
const pageSource 	= '../client/';
const audioSource 	= '../data/audio';
const alertSource 	= '../data/alert';
const historySource = '../data/history';
const presetsSource = '../data/presets';
const tonePresets 	= '../data/tonePresets/tonePresets.json'; 
// const hostname = '127.0.0.1';
const hostname = 'localhost';
// get paths and set __dirname (not there in es6)
const moduleURL 		= new URL(import.meta.url);
const __dirname 		= path.dirname(moduleURL.pathname);
const clientDir 		= path.join(__dirname, pageSource);
const audioPathRel 		= 'audio';
const audioPath 		= path.join(__dirname, audioSource);
const tonePresetsPath 	= path.join(__dirname, tonePresets);
const historyURL 		= path.join(__dirname, historySource);
const presetsURL 		= path.join(__dirname, presetsSource);
let restartServerScript = '. /home/tangible/bin/restart_app.sh ';


// variables
// ===================
let debug = true;
let baseUrl = '';
// check, if server is local or on tangible.uber.space
if (path.join(__dirname) != '/var/www/virtual/tangible/html/server')  
	baseUrl = 'http://localhost:3000/';
if (path.join(__dirname) == '/var/www/virtual/tangible/html/server')  
	baseUrl = 'https://tangible.uber.space/';
let tonePresetsJSON = JSON.parse(fs.readFileSync(tonePresetsPath, 'utf8'));	




// app folders + startpage
// ================================
app.use(express.static(clientDir));
app.use('/audio', express.static(path.join(__dirname, audioSource)));
app.use('/alert', express.static(path.join(__dirname, alertSource)));
app.get('/', function (req, res) { res.sendFile('index.html'); });


// Samples & Folders - handle audio files
// =========================================
let audioFiles = {};
// audioFiles = readFiles(audioPath, baseUrl, audioPathRel);












// ======================================================================
// SOCKETS connection: io.sockets.emit, socket.on
// ======================================================================

io.on("connection", (socket) => {
	console.log("");
	console.log("socket connects to client");

	// HELLO MESSAGE
	socket.on('message', (string) => {
		printer(debug, "socket.on", "message", string)
	});

	// TONE PRESETS
	socket.on('requestTonePresets', () => {
		// printer(debug, "JSON", 'paths', tonePresetsJSON)
		tonePresetsJSON = JSON.parse(fs.readFileSync(tonePresetsPath, 'utf8'));	
		io.sockets.emit("tonePresets", tonePresetsJSON);
	});


	// AUDIO FILES
	socket.on('requestSampleFiles', () => {
		printer(debug, "requestSampleFiles", `client requests sample files`);
		// read & print files 'samples'
		audioFiles = readFiles(audioPath, baseUrl, audioPathRel);
		io.sockets.emit('audioFiles', audioFiles);	
	});
});



// start server
// ================================
httpServer.listen(port, hostname, () => {
	console.log("");
	console.log(`Serving running at http://${hostname}:${port}`);
	console.log("");
});






