const path = require('path');
const fs = require('fs');

let readMediaFoldersFiles = (_audioPath, _folders) => {
	let _samples = {};

	// for every folder entry => check the contents
	for (let i = 0; i < _folders.length; i++) {
		// url for folder
		var fileUrl = path.join(_audioPath, _folders[i]);

		let folder = fileUrl.substring(fileUrl.lastIndexOf('/')).substring(1);
		let listOfFiles = [];
		let numFiles = 0;
		// data URL for the browser
		let shortURL = fileUrl.substring(fileUrl.indexOf("audio")) + '/';
		// var to store files from folders
		let files = [];

		// get files from each folder
		files = fs.readdirSync(fileUrl, function (err) {
			//handling error
			if (err)
				return console.log('Unable to scan directory: ' + err);
		});

		// add each file to list of files in folder
		files.forEach(function (file) {
			var ext = path.parse(file).ext;
			// if file is file
			if (ext != '') {
				listOfFiles.push(file);
				numFiles += 1;
			};
		});

		// check, if server is local or on tangible.uber.space
		if (path.join(__dirname) != '/var/www/virtual/tangible/html/server') {
			shortURL = 'http://localhost:3000/' + shortURL;
		};
		if (path.join(__dirname) == '/var/www/virtual/tangible/html/server') {
			shortURL = ('https://tangible.uber.space/' + shortURL);
			// console.log('shortURL: ' + shortURL);
		};

		// saving samples as Objects
		_samples[folder] = { folderName: folder, url: fileUrl, shortURL: shortURL, files: listOfFiles, count: numFiles };

		// console.log('shortURL: ' + shortURL);
		// console.log('shortURL: ' + String(shortURL));
		// printFiles(samples, String(folder) );
	};
	return _samples;
};

exports.readMediaFoldersFiles = readMediaFoldersFiles;
