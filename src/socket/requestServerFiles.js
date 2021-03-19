import { socket } from '/index';
import { printer } from '/helper/printer';
import { debug, context } from '/index';

// manage server request & receive, e.g. Samples
export function requestServerFiles(string) {
	printer(debug, context, "requestServerFiles", "request sample paths from server...")
	socket.emit('requestServerFiles', string);
}
;