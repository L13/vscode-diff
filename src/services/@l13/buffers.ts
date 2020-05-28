//	Imports ____________________________________________________________________

const push = Array.prototype.push;

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function normalizeLineEnding (buffer:Buffer) {
	
	return hasUTF16BOM(buffer) ? normalizeUTF16Buffer(buffer) : normalizeAsciiBuffer(buffer);
	
}

export function trimTrailingWhitespace (buffer:Buffer) :Buffer {
	
	return hasUTF16BOM(buffer) ? trimTrailingWhitespaceForUTF16(buffer) : trimTrailingWhitespaceForAscii(buffer);
	
}

//	Functions __________________________________________________________________

function hasUTF16BOM (buffer:Buffer) {
	
	return buffer[0] === 254 && buffer[1] === 255 || buffer[0] === 255 && buffer[1] === 254;
	
}

function normalizeAsciiBuffer (buffer:Buffer) {
	
	const length = buffer.length;
	const cache = [];
	let i = 0;
	
	while (i < length) {
		const value = buffer[i++];
		if (value === 13) {
			if (buffer[i] !== 10) cache[cache.length] = 10;
		} else cache.push(value);
	}
	
	return Buffer.from(cache);
	
}

function normalizeUTF16Buffer (buffer:Buffer) {
	
	const length = buffer.length;
	const cache = [];
	let i = 0;
	
	while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueA === 0 && valueB === 13) {
			if (buffer[i] !== 0 && buffer[i + 1] !== 10) {
				cache[cache.length] = 0;
				cache[cache.length] = 10;
			}
		} else if (valueA === 13 && valueB === 0) {
			if (buffer[i] !== 10 && buffer[i + 1] !== 0) {
				cache[cache.length] = 10;
				cache[cache.length] = 0;
			}
		} else {
			cache[cache.length] = valueA;
			cache[cache.length] = valueB;
		}
	}
	
	return Buffer.from(cache);
	
}

function trimTrailingWhitespaceForAscii (buffer:Buffer) :Buffer {
	
	const length = buffer.length;
	const newBuffer = [];
	let cache = [];
	let i = 0;
	
	if (buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191) { // UTF-8 BOM
		newBuffer.push(239, 187, 191);
		i = 3;
	}
	
	stream: while (i < length) {
		const value = buffer[i++];
		if (value === 10 || value === 13 || i === length) {
			if (i === length && value !== 10 && value !== 13) cache.push(value);
			let j = 0;
			let k = cache.length;
			start: while (j < k) {
				const cacheValue = cache[j];
				if (cacheValue === 9 || cacheValue === 11 || cacheValue === 12 || cacheValue === 32) {
					j++;
					continue start;
				}
				break start;
			}
			if (k === j) {
				if (value === 10 || value === 13) newBuffer.push(value);
				cache = [];
				continue stream;
			}
			end: while (k > j) {
				const cacheValue = cache[k - 1];
				if (cacheValue === 9 || cacheValue === 11 || cacheValue === 12 || cacheValue === 32) {
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

function trimTrailingWhitespaceForUTF16 (buffer:Buffer) :Buffer {
	
	const length = buffer.length;
	const newBuffer = [buffer[0], buffer[1]];
	let cache = [];
	let i = 2;
	
	stream: while (i < length) {
		const valueA = buffer[i++];
		const valueB = buffer[i++];
		if (valueA === 0 && (valueB === 10 || valueB === 13)
		|| valueB === 0 && (valueA === 10 || valueA === 13)
		|| i === length) {
			if (i === length &&
				(valueA !== 0 && valueB !== 10 && valueB !== 13
				&& valueB !== 0 && valueA !== 10 && valueA !== 13)) {
					cache.push(valueA, valueB);
			}
			let j = 0;
			let k = cache.length;
			start: while (j < k) {
				const cacheValueA = cache[j];
				const cacheValueB = cache[j + 1];
				if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 11 || cacheValueB === 12 || cacheValueB === 32)
				|| cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 11 || cacheValueA === 12 || cacheValueA === 32)) {
					j += 2;
					continue start;
				}
				break start;
			}
			if (j === k) {
				if (valueA === 0 && (valueB === 10 || valueB === 13)
					|| valueB === 0 && (valueA === 10 || valueA === 13)) {
						newBuffer.push(valueA, valueB);
				}
				cache = [];
				continue stream;
			}
			end: while (k > j) {
				const cacheValueA = cache[k - 2];
				const cacheValueB = cache[k - 1];
				if (cacheValueA === 0 && (cacheValueB === 9 || cacheValueB === 11 || cacheValueB === 12 || cacheValueB === 32)
				|| cacheValueB === 0 && (cacheValueA === 9 || cacheValueA === 11 || cacheValueA === 12 || cacheValueA === 32)) {
					k -= 2;
					continue end;
				}
				break end;
			}
			push.apply(newBuffer, cache.slice(j, k));
			if (valueA === 0 && (valueB === 10 || valueB === 13)
				|| valueB === 0 && (valueA === 10 || valueA === 13)) {
					newBuffer.push(valueA, valueB);
			}
			cache = [];
		} else cache.push(valueA, valueB);
	}
	
	return Buffer.from(newBuffer);
	
}