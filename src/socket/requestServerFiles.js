import { socket } from '/index';

// manage server request & receive, e.g. Samples
export function requestServerFiles(string) {
	socket.emit('requestServerFiles', string);
}
;
