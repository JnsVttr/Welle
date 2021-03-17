function encryptName(value) {
	var result = "";
	for (i = 0; i < value.length; i++) {
		if (i < value.length - 1) {
			result += value.charCodeAt(i) + 10;
			result += "-";
		} else {
			result += value.charCodeAt(i) + 10;
		};
	};
	return result;
}
exports.encryptName = encryptName;
;
