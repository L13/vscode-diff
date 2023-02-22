//	Imports ____________________________________________________________________

import { Diff } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export const enum BOM {
	NONE = 0,
	UTF_8,
	UTF_16BE,
	UTF_16LE,
}

export const enum MODIFIED {
	NONE = 0,
	LEFT,
	RIGHT,
	BOTH,
}

export function detectUTFBOM (buffer: Buffer) {
	
	if (hasUTF16BEBOM(buffer)) return BOM.UTF_16BE;
	if (hasUTF16LEBOM(buffer)) return BOM.UTF_16LE;
	if (hasUTF8BOM(buffer)) return BOM.UTF_8;
	
	return BOM.NONE;
	
}

export function removeUTFBOM (buffer: Buffer, diff: Diff, modified: MODIFIED, bom?: BOM) {
	
	const currentBOM = bom || detectUTFBOM(buffer);
	
	if (currentBOM) {
		diff.ignoredBOM += modified;
		return buffer.subarray(currentBOM === BOM.UTF_8 ? 3 : 2);
	}
	return buffer;
	
}

export function normalizeLineEnding (buffer: Buffer, diff: Diff, modified: MODIFIED, bom?: BOM) {
	
	if (hasUTF16BEBOM(buffer) || bom === BOM.UTF_16BE) return normalizeUTF16BE(buffer, diff, modified);
	if (hasUTF16LEBOM(buffer) || bom === BOM.UTF_16LE) return normalizeUTF16LE(buffer, diff, modified);
	
	return normalizeAscii(buffer, diff, modified);
	
}

export function trimWhitespace (buffer: Buffer, diff: Diff, modified: MODIFIED, bom?: BOM): Buffer {
	
	if (hasUTF16BEBOM(buffer) || bom === BOM.UTF_16BE) return trimUTF16BE(buffer, diff, modified);
	if (hasUTF16LEBOM(buffer) || bom === BOM.UTF_16LE) return trimUTF16LE(buffer, diff, modified);
	
	return trimAscii(buffer, diff, modified);
	
}

//	Functions __________________________________________________________________

function hasUTF8BOM (buffer: Buffer) {
	
	return buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191;
	
}

function hasUTF16BEBOM (buffer: Buffer) {
	
	return buffer[0] === 254 && buffer[1] === 255;
	
}

function hasUTF16LEBOM (buffer: Buffer) {
	
	return buffer[0] === 255 && buffer[1] === 254;
	
}

function normalizeAscii (buffer: Buffer, diff: Diff, modified: MODIFIED) {
	
	const length = buffer.length;
	const cache = [];
	let ignoredEOL = false;
	let i = 0;
	
	while (i < length) {
		const value = buffer[i++];
		if (value === 13) {
			if (buffer[i] !== 10) cache.push(10);
			if (!ignoredEOL) ignoredEOL = true;
		} else cache.push(value);
	}
	
	if (ignoredEOL) {
		diff.ignoredEOL += modified;
		return Buffer.from(cache);
	}
	
	return buffer;
	
}

function normalizeUTF16BE (buffer: Buffer, diff: Diff, modified: MODIFIED) {
	
	const length = buffer.length;
	const cache = [];
	let ignoredEOL = false;
	let i = 0;
	
	while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueA === 0 && valueB === 13) {
			if (!(buffer[i] === 0 && buffer[i + 1] === 10)) cache.push(0, 10);
			if (!ignoredEOL) ignoredEOL = true;
		} else cache.push(valueA, valueB);
	}
	
	if (ignoredEOL) {
		diff.ignoredEOL += modified;
		return Buffer.from(cache);
	}
	
	return buffer;
	
}

function normalizeUTF16LE (buffer: Buffer, diff: Diff, modified: MODIFIED) {
	
	const length = buffer.length;
	const cache = [];
	let ignoredEOL = false;
	let i = 0;
	
	while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueA === 13 && valueB === 0) {
			if (!(buffer[i] === 10 && buffer[i + 1] === 0)) cache.push(10, 0);
			if (!ignoredEOL) ignoredEOL = true;
		} else cache.push(valueA, valueB);
	}
	
	if (ignoredEOL) {
		diff.ignoredEOL += modified;
		return Buffer.from(cache);
	}
	
	return buffer;
	
}

function trimAscii (buffer: Buffer, diff: Diff, modified: MODIFIED): Buffer {
	
	const length = buffer.length;
	const newBuffer = [];
	let cache = [];
	let ignoredWhitespace = false;
	let fixBOM = 0;
	let i = 0;
	
	if (hasUTF8BOM(buffer)) {
		newBuffer.push(239, 187, 191);
		i = fixBOM = 3;
	}
	
	stream: while (i < length) {
		const value = buffer[i++];
		if (value === 10 || value === 13 || i === length) {
			if (i === length && !(value === 10 || value === 13)) cache.push(value);
			let j = 0;
			let k = cache.length;
			start: while (j < k) {
				const cacheValue = cache[j];
				if (cacheValue === 9 || cacheValue === 32) {
					if (!ignoredWhitespace) ignoredWhitespace = true;
					j++;
					continue start;
				}
				break start;
			}
			if (k === j) {
				if (cache.length === length - fixBOM) { // Fixes VS Code single space and tab line bug
					const cacheLengthA = cache.length;
					for (let l = 0; l < cacheLengthA; l++) newBuffer.push(cache[l]);
				} else if (value === 10 || value === 13) newBuffer.push(value);
				cache = [];
				continue stream;
			}
			end: while (k > j) {
				const cacheValue = cache[k - 1];
				if (cacheValue === 9 || cacheValue === 32) {
					if (!ignoredWhitespace) ignoredWhitespace = true;
					k--;
					continue end;
				}
				break end;
			}
			cache = cache.slice(j, k);
			const cacheLengthB = cache.length;
			for (let m = 0; m < cacheLengthB; m++) newBuffer.push(cache[m]);
			if (value === 10 || value === 13) newBuffer.push(value);
			cache = [];
		} else cache.push(value);
	}
	
	if (ignoredWhitespace) {
		diff.ignoredWhitespace += modified;
		return Buffer.from(newBuffer);
	}
	
	return buffer;
	
}

