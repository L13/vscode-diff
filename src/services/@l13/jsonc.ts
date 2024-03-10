//	Imports ____________________________________________________________________

const _parse = JSON.parse;

//	Variables __________________________________________________________________

const findComments = /"(?:[^"\r\n\\]*(?:\\.)*)*"|(\/\*(?:.|[\r\n])*?\*\/|\/\/[^\r\n]*)/g;
const findTrailingCommas = /,[\s\r\n]*?([\]}])/g;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function parse (jsonc: string, ...args: any[]) {
	
	const json = jsonc
		.replace(findComments, (match, comment) => comment ? '' : match)
		.replace(findTrailingCommas, (match, close) => close);
	
	return _parse(json, ...args);
	
}

//	Functions __________________________________________________________________

