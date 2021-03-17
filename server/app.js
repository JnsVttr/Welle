// ============================================================
// WELLE - server app 
// ============================================================

/*
re-working the app file
trying to sort things
*/


// libraries
const 	express = require('express');
const 	app = express();
const 	http = require('http').Server(app);
const 	io = require('socket.io')(http);
const 	port = process.env.PORT || 3000;
const 	path = require('path');
const 	fs = require('fs');
const 	SocketIOFile = require('socket.io-file');

// local resources and folder structure
const 	pageSource = '../client';
const 	audioSource = '../data/audio';
const 	alertSource = '../data/alert';
const 	historySource = '../data/history';
const 	presetsSource = '../data/presets';

// variables paths, data etc.
const audioPath = path.join(__dirname, audioSource);
const historyURL = path.join(__dirname, historySource);
const presetsURL = path.join(__dirname, presetsSource);
let presetData = '';
let onlineSessions = {};

// allow, indicate app access to folder structure
app.use(express.static(path.join(__dirname, pageSource)));
app.use('/audio', express.static(path.join(__dirname, audioSource)));
app.use('/alert', express.static(path.join(__dirname, alertSource)));

// page entry file
app.get('/', function(req, res) {
   res.sendFile('index.html');
});

// start fresh console
console.clear();
























// audio files
// ================================================================

var samples = {};
var folders = [];

function readCollection(state) {
	checkFolders(audioPath);
	// wait a bit and print the result:
	setTimeout(function(){ 
		if (state == true ) {printFiles(folders, 'Folders');}
	}, 200);  
};

function checkFolders( url ) {
	fs.readdir(url, function (err, files) {
		// empty the array:
	    folders = []
	    //handling error
	    if (err) {
	        return console.log('Unable to scan directory: ' + err);
	    } 
	    
	    files.forEach(function (file) {
	        var ext = path.parse(file).ext;
	        // if file is folder
	        if (ext == '' && file[0] != '.') {
	        	// console.log('is folder')
	        	folders.push(file);
	        };
	    });
	    console.log(' ');
	    console.log('Sample-folders at data/audio: ');
	    console.log(folders);
	    console.log(' ');
	    
	    for (let i=0; i<folders.length; i++) {
	    	var fileUrl = path.join(url, folders[i]);
	    	checkFiles(fileUrl);
	    };
	});
	
};

function checkFiles( url) {
	fs.readdir(url, function (err, files) {
	    //handling error
	    if (err) {
	        return console.log('Unable to scan directory: ' + err);
	    }; 

	    // saving samples as Objects
	    let folder = url.substring(url.lastIndexOf('/')).substring(1); 
	    let listOfFiles = [];
	    let numFiles = 0;
	    
	    files.forEach(function (file, c) {
	        var ext = path.parse(file).ext;
	        var name = path.parse(file).name; // remove etx  
	        // if file is file
	        if (ext != '') {
	       		listOfFiles.push(file); 
	       		numFiles += 1
	        };
	    });
	    
	    let shortURL = url.substring(url.indexOf("audio")) + '/';
	    // console.log('shortURL: ' + shortURL);

	    // check, if server is local or on tangible.uber.space
	    if ( path.join(__dirname) == '/Users/Maschine/Sites/welle/server') {
	    	shortURL = 'http://localhost:3000/' + shortURL;
	    };
	    if ( path.join(__dirname) == ' /var/www/virtual/tangible/html/server') {
	    	shortURL = ('https://tangible.uber.space/' + shortURL);
	    	// console.log('shortURL: ' + shortURL);
	    };
	    
	    // console.log('shortURL: ' + String(shortURL));
	    // printFiles(samples, String(folder) );
	    samples[folder] = {folderName: folder, url: url, shortURL: shortURL, files: listOfFiles, count: numFiles};
	});
};

function printFiles () {
	console.log('');
	console.log('============================');
	console.log('Folders[] stored on Server:')
	console.log(folders);
	console.log('');
	console.log('Samples{} Collection: ')
	// print global collection "samples"
	console.log(samples);
	console.log('');
	console.log('============================');
	console.log('');
};


// print out at server start:
readCollection(false);   // true = print files at server start..


























