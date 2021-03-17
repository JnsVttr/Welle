const path = require('path');
const fs = require('fs');

function presetHandling(action, url, presetName, data) {
	console.log("");
	console.log("PRESETS HANDLING:");
	// e.g. presetHandling('store', presetsURL, presetName, savedParts);
	let presetFile = false;
	let defaultFileName = "default.txt";
	let defaultFilePath = path.join(url, defaultFileName);
	let newFileName = '';
	let newFilePath = '';
	let exsitingFileName = '';
	let exsitingFilePath = '';
	let stringData = '';
	let files = [];

	files = fs.readdirSync(url, function (err) {
		//handling error
		if (err) {
			return console.log('presetHandling: Unable to scan directory: ' + err);
		};
	});


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

	if (presetFile == true) {
		console.log(`--> preset file there`);
	} else {
		// console.log(`--> no preset file availible`); 
	};

	exsitingFileName = presetName + '.txt';
	exsitingFilePath = path.join(url, exsitingFileName);

	newFileName = presetName + '.txt';
	newFilePath = path.join(url, newFileName);


	// if cmd store:
	// if empty, create preset
	// if existing, overwrite preset
	if (action == 'store') {
		stringData = JSON.stringify(data, null, 2);
		// console.log(`presetHandling: Data = ${JSON.stringify(data, null, 2)}`);
		if (presetFile == true) {
			// if there,  append file
			console.log(`presetHandling: File there! Concurrent file name: ${exsitingFileName}`);
			fs.writeFile(exsitingFilePath, stringData, function (err) {
				if (err)
					throw err;
				console.log(`presetHandling: file replaced ..`);
			});
		} else {
			// if create not there create file
			console.log(`File not there! create new file..`);
			fs.writeFile(newFilePath, stringData, function (err, file) {
				if (err)
					throw err;
				console.log(`presetHandling: new file saved!`);
			});
		};
	};


	// if cmd reload
	// if preset exisiting, return data
	// if not there return null
	if (action == 'reload') {
		if (presetFile) {
			// if there,  reload file
			console.log(`presetHandling: File there: ${exsitingFileName}`);
			// stringData = JSON.stringify(data, null, 2);
			// console.log(`presetHandling: Data = ${JSON.stringify(data, null, 2)}`);
			let fileContent = "";
			fileContent = fs.readFileSync(exsitingFilePath, stringData, function (err, data) {
				if (err)
					throw err;
			});
			stringData = JSON.parse(fileContent);
			return [presetName, stringData];
		} else {
			// if create not there, return null
			console.log(`presetHandling: No preset-file there - serving default.txt`);
			// get default preset
			let fileContent = "";
			fileContent = fs.readFileSync(defaultFilePath, stringData, function (err, data) {
				if (err)
					throw err;
			});
			stringData = JSON.parse(fileContent);
			return ["default", stringData];
		};
	};

}
exports.presetHandling = presetHandling;
;
