//	Imports ____________________________________________________________________

import { Plural } from '../../types';

//	Variables __________________________________________________________________

const pluralBytes:Plural = { size: 'Bytes', 1: 'Byte' };

const KB:number = 1024;
const MB:number = KB * KB;
const GB:number = KB * MB;
const TB:number = KB * GB;
const PB:number = KB * TB;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function formatAmount (value:number, measure:Plural) {

	return `${value} ${measure[value] || measure.size}`;

}

export function formatFileSize (size:number) {

	const bytes = formatAmount(size, pluralBytes);

	if (size > PB) return `${(size / PB).toFixed(2)} PB (${bytes})`;
	if (size > TB) return `${(size / TB).toFixed(2)} TB (${bytes})`;
	if (size > GB) return `${(size / GB).toFixed(2)} GB (${bytes})`;
	if (size > MB) return `${(size / MB).toFixed(2)} MB (${bytes})`;
	if (size > KB) return `${(size / KB).toFixed(2)} KB (${bytes})`;

	return bytes;

}

//	Functions __________________________________________________________________

