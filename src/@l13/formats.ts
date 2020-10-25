//	Imports ____________________________________________________________________

import { normalize, sep } from 'path';

import { Plural } from '../@types/formats';
import { pluralBytes } from './units/files';

const { floor, log, pow } = Math;

//	Variables __________________________________________________________________

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

//	Functions __________________________________________________________________

