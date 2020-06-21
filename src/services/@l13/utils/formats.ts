//	Imports ____________________________________________________________________

import { normalize, sep } from 'path';

import { Plural } from '../../../types';

const { floor, log, pow } = Math;

//	Variables __________________________________________________________________

const pluralBytes:Plural = { size: 'Bytes', 1: 'Byte' };

const byteUnits = [pluralBytes.size, 'KB', 'MB', 'GB', 'TB', 'PB'];
const KB:number = 1024;
const logKB:number = log(KB);

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function formatAmount (value:number, units:Plural) {
	
	return `${value} ${units[value] || units.size}`;
	
}

export function formatFileSize (size:number) {
	
	const bytes = formatAmount(size, pluralBytes);
	
	if (size < KB) return bytes;
	
	let i = floor(log(size) / logKB);
	
	if (!byteUnits[i]) i = byteUnits.length - 1;
	
	return `${parseFloat((size / pow(KB, i)).toFixed(2))} ${byteUnits[i]} (${bytes})`;
	
}



export function formatNameAndDesc (pathA:string, pathB:string) :[string, string] {
	
	const namesA:string[] = normalize(pathA).split(sep);
	const namesB:string[] = normalize(pathB).split(sep);
	const desc:string[] = [];
	
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
	
	return [`${namesA.join(sep)} ↔ ${namesB.join(sep)}`, desc.join(sep)];
	
}

//	Functions __________________________________________________________________

