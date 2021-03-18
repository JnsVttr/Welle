import { printer } from '/helper/printer';
import { debug, context } from '/index';

// incoming data collection via socket.io, copied to 'soundDataURLs{}'
export function extractSamplePaths(data) {
	printer(debug, context, "extractSamplePaths", `URLs paths from ${data}`);
	let _sampleURL = { default: ['../'] };
	// setting a default sample;
	// sampleDefault = (soundDataURLs.default.shortURL + soundDataURLs.default.files[1]);
	// console.log('sampleDefault = files[0]: ' + sampleDefault);
	// generate URL data to local container
	Object.keys(data).forEach((folder) => {
		let count = data[folder].count; // count = how many elements a folder contains
		_sampleURL[folder] = [];
		printer(debug, context, "extractPaths", `
		count: ${count}, 
		folder: ${folder}, 
		sampleURL[folder]: ${_sampleURL[folder]}`);
		for (let i = 0; i < count; i++) {
			let newURL = data[folder].shortURL + data[folder].files[i];
			printer(debug, context, "extractPaths", `newURL at sampleURL.${folder}[${i}] = ${newURL}`);
			_sampleURL[folder].push(newURL);
		};
	});
	return _sampleURL;
}
;
