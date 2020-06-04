//	Imports ____________________________________________________________________

import { Plural } from '../../../types';

const floor = Math.floor;
const log = Math.log;
const pow = Math.pow;

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

//	Functions __________________________________________________________________

