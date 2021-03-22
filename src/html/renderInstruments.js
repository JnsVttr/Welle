
// render instruments to HTML
export function renderInstruments(_instruments) {
	let divID = 'instruments'

	// collect all initialized instruments
	let instrumentNames = [];
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
		// push the names to internal list
		instrumentNames.push(newInstName);
	});

    var html='<table><caption></caption><tr>' + '<td style="width:10%">' + divID + '</td>';
    var instCount = instrumentNames.length;
    // output text:
    for (let i=0; i<instCount; i++) {
        html+= '<td style="max-width:10%">' + instrumentNames[i] + '</td>';
    };
    html += '</tr></table>';
    document.getElementById(divID).innerHTML = '';
    document.getElementById(divID).innerHTML+= html;

}
;





