//	Imports ____________________________________________________________________

const { push } = Array.prototype;

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function normalizeLineEnding (buffer:Buffer) {
	
	if (buffer[0] === 254 && buffer[1] === 255) return normalizeUTF16BE(buffer);
	if (buffer[0] === 255 && buffer[1] === 254) return normalizeUTF16LE(buffer);
	
	return normalizeAscii(buffer);
	
}

export function trimWhitespace (buffer:Buffer) :Buffer {
	
	if (buffer[0] === 254 && buffer[1] === 255) return trimUTF16BE(buffer);
	if (buffer[0] === 255 && buffer[1] === 254) return trimUTF16LE(buffer);
	
	return trimAscii(buffer);
	
}

//	Functions __________________________________________________________________

function normalizeAscii (buffer:Buffer) {
	
	const length = buffer.length;
	const cache = [];
	let i = 0;
	
	while (i < length) {
		const value = buffer[i++];
		if (value === 13) {
			if (buffer[i] !== 10) cache.push(10);
		} else cache.push(value);
	}
	
	return Buffer.from(cache);
	
}

function normalizeUTF16BE (buffer:Buffer) {
	
	const length = buffer.length;
	const cache = [];
	let i = 0;
	
	while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueA === 0 && valueB === 13) {
			if (!(buffer[i] === 0 && buffer[i + 1] === 10)) cache.push(0, 10);
		} else cache.push(valueA, valueB);
	}
	
	return Buffer.from(cache);
	
}

function normalizeUTF16LE (buffer:Buffer) {
	
	const length = buffer.length;
	const cache = [];
	let i = 0;
	
	while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueA === 13 && valueB === 0) {
			if (!(buffer[i] === 10 && buffer[i + 1] === 0)) cache.push(10, 0);
		} else cache.push(valueA, valueB);
	}
	
	return Buffer.from(cache);
	
}

function trimAscii (buffer:Buffer) :Buffer {
	
	const length = buffer.length;
	const newBuffer = [];
	let cache = [];
	let fixBOM = 0;
	let i = 0;
	
	if (buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191) { // UTF-8 BOM
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
					j++;
					continue start;
				}
				break start;
			}
			if (k === j) {
				if (cache.length === length - fixBOM) push.apply(newBuffer, cache); // Fixes VS Code single space and tab line bug
				else if (value === 10 || value === 13) newBuffer.push(value);
				cache = [];
				continue stream;
			}
			end: while (k > j) {
				const cacheValue = cache[k - 1];
				if (cacheValue === 9 || cacheValue === 32) {
					k--;
					continue end;
				}
				break end;
			}
			push.apply(newBuffer, cache.slice(j, k));
			if (value === 10 || value === 13) newBuffer.push(value);
			cache = [];
		} else cache.push(value);
	}
	
	return Buffer.from(newBuffer);
	
}

function trimUTF16BE (buffer:Buffer) :Buffer {
	
	const length = buffer.length;
	const newBuffer = [buffer[0], buffer[1]];
	let cache = [];
	let i = 2;
	
	stream: while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if ((valueA === 0 && (valueB === 10 || valueB === 13)) || i === length) {
			if (i === length && !(valueA === 0 && (valueB === 10 || valueB === 13))) cache.push(valueA, valueB);
			let j = 0;
			let k = cache.length;
			start: while (j < k) {
				const cacheValueA = cache[j];
				const cacheValueB = cache[j + 1];
				if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 32)) {
					j += 2;
					continue start;
				}
				break start;
			}
			if (j === k) {
				if (cache.length === length - 2) push.apply(newBuffer, cache); // Fixes VS Code single space and tab line bug
				else if (valueA === 0 && (valueB === 10 || valueB === 13)) newBuffer.push(valueA, valueB);
				cache = [];
				continue stream;
			}
			end: while (k > j) {
				const cacheValueA = cache[k - 2];
				const cacheValueB = cache[k - 1];
				if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 32)) {
					k -= 2;
					continue end;
				}
				break end;
			}
			push.apply(newBuffer, cache.slice(j, k));
			if (valueA === 0 && (valueB === 10 || valueB === 13)) newBuffer.push(valueA, valueB);
			cache = [];
		} else cache.push(valueA, valueB);
	}
	
	return Buffer.from(newBuffer);
	
}

function trimUTF16LE (buffer:Buffer) :Buffer {
	
	const length = buffer.length;
	const newBuffer = [buffer[0], buffer[1]];
	let cache = [];
	let i = 2;
	
	stream: while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if ((valueB === 0 && (valueA === 10 || valueA === 13)) || i === length) {
			if (i === length && !(valueB === 0 && (valueA === 10 || valueA === 13))) cache.push(valueA, valueB);
			let j = 0;
			let k = cache.length;
			start: while (j < k) {
				const cacheValueA = cache[j];
				const cacheValueB = cache[j + 1];
				if (cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 32)) {
					j += 2;
					continue start;
				}
				break start;
			}
			if (j === k) {
				if (cache.length === length - 2) push.apply(newBuffer, cache); // Fixes VS Code single space and tab line bug
				else if (valueB === 0 && (valueA === 10 || valueA === 13)) newBuffer.push(valueA, valueB);
				cache = [];
				continue stream;
			}
			end: while (k > j) {
				const cacheValueA = cache[k - 2];
				const cacheValueB = cache[k - 1];
				if (cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 32)) {
					k -= 2;
					continue end;
				}
				break end;
			}
			push.apply(newBuffer, cache.slice(j, k));
			if (valueB === 0 && (valueA === 10 || valueA === 13)) newBuffer.push(valueA, valueB);
			cache = [];
		} else cache.push(valueA, valueB);
	}
	
	return Buffer.from(newBuffer);
	
}