function encryptName(value) {
  var result="";
  for(i=0;i<value.length;i++) {
    if(i<value.length-1) {
        result+=value.charCodeAt(i)+10;
        result+="-";
    } else {
        result+=value.charCodeAt(i)+10;
    };
  };
  return result;
};


function updateHistory (url, user, id, string, date) {
	fs.readdir(url, function (err, files) {
	    //handling error
	    if (err) {
	        return console.log('Unable to scan directory: ' + err);
	    }; 
	    let encryptedUser = encryptName(user);
	    let historyFile = false;
	    let historyFileName = '';
	    let historyFileID = '';
	    let newFileName = '';
		let newFilePath = '';
		let exsitingFileName = '';
		let exsitingFilePath = '';

	    if (user == 'local') {
		    files.forEach(function (file, c) {
		        let ext = path.parse(file).ext;
		        file = path.parse(file).name; // remove etx  
		        let fileID = file.substring(file.indexOf('_') +1 );
		        // if file is file
		        if (ext != '') {
		        	// console.log(`Detected file: ${file}`);
	        		if (fileID == id) {
	        			// if there,  append file
	        			historyFile = true;
	        			historyFileID = id; 
	        		} else {
	        			// if create not there create file
	        			historyFile = false;
	        		};
		        };
		    });
		    newFileName = 'client_' + id + '.txt';
			newFilePath = path.join(url, newFileName);
			exsitingFileName = 'client_' + id + '.txt';
			exsitingFilePath = path.join(url, newFileName);
		}; 
		if (user != 'local' && user != 'guest') {
		    files.forEach(function (file, c) {
		        let ext = path.parse(file).ext;
		        file = path.parse(file).name; // without extension  
		        let fileID = file.substring(file.indexOf('_') +1 );
		        // if file is file
		        if (ext != '') {
		        	// console.log(`Detected file: ${file}`);
	        		if (file == encryptedUser) {
	        			// if there,  append file
	        			historyFile = true;
	        			historyFileID = id; 
	        		} else {
	        			// if create not there create file
	        			historyFile = false;
	        		};
		        };
		    });
		    newFileName = encryptedUser + '.txt';
			newFilePath = path.join(url, newFileName);
			exsitingFileName = encryptedUser + '.txt';
			exsitingFilePath = path.join(url, newFileName);
		}; 


		

	    if (historyFileID!='') {
	    	// if there,  append file
	    	// console.log(`File there! Concurrent file ID: ${id}`);
	    	fs.appendFile(exsitingFilePath, (string + '\r\n'), function (err) {
			  if (err) throw err;
			  // console.log(`updateHistory: file updated..`);
			}); 
	    } else {
	    	// if create not there create file
	    	// console.log(`File not there! create new file..`);
			fs.writeFile(newFilePath, (date + '\r\n \r\n' + string + '\r\n'), function (err, file) {
				if (err) throw err;
				// console.log(`updateHistory: new file saved!`);
			}); 
	    };
	});
};






























function presetHandling (action, url, presetName, data) {    //presetHandling('store', presetsURL, presetName, savedParts);
	fs.readdir(url, function (err, files) {
	    //handling error
	    if (err) {
	        return console.log('presetHandling: Unable to scan directory: ' + err);
	    }; 
	    
	    let presetFile = false; 
	    let newFileName = '';
		let newFilePath = '';
		let exsitingFileName = '';
		let exsitingFilePath = '';
		let stringData = '';


		files.forEach(function (file, c) {
	        let ext = path.parse(file).ext;
	        file = path.parse(file).name; // remove etx  
	        // if file is file
	        if (ext != '') {
	        	// console.log(`Detected file: ${file}`);
        		if (file == presetName) {
        			// file is there: replace
        			presetFile = true;
        		} 
	        };
	    });
	    if (presetFile){ console.log(`--> file there`); };
	    exsitingFileName = presetName + '.txt';
		exsitingFilePath = path.join(url, exsitingFileName);
		newFileName = presetName + '.txt';
		newFilePath = path.join(url, newFileName);


	    if (action == 'store') {
	    	stringData = JSON.stringify(data, null, 2);
			// console.log(`presetHandling: Data = ${JSON.stringify(data, null, 2)}`);
		    
			if (presetFile) {
		    	// if there,  append file
		    	console.log(`presetHandling: File there! Concurrent file name: ${exsitingFileName} at ${exsitingFilePath}`);
		    	fs.writeFile(exsitingFilePath, stringData, function (err) {
				  if (err) throw err;
				  console.log(`presetHandling: file replaced ..`);
				}); 
		    } else {
		    	// if create not there create file
		    	console.log(`File not there! create new file..`);
				fs.writeFile(newFilePath, stringData, function (err, file) {
					if (err) throw err;
					console.log(`presetHandling: new file saved!`);
				}); 
		    };
	    };


	     if (action == 'reload') {
			if (presetFile) {
		    	// if there,  reload file
		    	console.log(`presetHandling: File there: ${exsitingFileName} at ${exsitingFilePath}`);
		    	// stringData = JSON.stringify(data, null, 2);
				// console.log(`presetHandling: Data = ${JSON.stringify(data, null, 2)}`);
		    	fs.readFile(exsitingFilePath, stringData, function (err, data) {
				  if (err) throw err;
				  console.log(`presetHandling: reload: Read File: ${exsitingFileName} to 'data'`);
				  stringData = JSON.parse(data);
				  console.log(`presetHandling: reload: file data: ${stringData}`);
				  processReloadPreset (presetName, stringData)
				}); 
		    } else {
		    	// if create not there, return null
		    	console.log(`presetHandling: No preset-file there ..`);
		    	processReloadPreset (presetName, 'none')
		    };
	    };
	});
};

