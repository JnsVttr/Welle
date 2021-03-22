// render parts to HTML

export function renderParts(_parts) {
	let divID = 'parts';

    console.log("renderParts parts: ", _parts)
    // collect all initialized parts
	let partNames = [];
	// iterate through parts collection
	Object.keys(_parts).forEach(part => {
		// push the names to internal list
		partNames.push(part);
	});

	var html = '<table><caption></caption><tr>' + '<td style="width:10%">' + divID + '</td>';
	var count = partNames.length;
	// output text:
	for (let i = 0; i < count; i++) {
		html += '<td style="max-width:10%">' + partNames[i] + '</td>';
	};
	html += '</tr></table>';
	document.getElementById(divID).innerHTML = '';
	document.getElementById(divID).innerHTML += html;

}
;
