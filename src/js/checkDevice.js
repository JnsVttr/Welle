
function checkDevice() {
	let device = 'else';
	var isMacLike = /(Mac)/i.test(navigator.platform);
	var isIOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);
	if (isIOS) { device = 'ios'; };
	if (isMacLike) { device = 'mac'; };
	return device;
}

export { checkDevice };
