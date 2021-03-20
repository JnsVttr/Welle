
export function checkIfInstValid(_instName, _instrumentsList) {
	// check, if instrument is valid
	let instAvailible = false;

	Object.keys(_instrumentsList).forEach((_instName) => {
		if (_instName == _instrumentsList[_instName].name) {
			instAvailible = true;
		};
	});
	if (instAvailible) return false
	else return true
		
}
;
