
export function checkIfInstValid(_instName, _instrumentsList) {
	// check, if instrument is valid
	let instAvailible = false;
	
	Object.keys(_instrumentsList).forEach((entryName) => {
		// console.log("instName: ", _instName);
		// console.log("_instrumentsList[_instName]: ", _instrumentsList[_instName])
		if (_instrumentsList[entryName].name == _instName) {
			instAvailible = true;
			// console.log("instavailible: ", instAvailible)
		};
	});
	if (instAvailible) {return true}
	else { return false}
		
}
;
