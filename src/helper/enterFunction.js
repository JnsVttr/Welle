
import { livecode, semantics } from '/html/ohm/semantic2021';

export let enterFunction = (_string) => {
    let result = null;
	// if input is not valid:
	if (livecode.match(_string).failed()) {
		return {valid: false, string: _string, result:null}
	};
	// if input is valid
	if (livecode.match(_string).succeeded()) {
		// evaluate input through semantics
		result = semantics(livecode.match(_string)).eval();
		// if result valid in grammar, return result
		return {valid: true,  string: _string, result: result}
	};
};



