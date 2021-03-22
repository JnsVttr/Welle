
// render instruments to HTML
export function renderInstruments(_instruments) {
	let divID = 'instruments'

	// collect all initialized instruments
	// let instrumentNames = [];
	
	// // iterate through instruments collection
	// Object.keys(_instruments).forEach(inst => {
	// 	let newInstName = '';
	// 	// if instrument playing, name is just like it is
	// 	if (_instruments[inst].isPlaying) {
	// 		newInstName = _instruments[inst].name;
	// 	};
	// 	// if instrument not playing, add an "X"
	// 	if (_instruments[inst].isPlaying == false) {
	// 		newInstName = `x_${_instruments[inst].name}`;
	// 	};
	// 	// push the names to internal list
	// 	instrumentNames.push(newInstName);
	// });

    
	// var html=`<table><caption></caption><tr> <td>${divID}: </td>`;
    // var instCount = instrumentNames.length;
    // // output text:
    // for (let i=0; i<instCount; i++) {
	// 	html+= `<td >${instrumentNames[i]}</td>`;
    // };
    // html += '</tr></table>';
	
    // document.getElementById(divID).innerHTML = '';
    // document.getElementById(divID).innerHTML+= html;



	// start empty html
	let html="";
	
	// iterate through instruments collection
	Object.keys(_instruments).forEach(inst => {
		let newInstName = '';
		// if instrument playing, name is just like it is
		if (_instruments[inst].isPlaying) {
			newInstName = _instruments[inst].name;
		};
		// if instrument not playing, add an "X"
		if (_instruments[inst].isPlaying == false) {
			newInstName = `x_${_instruments[inst].name}`;
		};
		// round volume
		let roundedVol = Math.round(_instruments[inst].vol * 10) / 10;
		// reverse pattern
		let pattern = _instruments[inst].pattern;
		for (let i=0; i<pattern.length; i++){
			if (pattern[i]==null) pattern[i] = '-';
			if (pattern[i]=='1') pattern[i] = '#'
			if (pattern[i]>1) pattern[i] = `#${pattern[i]}`
		}
		pattern = pattern.join(' ');
		// console.log("pattern", pattern);

		html+= `<p>
		<input type="button" class="w3-button w3-round-large w3-border w3-medium" value="${_instruments[inst].name}"></input>
		vol: <input class="w3-input" style="max-width:4rem; display: inline;" type="text" placeholder="${roundedVol}"></input>
		pattern: <input class="w3-input" style="max-width:52rem; display: inline;" type="text" placeholder="${pattern}">
		   
		</p>`;

	});
	
    
	
    document.getElementById(divID).innerHTML = '';
    document.getElementById(divID).innerHTML+= html;
	
}
;





