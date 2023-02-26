//	Imports ____________________________________________________________________

import { basename, normalize, sep } from 'path';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function formatNameAndDesc (pathA: string, pathB: string): [string, string] {
	
	const namesA: string[] = normalize(pathA).split(sep);
	const namesB: string[] = normalize(pathB).split(sep);
	
	const desc: string[] = [];
	
//	Remove last entry if path has a slash/backslash at the end
	if (!namesA[namesA.length - 1]) namesA.pop();
	if (!namesB[namesB.length - 1]) namesB.pop();
	
	while (namesA.length > 1 && namesB.length > 1 && namesA[0] === namesB[0]) {
		desc.push(namesA.shift());
		namesB.shift();
	}
	
//	Fix for absolute and network paths if folders are part of the root
	if (desc.length && desc.join('') === '') {
		desc.forEach((value, index) => {
			
			namesA.splice(index, 0, value);
			namesB.splice(index, 0, value);
			
		});
		desc.splice(0, desc.length);
	}
	
	if (pathA === sep) namesA.push('');
	if (pathB === sep) namesB.push('');
	
	return [`${namesA.join(sep)} ↔ ${namesB.join(sep)}`, desc.join(sep)];
	
}

export function formatName (pathA: string, pathB: string) {
	
	return `${basename(pathA)} ↔ ${basename(pathB)}`;
	
}

//	Functions __________________________________________________________________

