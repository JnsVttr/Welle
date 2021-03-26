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
const pageSource = '../client/';
const audioSource = '../data/audio';
const alertSource = '../data/alert';
const historySource = '../data/history';
const presetsSource = '../data/presets';
// const hostname = '127.0.0.1';
const hostname = 'localhost';
// get paths and set __dirname (not there in es6)
const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);
const clientDir = path.join(__dirname, pageSource);
const audioPath = path.join(__dirname, audioSource);
const historyURL = path.join(__dirname, historySource);
const presetsURL = path.join(__dirname, presetsSource);
let restartServerScript = '. /home/tangible/bin/restart_app.sh ';


// logs + variables
// ===================
// console.log("__dirname: ", __dirname);
// console.log("clientDir: ", clientDir);
let debug = true;
let baseUrl = '';
// check, if server is local or on tangible.uber.space
if (path.join(__dirname) != '/var/www/virtual/tangible/html/server')  
	baseUrl = 'http://localhost:3000/';
if (path.join(__dirname) == '/var/www/virtual/tangible/html/server')  
	baseUrl = 'https://tangible.uber.space/';
			




// app folders + startpage
// ================================
app.use(express.static(clientDir));
app.use('/audio', express.static(path.join(__dirname, audioSource)));
app.use('/alert', express.static(path.join(__dirname, alertSource)));
app.get('/', function (req, res) { res.sendFile('index.html'); });


// Samples & Folders - handle audio files
// =========================================
// scan at server start
let audioFiles = {};
audioFiles = readFiles(audioPath, baseUrl);
// printer(debug, 'audioFiles check:', `getting files: `, audioFiles);






// SOCKETS connection: io.sockets
// ================================
io.on("connection", (socket) => {
	console.log("");
	console.log("");
	console.log("socket connects to client");

	// AUDIO FILES
	socket.on('requestServerFiles', function (string) {
		printer(debug, "requestServerFiles", `client requests files on:`, string);
		// read & print files 'samples'
		if (string == 'samples') io.sockets.emit('audioFiles', audioFiles);	
	});
});



// start server
// ================================
httpServer.listen(port, hostname, () => {
	console.log(`Serving running at http://${hostname}:${port}/`);
});






