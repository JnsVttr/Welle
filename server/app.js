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


// logs + variables
// ===================
// console.log("__dirname: ", __dirname);
// console.log("clientDir: ", clientDir);
let debug = true;



// app folders + startpage
// ================================
app.use(express.static(clientDir));
app.use('/audio', express.static(path.join(__dirname, audioSource)));
app.use('/alert', express.static(path.join(__dirname, alertSource)));
app.get('/', function (req, res) { res.sendFile('index.html');  });




// socket connection
// ================================
io.on("connection", (socket) => {
	console.log("");
	console.log("");
	console.log("socket connects to client");
	socket.on('requestServerFiles', function (string) {
		printer(debug, "requestServerFiles", `client requests files on:`, string);
		io.sockets.emit('message', 'wait a bit, all is coming');
	});

});



// start server
// ================================
httpServer.listen(port, hostname, () => {
	console.log(`Serving running at http://${hostname}:${port}/`);
});






