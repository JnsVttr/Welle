const path = require('path');
const fs = require('fs');
const { encryptName } = require("./encryptName");

function updateHistory(url, user, id, string, date) {
	// function to create or update the history logs
	let encryptedUser = encryptName(user);
	let historyFile = false;
	let historyFileID = '';
	let newFileName = '';
	let newFilePath = '';
	let exsitingFileName = '';
	let exsitingFilePath = '';
	let files = [];

	files = fs.readdirSync(url, function (err) {
		//handling error
		if (err) {
			return console.log('Unable to scan directory: ' + err);
		};
	});


	if (user == 'local') {
		files.forEach(function (file) {
			let ext = path.parse(file).ext;
			file = path.parse(file).name; // remove etx  
			let fileID = file.substring(file.indexOf('_') + 1);
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
		files.forEach(function (file) {
			let ext = path.parse(file).ext;
			file = path.parse(file).name; // without extension  
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




	if (historyFileID != '') {
		// if there,  append file
		// console.log(`File there! Concurrent file ID: ${id}`);
		fs.appendFile(exsitingFilePath, (string + '\r\n'), function (err) {
			if (err)
				throw err;
			// console.log(`updateHistory: file updated..`);
		});
	} else {
		// if create not there create file
		// console.log(`File not there! create new file..`);
		fs.writeFile(newFilePath, (date + '\r\n \r\n' + string + '\r\n'), function (err) {
			if (err)
				throw err;
			// console.log(`updateHistory: new file saved!`);
		});
	};

}
exports.updateHistory = updateHistory;
