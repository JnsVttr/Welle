// render instruments to HTML
export function renderInstruments(_instruments) {
    // start empty html
    let html = "";
    let divID = "instruments";

    // iterate through instruments collection
    Object.keys(_instruments).forEach((inst) => {
        // console.log("_instruments).forEach(inst): ", _instruments[inst])
        // console.log(`details: name=${_instruments[inst].name()}, volume=${_instruments[inst].volume()}
        // rawPattern=${_instruments[inst].rawPattern()}, isPlaying=${_instruments[inst].isPlaying}
        // `)
        let name = _instruments[inst].name(),
            volume = _instruments[inst].volume(),
            pattern = _instruments[inst].rawPattern(),
            length = pattern.length + 10,
            isPlaying = _instruments[inst].isPlaying;

        // round volume
        volume = Math.round(volume * 10) / 10;

        // create HTML elements for appending
        html += "<p>";
        if (isPlaying) {
            html += `<input id="check_${name}" class="w3-check" type="checkbox" checked="true"><label> <b>${name}</b> </label>`;
        } else {
            html += `<input id="check_${name}" class="w3-check" type="checkbox"><label> <b>${name}</b> </label>`;
        }

        html += `
		vol: 
		<input id="vol_${name}" type="text" style="max-width: 3rem"  size="10" autocomplete=off value="${volume}">
		pattern: 
		<input id="pattern_${name}" type="text"  style="max-width: 55rem" size="${length}" autocomplete=off value="${pattern}">
		   
		</p>`;
    });
    // replace html content
    document.getElementById(divID).innerHTML = "";
    document.getElementById(divID).innerHTML += html;
}
