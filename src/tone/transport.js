
import { printer } from '/helper/printer';

import { debug, context, playInstrument, stopInstrument, stopAllInstruments, playAllInstruments, copyPattern, setVolume, setRandom, setBPM, savePart, setPart, deleteElement, clearParts, resetAction, muteAll, device, audioRecord, uploadToServer, initInstrument } from './main-tone';
import { checkIfInstValid } from './checkIfInstValid';

// translate incoming messages (parseInput) to sound functions:
export function transport (cmd, instName, instArray, patternIn, rand, vol, bpm, name, num) {	
	
	// if (debugTone) {console.log('Tone: transport: INCOMING transport (' , cmd , instName , instArray , patternIn , rand , vol , bpm , name , num , ')' );};
	printer(debug, context, "transport", 'INCOMING transport (' , cmd , instName , instArray , patternIn , rand , vol , bpm , name , num , ')' );

	let state;  // instrument valid state
	
	
	switch (cmd) {
		case 'play':
			state = checkIfInstValid (instName);
			if (state) {playInstrument (instName, patternIn, rand)};
		break;
		case 'stop':
			state = checkIfInstValid (instName);
			if (state) {stopInstrument (instName);};
		break;
		case 'stopAll':
			stopAllInstruments();
		break;
		case 'playAll':
			playAllInstruments ();
		break;
		case 'patternCopy':
			state = checkIfInstValid (instName);
			if (state) {copyPattern (instName, instArray)};
		break;
		case 'setVolume':
			state = checkIfInstValid (instName);
			if (state) {setVolume(instName, vol)};
		break;
		case 'setRandom':
			state = checkIfInstValid (instName);	
			if (state) {setRandom(instName, rand)}
		break;
		case 'setBPM':
			setBPM(bpm, num)
		break;
		case 'savePart':
			savePart(name);
		break;
		case 'setPart':
			setPart(name);
		break;
		case 'deleteElement':
			deleteElement(instArray);
		break;
		case 'clearPart':
			clearParts();
		break;
		case 'reset':
			resetAction();
		break;
		case 'muteOn':
			muteAll(true);
		break;
		case 'muteOff':
			muteAll(false);
		break;
		case 'recordStart':
			if (device != 'ios') {audioRecord(true)};
		break;
		case 'recordStop':
			if (device != 'ios') {audioRecord(false)};
		break;
		case 'uploadFiles':
			uploadToServer(instName);
		break;
		case 'initInst':
			state = checkIfInstValid (instName);
			if (state) {initInstrument(instName, name, num);}
		break;
	}
};
