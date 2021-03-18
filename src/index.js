// WELLE - main index file //
// =============================================================

/*
https://github.com/harc/ohm

*/


// libraries
import io from 'socket.io-client';
import SocketIOFileClient from 'socket.io-file-client';

// files
import { livecode, semantics }  from '/html/ohm/semantic';
import { renderHtml, renderHtmlArrows, renderHtmlHelpMenu }  from  '/html/renderHTML';
import { parseInput }  from '/parse-commands';
import { help }  from '/text/helpText';
import { setDataURL, handlePresetsInTone } from '/tone/main-tone';
import { printer } from '/helper/printer';


// global variables
export const debugSemantic = true;
export let debugIndex = true;
let debug = true;
let context = "index";















// server connect:
export var socket = io.connect();
// let holder = setInterval(socketTimer, 1000);
// function socketTimer() {
//   socket.emit('status');
// } 



// ==========================================
// arrays to store page console etc. output
let consoleArray = [];
// let partsArray = [''];
let consolePointer = 0;
let consoleLength = 20;
// vars for Server files/ samples
let folders = [];
let samples = {};

// SOCKET.IO communication
let user = 'local';
let activeSession = false;
// let	externalUser = 'client';
let	allUsers = [];
let currentSession = 'online';	
	



// alert sounds - not recorded in MediaRecorder (different audio context)
// ==========================================
let alerts = {
	return: 		{name: 'return', 		file: 'a01', alert: null},
	enter_input: 	{name: 'enter_input', 	file: 'a06', alert: null}, 
	leave_input: 	{name: 'leave_input', 	file: 'a12', alert: null}, 
	error: 			{name: 'error', 		file: 'a04', alert: null}, 
	stop_recording: {name: 'stop_recording',file: 'a11', alert: null}, 
	join: 			{name: 'join', 			file: 'a11', alert: null}, 
	bottom: 		{name: 'bottom', 		file: 'a08', alert: null}, 
	mute: 			{name: 'mute', 			file: 'a09', alert: null}, 
};


function createAlerts(alerts) {
	Object.keys(alerts).forEach((name) => {
		// console.log(alerts[name].name);
		let alert; 
		let sound = alerts[name].file;
		let src = (`../alert/${sound}.mp3`);
		alerts[name].alert = document.createElement('audio');
		alert = alerts[name].alert;
		alert.style.display = "none";
		alert.src = src;
		alert.load(); //call this to just preload the audio without playing
	});
};
createAlerts(alerts);
let alertState = false;
function playAlerts(name, alertState) {
	if (alertState) {alerts[name].alert.play();};
};






// sound controls: muting sound / alerts

let checkMuteSound = document.getElementById("checkMuteSound");
let checkMuteAlerts = document.getElementById("checkMuteAlerts");
document.getElementById("checkMuteAlerts").checked = true;

checkMuteSound.onclick = function () {
	if (checkMuteSound.checked) {
		let val = 'mute on';
		organizeInput({string: val, user: user}); 
	} else {
		let val = 'mute off';
		organizeInput({string: val, user: user}); 
	};
};
checkMuteAlerts.onclick = function () {
	if (checkMuteAlerts.checked) {
		playAlerts('return', alertState);
		alertState = false;
	} else {
		alertState = true;
		playAlerts('return', alertState);
	};
};


// let muteSound = document.getElementById("muteSound");
// muteSound.innerHTML = 'Mute Sound';
// let muteAlert = document.getElementById("muteAlert");
// muteAlert.innerHTML = 'Mute Alerts [OFF]';

// muteSound.onclick = function () {
// 	if (muteSound.innerHTML === "Mute Sound") {
// 		muteSound.innerHTML = "Mute Sound [OFF]";
// 		let val = 'mute on';
// 		organizeInput({string: val, user: user}); 
// 	} else {
// 		muteSound.innerHTML = "Mute Sound";
// 		let val = 'mute off';
// 		organizeInput({string: val, user: user}); 
// 	};
// };

// muteAlert.onclick = function () {
// 	if (muteAlert.innerHTML === "Mute Alerts") {
// 		muteAlert.innerHTML = "Mute Alerts [OFF]";
// 		playAlerts('return', alertState);
// 		alertState = false;
// 	} else {
// 		muteAlert.innerHTML = "Mute Alerts";
// 		alertState = true;
// 		playAlerts('return', alertState);
// 	};
// };





