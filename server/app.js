// ============================================================
// WELLE - server app 
// ============================================================

/*
re-working the app file
trying to sort things
*/


// libraries
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const path = require('path');
const fs = require('fs');
const SocketIOFile = require('socket.io-file');
const { readMediaFolders } = require("./readMediaFolders");
const { readMediaFoldersFiles } = require("./readMediaFoldersFiles");
const { updateHistory } = require("./updateHistory");
const { presetHandling } = require("./presetHandling");
const { printer } = require('./printer');

// local resources and folder structure
const pageSource = '../client';
const audioSource = '../data/audio';
const alertSource = '../data/alert';
const historySource = '../data/history';
const presetsSource = '../data/presets';



// variables paths, data etc.
const audioPath = path.join(__dirname, audioSource);
const historyURL = path.join(__dirname, historySource);
const presetsURL = path.join(__dirname, presetsSource);
let restartServerScript = '. /home/tangible/bin/restart_app.sh ';
let debug = true;
let context = "app.js";

// allow, indicate app access to folder structure
app.use(express.static(path.join(__dirname, pageSource)));
app.use('/audio', express.static(path.join(__dirname, audioSource)));
app.use('/alert', express.static(path.join(__dirname, alertSource)));

// page entry file
app.get('/', function (req, res) {
	res.sendFile('index.html');
});

// start fresh console
console.clear();






// handle audio files
// ================================================================
var samples = {};
var folders = [];

let scanMediaFolders = (_audioPath) => {
	let _folders = readMediaFolders(_audioPath);
	let _samples = readMediaFoldersFiles(_audioPath, _folders);
	return {folders: _folders, samples: _samples};
}
let scanResults = scanMediaFolders(audioPath);
printer(debug, context, "audio files", `
	Scanning audio files, folders and samples. 
	Collected: ${scanResults.folders}
	random test samples entry: "${Object.keys(scanResults.samples)[0]}"

==============
`);


/*

Socket passing to function:
===========================

io.on('connection', function(socket){
  socket.on('need data', function(msg) {
	getLinkBacks(msg, function(content) {
	  socket.emit("data", content);
	});
  });
});
//
var getLinkBacks = function(title, fn) {
  request.get("relevant url", function(err, res, body) {
	fn(body);
  });
};

I agree with you, Node's style is passing a callback function, so I would rewrite this code as follows:
This will keep each part of your app isolated, and getLinkBacks function will not have to know about what socket is. This is of course a good programming practice. Besides you could reuse getLinkBacks function in other parts of your app, which are not connected with socket object.
P.S. I would recommend Robert Martin's "Clean Code: A Handbook of Agile Software Craftsmanship". He gives very valuable advises about how to structure your code to make it "clean".
Good luck!


*/





// SOCKET IO
// ================================================================

let users = [];
let uploadFolder = 'default';
let uploadDir = 'data/audio';
let newUploadDir = path.join(uploadDir, uploadFolder);
let sessionState = false;
let userState = false;
let onlineSessions = {};


// if a client connects to the server:

