const path = require('path');
const fs = require('fs');

// test for return arrow functions
/*
let varGlobal = {};
let testReturn = (_varGlobal) => {
	let tempVar = {model: 'ford'};
	_varGlobal = tempVar;
	return _varGlobal;
};
console.log('varGlobal before ' + varGlobal);
varGlobal = testReturn(varGlobal);
console.log('varGlobal after ' + varGlobal);
console.log('varGlobal after content: ' + varGlobal.model);
*/
/*
Return multiple variables:
function getValues() {
	return [getFirstValue(), getSecondValue()];
}
var values = getValues();
var first = values[0];
var second = values[1];

// fs.readdir async function:
function getDirectories(path, callback) {
	fs.readdir(path, function (err, content) {
		if (err) return callback(err)
		callback(null, content)
	})
}
getDirectories('./XML', function (err, content) {
	console.log(content)
})
 */
let readMediaFolders = (_audioPath) => {
	// var folders
	let _folders = [];
	let files = [];
	// check for each folder entry in the audioPath
	files = fs.readdirSync(_audioPath, function (err) {
		//handling error
		if (err)
			return console.log(err);
	});

	files.forEach(function (file) {
		var ext = path.parse(file).ext;
		// if file is folder
		if (ext == '' && file[0] != '.') {
			// console.log('is folder')
			_folders.push(file);
		};
	});
	// console.log('readMeadiaFolders: Sample-folders at data/audio: ');
	// console.log(_folders);	
	return _folders;
};
exports.readMediaFolders = readMediaFolders;