// ==========================================
window.onload = () => {
  setTimeout(function(){
  	playAlerts('enter_input', alertState);
  }, 500);
}; 



















// ==========================================
// UPLOAD FILES TO SERVER
var uploader = new SocketIOFileClient(socket);
var form = document.getElementById('form');
var uploadDest = 'default';

uploader.on('ready', function() {
	// console.log('SocketIOFile ready to go!');
});
uploader.on('loadstart', function() {
	console.log('Loading file to browser before sending...');
});
uploader.on('progress', function(progress) {
	console.log('Loaded ' + progress.loaded + ' / ' + progress.total);
});
uploader.on('start', function(fileInfo) {
	console.log('Start uploading', fileInfo);
});
uploader.on('stream', function(fileInfo) {
	console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
});
uploader.on('complete', function(fileInfo) {
	console.log('Upload Complete', fileInfo);
	renderTextToConsole (true, 'local', ("upload complete"), 'local');	
	playAlerts('return', alertState);
});
uploader.on('error', function(err) {
	console.log('Error!', err);
});
uploader.on('abort', function(fileInfo) {
	console.log('Aborted: ', fileInfo);
});
form.onsubmit = function(ev) {
    ev.preventDefault();
    var fileEl = document.getElementById('file');
    console.log('');
    console.log('upload file: ' + fileEl.files[0].name)
    console.log('file size = ' + fileEl.files[0].size/1000 + ' KB');

    let fileSize = fileEl.files[0].size;
    if (fileSize > 200000) { 
    	showFiles ('File too big for uploading.. ! max. 100KB. ') 
    	renderTextToConsole (true, 'local', ("File too big for uploading.. ! max. 100KB. "), 'local');	
    	playAlerts('error', alertState);
    } else {
    	socket.emit('uploadDest', uploadDest);
    	var uploadIds = uploader.upload(fileEl.files, {});
    	renderTextToConsole (true, 'local', ("start upload.."), 'local');
    	playAlerts('return', alertState);	
    };
};


function handleForm (name) {
	// reset upload destination
	if (name == '') {uploadDest = 'user';}
	if (name != '') {uploadDest = name;}

	// handle form:
	var form = document.getElementById('form');
	var formInput = document.getElementById('file');
	var uploader = document.getElementById('uploader');
	formInput.type = 'file';
	formInput.accept = ".mp3, .Mp3, .MP3";
	
	formInput.onchange = e => { 
		uploader.click();
	};
	formInput.click();
};






















// ==========================================
// USER input from textarea INPUT field
document.getElementById("textarea").onkeydown = (e) => {
 	// text input with ENTER
 	
	if (e.keyCode==13) {
		if (debugIndex) {console.log(' ' )};
		consolePointer = 0;
		let val = document.getElementById("textarea").value;
		val = val.toLowerCase();
		document.getElementById("textarea").value = "";
		console.log(`("textarea").onkeydown: user "${user}", value: "${val}"`);
		if (user != 'guest') {
			organizeInput({string: val, user: user}); 
		};
		playAlerts('return', alertState);

	};
	// using arrows
	if (e.keyCode==38){
		consolePointer = renderHtmlArrows(consolePointer, consoleArray, 'up', "textarea");
		playAlerts('return', alertState);
	};
	if (e.keyCode==40){
		consolePointer = renderHtmlArrows(consolePointer, consoleArray, 'down', "textarea");
		playAlerts('return', alertState);
	};
};


document.getElementById("textarea").onfocus = (e) => {
	playAlerts('enter_input', alertState);
};
document.getElementById("textarea").onblur = (e) => {
	playAlerts('leave_input', alertState);
};



// generating empty containers for links at help examples
function linkPrint (content) {
	// console.log('hello link, content: ' + content);
	document.getElementById("textarea").value = content;
	document.getElementById("textarea").dispatchEvent(new KeyboardEvent('keydown',{'keyCode': 13}));
};

// document.getElementsByTagName('a').onclick = function () {console.log('Link: ' + document.getElementsByTagName('a').innerHTML)};
document.getElementsByTagName('a').onclick = function () { if (debugIndex) { console.log('Index: Link: ') } };


























