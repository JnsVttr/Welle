// render parts to HTML

export function renderParts(_parts) {
	let divID = 'parts';

    let html = ''
	// iterate through parts collection
	Object.keys(_parts).forEach(part => {
		html+= `
		<input type="button" class="w3-button w3-round-large w3-border w3-black w3-medium" value="${part}"></input>   
		`;
		
	});

	document.getElementById(divID).innerHTML = '';
	document.getElementById(divID).innerHTML += html;


}
;