function trimUTF16BE (buffer: Buffer, diff: Diff, modified: MODIFIED): Buffer {
	
	const hasBOM = hasUTF16BEBOM(buffer);
	const length = buffer.length;
	const newBuffer = hasBOM ? [buffer[0], buffer[1]] : [];
	let cache = [];
	let ignoredWhitespace = false;
	let i = hasBOM ? 2 : 0;
	const vscodeFix = i;
	
	stream: while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueA === 0 && (valueB === 10 || valueB === 13) || i === length) {
			if (i === length && !(valueA === 0 && (valueB === 10 || valueB === 13))) cache.push(valueA, valueB);
			let j = 0;
			let k = cache.length;
			start: while (j < k) {
				const cacheValueA = cache[j];
				const cacheValueB = cache[j + 1];
				if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 32)) {
					if (!ignoredWhitespace) ignoredWhitespace = true;
					j += 2;
					continue start;
				}
				break start;
			}
			if (j === k) {
				if (cache.length === length - vscodeFix) { // Fixes VS Code single space and tab line bug
					const cacheLengthA = cache.length;
					for (let l = 0; l < cacheLengthA; l++) newBuffer.push(cache[l]);
				} else if (valueA === 0 && (valueB === 10 || valueB === 13)) newBuffer.push(valueA, valueB);
				cache = [];
				continue stream;
			}
			end: while (k > j) {
				const cacheValueA = cache[k - 2];
				const cacheValueB = cache[k - 1];
				if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 32)) {
					if (!ignoredWhitespace) ignoredWhitespace = true;
					k -= 2;
					continue end;
				}
				break end;
			}
			cache = cache.slice(j, k);
			const cacheLengthB = cache.length;
			for (let m = 0; m < cacheLengthB; m++) newBuffer.push(cache[m]);
			if (valueA === 0 && (valueB === 10 || valueB === 13)) newBuffer.push(valueA, valueB);
			cache = [];
		} else cache.push(valueA, valueB);
	}
	
	if (ignoredWhitespace) {
		diff.ignoredWhitespace += modified;
		return Buffer.from(newBuffer);
	}
	
	return buffer;
	
}

function trimUTF16LE (buffer: Buffer, diff: Diff, modified: MODIFIED): Buffer {
	
	const hasBOM = hasUTF16LEBOM(buffer);
	const length = buffer.length;
	const newBuffer = hasBOM ? [buffer[0], buffer[1]] : [];
	let cache = [];
	let ignoredWhitespace = false;
	let i = hasBOM ? 2 : 0;
	const vscodeFix = i;
	
	stream: while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueB === 0 && (valueA === 10 || valueA === 13) || i === length) {
			if (i === length && !(valueB === 0 && (valueA === 10 || valueA === 13))) cache.push(valueA, valueB);
			let j = 0;
			let k = cache.length;
			start: while (j < k) {
				const cacheValueA = cache[j];
				const cacheValueB = cache[j + 1];
				if (cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 32)) {
					if (!ignoredWhitespace) ignoredWhitespace = true;
					j += 2;
					continue start;
				}
				break start;
			}
			if (j === k) {
				if (cache.length === length - vscodeFix) { // Fixes VS Code single space and tab line bug
					const cacheLengthA = cache.length;
					for (let l = 0; l < cacheLengthA; l++) newBuffer.push(cache[l]);
				} else if (valueB === 0 && (valueA === 10 || valueA === 13)) newBuffer.push(valueA, valueB);
				cache = [];
				continue stream;
			}
			end: while (k > j) {
				const cacheValueA = cache[k - 2];
				const cacheValueB = cache[k - 1];
				if (cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 32)) {
					if (!ignoredWhitespace) ignoredWhitespace = true;
					k -= 2;
					continue end;
				}
				break end;
			}
			cache = cache.slice(j, k);
			const cacheLengthB = cache.length;
			for (let m = 0; m < cacheLengthB; m++) newBuffer.push(cache[m]);
			if (valueB === 0 && (valueA === 10 || valueA === 13)) newBuffer.push(valueA, valueB);
			cache = [];
		} else cache.push(valueA, valueB);
	}
	
	if (ignoredWhitespace) {
		diff.ignoredWhitespace += modified;
		return Buffer.from(newBuffer);
	}
	
	return buffer;
	
}