// ==========================================
// organize input & distribute
function organizeInput (data) {
	let thisUser = data.user;
	let thisString = data.string;
	let message;
	if (data.user == user || data.user == 'local') {
		socket.emit('clientEvent', data);
	};

	// if user is NOT logged in
	if (thisUser == 'local') {
		// interpret data
		message = interpretInput (thisString); // returns {state: state, string: data, result: result};	
		// console.log('local User: ' + data.user + ' - message: ' + message.result);	
		// parse data
		if (message.state == 'succeeded') {
			parseInput(message.result);
			renderTextToConsole (true, thisUser, message.string, 'local');	
		};
		if (message.state == 'failed') {
			renderTextToConsole (false, thisUser, message.string, 'local');	
			playAlerts('error', alertState);
		};
	};

	// if logged in & message from some any user
	if (activeSession == true) {
		if (thisUser != 'local') {
		// if message from local user 
			if (thisUser == user) {
				// interpret data
				message = interpretInput (thisString); // returns {state: state, string: data, result: result};	
				// console.log('');
				console.log('organizeInput: Logged in User: ' + thisUser + ' - message: ' + message.result);	
				// parse data
				if (message.state == 'succeeded') {
					parseInput(message.result);
					
					// IO communication:
					// send, if message is not meant for local only
					if (message.result[0] != 'helper') {
						renderTextToConsole (true, thisUser, message.string);	
						message.user = thisUser;
						sendMessage(message);
					};
					// don't send, if message is meant for local only
					if (message.result[0] == 'helper') {
						renderTextToConsole (true, thisUser, message.string, 'local');	
					};
				};
				if (message.state == 'failed') {
					renderTextToConsole (false, thisUser, message.string, 'local');	
					playAlerts('error', alertState);
				};
			};
			// if message from other users
			if (thisUser != user) {
				// interpret data - it is already valid
				message = interpretInput (thisString); // returns {state: state, string: data, result: result};	
				// console.log('');
				// console.log('Logged in User: ' + thisUser + ' - message: ' + message.result);	
				parseInput(message.result);
				renderTextToConsole (true, thisUser, message.string, 'notlocal');	
				if (user != 'master') {
					playAlerts('return', alertState);
				};
			};		
		};
	};
	
};















// handle html/ socket input
function interpretInput (data) {
	let state;
	let result;
	// check & interpret text input
	// if there is data:
	if (data !='') {
		// if input is not valid:
		if (livecode.match(data).failed() ) {
            state = 'failed';
        };
        // if input is valid
        if (livecode.match(data).succeeded() ) {
        	// evaluate input through semantics
            result = semantics(livecode.match(data)).eval();
            state = 'succeeded';
        };
	};
	return {state: state, string: data, result: result};
};

function renderTextToConsole (state, user, string, local) {
	if (local == 'local') {
		if (state == true) {
			consoleArray.push({message:string});
	    	renderHtml(consoleArray, 'console',consoleLength);
		};
		if (state == false) {
			if (string[0] != '!') { consoleArray.push({message: `! ${string}`}); } 
			else { consoleArray.push({message: `${string}`}); };
		};	
	};
	if (local != 'local') {
		consoleArray.push({user:user, message:string});
	    renderHtml(consoleArray, 'console',consoleLength);
	};
	renderHtml(consoleArray, 'console',consoleLength);
};


























// ====================================================================================
// SOCKET.IO communication
// ====================================================================================
// SOCKET USERS
function setUser(name, session) {
   	if (user == 'local') { 
   		console.log(`setUser: emit new User: "${name}" to server. Session: ${session}`);
   		socket.emit('setUser', name, session); // wait form confirmation
   		socket.emit("addUserToSocket", name, session);
   	} else { 
   		// console.log('already joined as ' + name);
   		console.log(`setUser: you already joined a session..`);
   		consoleArray.push({message:"You joined already as " + user});
		renderHtml(consoleArray, 'console',consoleLength);
		playAlerts('error', alertState);
   	};
};

