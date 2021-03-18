export function createAlerts(alerts) {
	Object.keys(alerts).forEach((name) => {
		let alert;
		let sound = alerts[name].file;
		let src = (`../alert/${sound}.mp3`);
		alerts[name].alert = document.createElement('audio');
		alert = alerts[name].alert;
		alert.style.display = "none";
		alert.src = src;
		alert.load(); //call this to just preload the audio without playing
	});
}
;
