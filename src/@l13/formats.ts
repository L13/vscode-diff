//	Imports ____________________________________________________________________

import type { Plural } from '../types';

import { pluralBytes } from './units/files';

const { floor, log, pow } = Math;

//	Variables __________________________________________________________________

const byteUnits = [pluralBytes.size, 'KB', 'MB', 'GB', 'TB', 'PB'];
const KB = 1024;
const logKB = log(KB);

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function formatAmount (value: number, units: Plural) {
	
	return `${value} ${units[value] || units.size}`;
	
}

export function formatFileSize (size: number) {
	
	const bytes = formatAmount(size, pluralBytes);
	
	if (size < KB) return bytes;
	
	let i = floor(log(size) / logKB);
	
	if (!byteUnits[i]) i = byteUnits.length - 1;
	
	return `${parseFloat((size / pow(KB, i)).toFixed(2))} ${byteUnits[i]} (${bytes})`;
	
}

export function formatDate (date: Date) {
	
	// eslint-disable-next-line max-len
	return `${date.getFullYear()}-${formatDigit(date.getMonth() + 1)}-${formatDigit(date.getDate())} ${date.getHours()}:${formatDigit(date.getMinutes())}:${formatDigit(date.getSeconds())}`;
	
}

export function formatList (values: string[]) {
	
	const length = values.length;
	
	return length > 2 ? `${values.slice(0, -1).join(', ')} and ${values[length - 1]}` : values.join(' and ');
	
}

//	Functions __________________________________________________________________

function formatDigit (digit: number) {
	
	return `${digit}`.padStart(2, '0');
	
}