socket.on('confirmUserToClient', function(message) {
	if (message.session==undefined) {message.session = currentSession};
	console.log(`confirmUserToClient: username: "${message.username}", session: "${message.session}"`);
    user = message.username;
    currentSession = message.session;
    user = user.split('_')[0];
    // console.log('user name split join: ' + user);
    if (user != 'guest'){
    	// special session
    	if (currentSession!=undefined){
    		document.getElementById('group').innerHTML = 'group: ' + currentSession;	
    		document.getElementById('localUser').innerHTML = user;	
    	} else {
    		document.getElementById('localUser').innerHTML = user;	
    	};
   		playAlerts('join', alertState);	
    };
    activeSession = true;
});

socket.on('updateUsers', function(message) {
	if (debugIndex) { console.log(`updateUsers: users "${message.users}" joined the session: "${message.session}"`) } ;
   	if (message.session == currentSession){
   		allUsers = message.users;
   	}

   	// remove guest entries from display:
   	for (let i=0; i<allUsers.length ; i++){
   		let user = allUsers[i].split('_')[0];
		if ( user == 'guest'){
			if (debugIndex) { console.log('Index: guest detected.. delete from display..') } ;
		    // allUsers.splice(i, 1);
			allUsers[i] = '';
		};
	};
	if (debugIndex) { console.log('Index: see update allUsers: ' + allUsers) };
	

	let allUsersString = allUsers.join();
	allUsersString = allUsersString.split(',').join(' ');

	// if logged in, then display all users
	if (user != 'local') {
		// document.getElementById('localUser').innerHTML = currentSession + ':  &nbsp;&nbsp;' + user + '&nbsp;&nbsp; [ ' + allUsersString + ' ]';
		document.getElementById('localUser').innerHTML = user + ' ----> all members: ' + allUsersString;	
		playAlerts('join', alertState);	
	};
});




















// ==========================================
// SOCKET MESSAGES
function sendMessage(message) {
	socket.emit('msg', message);
};
socket.on('msgToAll', function(data) {
	if (debugIndex) { console.log(`msgToAll: from user "${data.user}": "${data.string}". listed users: "${allUsers}"`) } ;
	
	// execute only if message from other user
	if (data.user != user) {
		// execute only, if user is listed in allUsers of current session:
		for (let i=0; i<allUsers.length; i++) {
			if (data.user == allUsers[i]) {
				organizeInput ({user: data.user, string: data.string});		
			}
		}
		
	};
});












// REQUEST & RECEIVE FILENAMES
function showFiles (string) {
	if (debugIndex) { console.log(`Index: socket send "readFiles", "${string}".. `)}; 
	socket.emit('readFiles', string); 
	// if (string == 'files') { socket.emit('readFiles', 'files'); playAlerts('join', alertState)}
	// else if (string == 'folders') { socket.emit('readFiles', 'folders'); playAlerts('join', alertState)}
};

socket.on("files", function(serverFolder, serverSamples, what) {
	folders = serverFolder;
	samples = serverSamples;
	let check = false;
	let serverData = samples;
	if (debugIndex) { console.log("Socket.io/Index: received data on > " + what + ": ", serverSamples, serverFolder) };

	if (what == 'store') {
		if (debugIndex) { console.log('Socket.io/Index: "store" - received server sample database. Sending to client Tone.js.. ') };
		setDataURL(serverData);
		check = true;
	};

	let printData;
	if (what == 'all') {
		if (debugIndex) { console.log('Socket.io/Index: "files" - reading incoming files & print them on console ..') };
		for (let i=0; i<folders.length; i++) {
			let data = samples[folders[i]];
			let files = [];
			
			for (let j=0; j<data.files.length; j++) {
				let temp = data.files[j].replace(".mp3", "");
				files.push( ' [' + j + '] ' + temp  + '&nbsp;&nbsp;');
			};
			
			files = files.join();
			files = files.split(',').join(' ');
			printData = data.folderName + '[' + data.count + '] ' +  '--> &nbsp;&nbsp; ' + files;
			renderTextToConsole (true, user, printData, 'local');
		};	
		check = true;	
	};


	if (what == 'folders') {
		if (debugIndex) { console.log('Socket.io/Index: "folders" - reading incoming folders & print them on console ..') };
		let folderString = [];
		for (let i=0; i<folders.length; i++) {
			let data = samples[folders[i]];
			folderString.push(data.folderName + ' [' + data.count + ']' + '&nbsp;&nbsp;');
		};		
		folderString = folderString.join();
		folderString = folderString.split(',').join(' ');
		printData = folderString;
		renderTextToConsole (true, user, printData, 'local');
		check = true;
	};

	for (let i=0; i<folders.length; i++) {
		if (what == samples[folders[i]].folderName) {
			if (debugIndex) { console.log(`Socket.io/Index: "${what}" - reading incoming "${what}" & print them on console ..`) };

			let data = samples[folders[i]];
			let files = [];
			
			for (let j=0; j<data.files.length; j++) {
				let temp = data.files[j].replace(".mp3", "");
				files.push( ' [' + j + '] ' + temp  + '&nbsp;&nbsp;');
			};
			
			files = files.join();
			files = files.split(',').join(' ');
			printData = data.folderName + '[' + data.count + '] ' +  '--> &nbsp;&nbsp; ' + files;
			renderTextToConsole (true, user, printData, 'local');

			check = true;
		};
		
	};	
	if (!check) {
    	let printData = 'no such file';
		renderTextToConsole (false, 'local', printData, 'local');
		playAlerts('error', alertState);
    } else {
    	playAlerts('join', alertState);
    };
});











