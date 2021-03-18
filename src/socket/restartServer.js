import { socket } from '/index';

export function restartServer() {
	socket.emit('restart');
}
;