io.on('connection', socket => {
	let date = new Date();

	// console.log('client connects to server.. server URL: ' + path.join(__dirname));
	printer(debug, context, "socket connection", 'client connects to server.. ');

	// send the audio content to client on each connection
	setTimeout(function () {
		socket.emit('files', folders, samples, "store");
	}, 700);

	// on each client event add the interaction to the history
	socket.on('clientEvent', (data) => {
		socket.clientID = socket.id;
		printer(debug, context, "clientEvent", `Msg. from client: user="${data.user}", string="${data.string}"`)
		updateHistory(historyURL, data.user, socket.clientID, data.string, date);
	});

	// receive a simple message
	socket.on('msg', function (data) {
		printer(debug, context, "msg to all", ` 
		socket.username: ${socket.username} 
		user: ${data.user} 
		data: ${data.string}
		`);
		// send to everyone
		io.sockets.emit('msgToAll', data);
	});

	socket.on('status', function () {
		// console.log('getting status feedback');
	});


	// socket preset handling
	socket.on('storePreset', function (presetName, savedPartsNames, savedParts) {
		presetHandling('store', presetsURL, presetName, savedParts);
	});

	socket.on('reloadPreset', function (presetName) {
		let _presetName = "";
		let _presetContent = "";
		let _presetValues = [];
		let presetData = [];
		_presetValues = presetHandling('reload', presetsURL, presetName);
		_presetName = _presetValues[0];
		_presetContent = _presetValues[1];
		presetData = { name: _presetName, data: _presetContent };
		console.log(`socket --> send preset: ${presetData.name}`);
		socket.emit('reloadPreset', presetData.name, presetData.data);
	});






	// receive request for server files. scan & send Files
	// ================================================================
	socket.on('requestServerFiles', function (string) {
		printer(debug, context, "requestServerFiles", `client requests files on: ${string}`);
		
		// read & print files 'samples'
		if (string == 'samples') {
			let scanResults = scanMediaFolders(audioPath);
			printer(debug, context, "requestServerFiles", `sending files ${scanResults}`);
			socket.emit('filesOnServer', scanResults.folders, scanResults.samples, string);	
		};
	});

















	// USER INTERACTION:
	// ================================================================
	socket.on('setUser', function (name, session) {
		
		// even different sessions are possible
		sessionState = false;
		if (session == undefined) { 
			sessionState = false;
			console.log("sessionState false"); 
		} else { 
			sessionState = true; 
			console.log("sessionState true"); 
		};
		
		// message
		console.log('');
		console.log("setUser: incoming request from: " + name);

		if (sessionState) {
			console.log("setUser: Wants to join session: " + session + " onlineSessions[session]: " + onlineSessions[session]);
			// check first, if guest --> then assign unique ID
			if (name == 'guest') {
				// console.log('assign unique guest ID');
				var random = Math.random();
				// console.log("Random Number Generated : " + random );  
				name = ('guest_' + random);
			};
			// check if session exists:
			if (onlineSessions[session] == undefined) {
				onlineSessions[session] = [name];
				console.log("setUser: Session empty, setting user..");
				socket.emit('confirmUserToClient', { username: name, session: session });
				io.sockets.emit('updateUsers', { users: sessionUsers, session: session });
				updateHistory(historyURL, name, socket.clientID, (`\r\n --> new session - ${date}\r\n `), date);
			} else {
				// session exists! check if user exists:
				for (let i = 0; i < onlineSessions[session].length; i++) {
					let storedUser = onlineSessions[session][i];
					if (name == storedUser) {
						// user exists
						userState = true;
					} else {
						// user not exists, add user:
						userState = false;
					};
				};
				if (userState) {
					socket.emit('userExists', 'Error: ' + name + ' is already taken! Try some other username.');
					console.log("setUser: Session: User \"" + name + "\" existis");
				} else {
					onlineSessions[session].push(name);
					console.log("setUser: Session exists, adding user..");
					socket.emit('confirmUserToClient', { username: name, session: session });
					let sessionUsers = onlineSessions[session];
					io.sockets.emit('updateUsers', { users: sessionUsers, session: session });
					updateHistory(historyURL, name, socket.clientID, (`\r\n --> new session - ${date}\r\n `), date);
				}
			};
			console.log("setUser: session-users: " + onlineSessions[session]);
		};


		if (sessionState == false) {
			if (name == 'guest') {
				// console.log('assign unique guest ID');
				var random = Math.random();
				// console.log("Random Number Generated : " + random );  
				name = ('guest_' + random);
			};

			if (users.indexOf(name) > -1) {
				socket.emit('userExists', 'Error: ' + name + ' is already taken! Try some other username.');
				console.log("setUser: User \"" + name + "\" existis at users[]: " + users);
			} else {
				users.push(name);
				console.log("setUser: User \"" + name + "\" stored at users[]: " + users);
				socket.emit('confirmUserToClient', { username: name });
				io.sockets.emit('updateUsers', { users: users, session: 'online' });

				updateHistory(historyURL, name, socket.clientID, (`\r\n --> new session - ${date}\r\n `), date);
			};
		};
	});

	socket.on('addUserToSocket', function (name, session) {
		// we store the username in the socket session for this client
		socket.username = name;
		socket.session = session;
		console.log('addUserToSocket: --> User ' + socket.username + ' confirmed to client. Session: ' + socket.session);
		console.log('');
	});

	socket.on('disconnect', function () {
		let delUser = socket.username;
		let delSession = socket.session;
		console.log(`disconnect: user "${delUser}"/ session "${delSession}".`);

		if (typeof delUser == 'undefined') { delUser = 'Client'; };
		var connectionMessage = delUser + " disconnected from Socket.";  //" socket-ID: " + socket.id;
		console.log(connectionMessage);

		// if user part of a session, delete from session database
		if (delSession != undefined) {
			// if session exists
			if (onlineSessions[delSession] != undefined) {
				for (let i = 0; i < onlineSessions[delSession].length; i++) {
					if (onlineSessions[delSession][i] == delUser) {
						console.log("Deleting " + delUser + " from database: " + delSession);
						onlineSessions[delSession].splice(i, 1);
					};
				};
				if (onlineSessions[delSession].length > 0) {
					console.log('remaining users: ' + onlineSessions[delSession]);
					io.sockets.emit('updateUsers', { users: onlineSessions[delSession], session: delSession });
				};
				console.log('');
			}


		} else {
			// if user not session, but global, delete globally
			for (let i = 0; i < users.length; i++) {
				if (users[i] == delUser) {
					console.log("Deleting " + delUser + " from general 'users' database ..");
					users.splice(i, 1);
				};
			};
			if (users.length > 0) {
				console.log('remaining users: ' + users);
				io.sockets.emit('updateUsers', { users: users, session: 'online' });
			};
			console.log('');

		}

	});
























	// UPLOAD FILES
	// ================================================================


	socket.on('uploadDest', function (dest) {
		newUploadDir = path.join(uploadDir, dest);
		uploader.options.uploadDir = newUploadDir;
	});

	var uploader = new SocketIOFile(socket, {
		uploadDir: newUploadDir,
		accepts: ['audio/mpeg', 'audio/mp3'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
		maxFileSize: 200000, 						// 200 KB. default is undefined(no limit)
		chunkSize: 10240,							// default is 10240(1KB)
		transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
		overwrite: true, 							// overwrite file if exists, default is true.
		// rename: function(filename) {
		// 	var split = filename.split('.');	// split filename by .(extension)
		// 	var fname = split[0];	// filename without extension
		// 	var ext = split[1];
		// 	return `${fname}_${count++}.${ext}`;
		// }
		//rename: 'MyMusic.mp3'
	});

	uploader.on('start', (fileInfo) => {
		console.log('Start uploading');
		console.log(fileInfo);
	});
	uploader.on('stream', (fileInfo) => {
		console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
	});
	uploader.on('complete', (fileInfo) => {
		console.log('Upload Complete.');
		console.log(fileInfo);
		scanMediaFolders(audioPath);
		setTimeout(function () {
			socket.emit('files', folders, samples, 'store');
		}, 100);
	});
	uploader.on('error', (err) => {
		console.log('Error!', err);
	});
	uploader.on('abort', (fileInfo) => {
		console.log('Aborted: ', fileInfo);
	});
























	
















	// restart the server
	socket.on('restart', function () {
		console.log('Try restart server..');
		console.log("This is pid " + process.pid);
		var exec = require('child_process').exec;
		var child;

		
		child = exec(restartServerScript,
			function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
			});
	});

	// EOF socket IO
});












// set server + listening port 
http.listen(port, function () {
	console.log('Welle - Server listening on *: ' + port);
	console.log("(PID " + process.pid + ")");
	console.log("");
});