// 
function recorderDeal (state, audioSrc) {
	if (state == 'started') {
		document.getElementById('buttonPlay').style="display: none;";
		document.getElementById('buttonPause').style="display: none;";

		document.getElementById('audioDiv').style="display: none;";
		document.getElementById('recordStatus').style="display: inline-block;";
		document.getElementById('recordStatus').innerHTML = '.. recording';
	};
	if (state == 'stopped') {
		document.getElementById('buttonPlay').style="display: inline-block;";
		document.getElementById('buttonPause').style="display: inline-block;";
		document.getElementById('buttonPlay').onclick = function () {document.getElementById('audioPlayer').play(); };
		document.getElementById('buttonPause').onclick = function () {document.getElementById('audioPlayer').pause(); };
	  	
	  	var audio = document.getElementById('audioPlayer');
	  	var audioDiv = document.getElementById('audioDiv');
	  	audio.src = audioSrc;
	  	// audio.style="display: inline-block;  height: 20px; width: 240px; outline: none;";
	  	// audioDiv.style="display: inline-block;";
	  	

	  	audio.load(); //call this to just preload the audio without playing
	  	// audio.play(); //call this to play the song right away
		
		document.getElementById('recordStatus').style="display: inline-block;";
		let d = new Date();
		let arr = [d.getFullYear(), d.getMonth()+1, d.getDate(), '-', d.getHours(), d.getMinutes()];
		arr = arr.join('');
		// let audioFileName = 'Welle-' + arr + '.ogg';
		let audioFileName = 'Welle.ogg';
		document.getElementById('recordStatus').innerHTML = '<a href=\"' + audioSrc + '\" download="' + audioFileName + '" style="text-decoration: none;">download ' + audioFileName + '</a>';
	};
};








function presetHandling(presetName, action) {
	let savedParts = handlePresetsInTone('get');
	let savedPartsNames = [];
	Object.keys(savedParts).forEach((part) => {
        savedPartsNames.push(savedParts[part].name);
    });

	if (action == 'store') {
		if (debugIndex) { console.log(`Index: ${action} preset "${presetName} on server, including ${savedPartsNames}`) };
		socket.emit('storePreset', presetName, savedPartsNames, savedParts);
	};
	if (action == 'reload') {
		if (debugIndex) { console.log(`Index: ${action} preset "${presetName} from server`) };
		socket.emit('reloadPreset', presetName);
	}
};


socket.on('reloadPreset', function(presetName, data) {
	let stringData = JSON.stringify(data, null, 2);
	if (debugIndex) { console.log(`Socket.io/Index: receive preset "${presetName}" data: ${stringData}`) };
	handlePresetsInTone('set', data)
});






// ==========================================
// display & commands
renderHtmlHelpMenu(help.overview,'help-overview', 100, true);
// renderHtmlHelp(help['examples'],'help-container', 100, true);



export { 
	setUser, 
	showFiles, 
	recorderDeal, 
	handleForm, 
	renderTextToConsole, 
	playAlerts, 
	alertState, 
	presetHandling
}




