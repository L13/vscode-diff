//	Imports ____________________________________________________________________

const _parse = JSON.parse;

//	Variables __________________________________________________________________

const findComments = /"(?:[^"\r\n\\]*(?:\\.)*)*"|(\/\*(?:.|[\r\n])*?\*\/|\/\/[^\r\n]*)/g;
const findTrailingCommas = /"(?:[^"\r\n\\]*(?:\\.)*)*"|,\s*?([\]}])/g;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function parse (jsonc: string, reviver?: (this: any, key: string, value: any) => any) {
	
	const json = jsonc
		.replace(findComments, (match, comment) => comment ? '' : match)
		.replace(findTrailingCommas, (match, close) => close || match);
	
	return _parse(json, reviver);
	
}

//	Functions __________________________________________________________________

