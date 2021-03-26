// ============================================================
// WELLE - server app 
// ============================================================

/*
re-working the app file
trying to sort things
*/


// libraries

// import http from 'http';
// import io from 'socket.io'



import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { printer } from './printer.js';




// create app - will be the app that points to client dir
let app = express();
// get paths and set __dirname (not there in es6)
const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);
const port = process.env.PORT || 3000;
// create a server with the app
const httpServer = createServer(app);
const io = new Server(httpServer, {
	// ...
});


// local resources and folder structure
const pageSource = '../client/';
const audioSource = '../data/audio';
const alertSource = '../data/alert';
const historySource = '../data/history';
const presetsSource = '../data/presets';
// const hostname = '127.0.0.1';
const hostname = 'localhost';
const clientDir = path.join(__dirname, pageSource);

// logs
console.log("__dirname: ", __dirname);
console.log("clientDir: ", clientDir);




app.use(express.static(clientDir));
app.use('/audio', express.static(path.join(__dirname, audioSource)));
app.use('/alert', express.static(path.join(__dirname, alertSource)));

// page entry file
app.get('/', function (req, res) {
	res.sendFile('index.html');
	// res.send('Hello from app');

});

io.on("connection", (socket) => {
	console.log("");
	console.log("");
	console.log("socket connects to client");
	socket.on('requestServerFiles', function (string) {
		printer(true, 'app', "requestServerFiles", `client requests files on: ${string}`);
		io.sockets.emit('message', 'wait a bit, all is coming');
	});

});


httpServer.listen(port, hostname, () => {
	console.log(`Serving running at http://${hostname}:${port}/`);
});