function processReloadPreset (presetName, data) {
	console.log(`processReloadPreset: presetName "${presetName}, "data: ${data} `);
	presetData = {name: presetName, data: data};
};































// SOCKET IO
// ================================================================
// chat example
var clients = 0;
var roomno = 1;
var users = [];
let uploadFolder = 'default';
var uploadDir = 'data/audio';
let newUploadDir = path.join(uploadDir, uploadFolder);

io.on('connection', function(socket) {
	let date = new Date();

	// console.log('client connects to server.. server URL: ' + path.join(__dirname));
	console.log('client connects to server.. ');
	setTimeout(function(){
		socket.emit('files', folders, samples, "store"); 	
	}, 700);

	socket.on('clientEvent', function(data) {
		socket.clientID =  socket.id;
		// console.log(`Msg. from client: user="${data.user}", string="${data.string}", id: ${socket.clientID}`);
		console.log(`Msg. from client: user="${data.user}", string="${data.string}"`);
		updateHistory (historyURL, data.user, socket.clientID, data.string, date);
	});















	// USER INTERACTION:
	// ================================================================
	socket.on('setUser', function(name, session) {
		let sessionState = false;
		let userState = false;
		if (session == undefined) {sessionState=false} else {sessionState= true};
		console.log('');
		console.log("setUser: incoming request from: " + name);

		if (sessionState){
			console.log("setUser: Wants to join session: " + session + " onlineSessions[session]: " + onlineSessions[session]);
			// check first, if guest --> then assign unique ID
			if (name == 'guest'){
				// console.log('assign unique guest ID');
			    var random = Math.random(); 
			    // console.log("Random Number Generated : " + random );  
			    name = ('guest_' + random);
			};
			// check if session exists:
			if (onlineSessions[session] == undefined){
				onlineSessions[session] = [name];	
				console.log("setUser: Session empty, setting user..");
				socket.emit('confirmUserToClient', {username: name, session: session});
				io.sockets.emit('updateUsers', {users: sessionUsers, session: session});
				updateHistory (historyURL, name, socket.clientID, (`\r\n --> new session - ${date}\r\n `), date);
			} else {
				// session exists! check if user exists:
				for (let i=0; i<onlineSessions[session].length; i++){
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
					socket.emit('confirmUserToClient', {username: name, session: session});
					let sessionUsers = onlineSessions[session];
					io.sockets.emit('updateUsers', {users: sessionUsers, session: session});
					updateHistory (historyURL, name, socket.clientID, (`\r\n --> new session - ${date}\r\n `), date);
				}
			};
			console.log("setUser: session-users: " + onlineSessions[session]);	
		};
		
		
		if (sessionState==false){
			if (name == 'guest'){
				// console.log('assign unique guest ID');
			    var random = Math.random(); 
			    // console.log("Random Number Generated : " + random );  
			    name = ('guest_' + random);
			};

			if(users.indexOf(name) > -1) {
				socket.emit('userExists', 'Error: ' + name + ' is already taken! Try some other username.');
				console.log("setUser: User \"" + name + "\" existis at users[]: " + users);
			} else {
				users.push(name);
				console.log("setUser: User \"" + name + "\" stored at users[]: " + users);
				socket.emit('confirmUserToClient', {username: name});
				io.sockets.emit('updateUsers', {users: users, session: 'online'});

				updateHistory (historyURL, name, socket.clientID, (`\r\n --> new session - ${date}\r\n `), date);
			};	
		};
   	});





  	socket.on('addUserToSocket',function (name, session) {
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

      	if (typeof delUser == 'undefined') {delUser='Client'; };
      	var connectionMessage = delUser + " disconnected from Socket.";  //" socket-ID: " + socket.id;
      	console.log(connectionMessage);

      	// if user part of a session, delete from session database
      	if (delSession!=undefined){
      		// if session exists
      		if (onlineSessions[delSession]!=undefined) {
      			for (let i=0; i<onlineSessions[delSession].length; i++) {
		      		if (onlineSessions[delSession][i] == delUser) {
		      			console.log("Deleting " + delUser + " from database: " + delSession);
		      			onlineSessions[delSession].splice(i, 1);
		      		};
		      	};
		      	if (onlineSessions[delSession].length>0 ) {
		      			console.log('remaining users: ' + onlineSessions[delSession]);
		      			io.sockets.emit('updateUsers', {users: onlineSessions[delSession], session: delSession});
		      	};
		      	console.log('');
      		}
      		

      	} else {
      		// if user not session, but global, delete globally
      		for (let i=0; i<users.length; i++) {
	      		if (users[i] == delUser) {
	      			console.log("Deleting " + delUser + " from general 'users' database ..");
	      			users.splice(i, 1);
	      		};
	      	};
	      	if (users.length>0 ) {
	      		console.log('remaining users: ' + users);
	      		io.sockets.emit('updateUsers', {users: users, session: 'online'});
	      	};
	      	console.log('');

      	}
      	
   	});





	socket.on('msg', function(data) {
		// check message: state, string, result, user
		console.log( socket.username + '\'s message to all: ' + data.string + " - from " + data.user);
		//socket.username = data.user;
		// send to everyone
		io.sockets.emit('msgToAll', data);
	});

	socket.on('status', function() {
		// console.log('getting status feedback');
	});


	socket.on('storePreset', function(presetName, savedPartsNames, savedParts) {
		console.log(`StorePresets: presetName=${presetName}, savedPartsNames "${savedPartsNames}" .. `);
		presetHandling('store', presetsURL, presetName, savedParts);
	});
	socket.on('reloadPreset', function(presetName) {
		console.log(`ReloadPreset: presetName=${presetName} `);
		presetHandling('reload', presetsURL, presetName);
		setTimeout(function(){
			console.log(`ReloadPreset: timeOut --> presetName "${presetData.name}" and data: "${presetData.data}"`);
			socket.emit('reloadPreset', presetData.name, presetData.data);
		}, 200);
	});

















   	// UPLOAD FILES
   	// ================================================================
	var count = 0;
	
	socket.on('uploadDest', function(dest){
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
		readCollection(true); 
		setTimeout(function(){
			socket.emit('files', folders, samples, 'store'); 	
		}, 100);
	});
	uploader.on('error', (err) => {
		console.log('Error!', err);
	});
	uploader.on('abort', (fileInfo) => {
		console.log('Aborted: ', fileInfo);
	});










	// send Files
	// ================================================================
  	socket.on('readFiles', function(what){
  		console.log('client requests files on: ' + what);
  		// read & print files
  		readCollection(false);
  		setTimeout(function(){
  			console.log('sending files to client');
  			socket.emit('files', folders, samples, what); 	
  		}, 200);
  		
	});


  	// restart the server
  	socket.on('restart', function() {
  		console.log('Try restart server..');
  		console.log("This is pid " + process.pid);
	  	var exec = require('child_process').exec;
		var child;

		child = exec('. /home/tangible/bin/restart_app.sh ',
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
http.listen(port, function() {
   console.log('Welle Server listening on *: ' + port);
   // console.log("This is pid " + process.pid);
});



