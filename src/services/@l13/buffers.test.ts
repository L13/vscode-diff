import * as assert from 'assert';

import { normalizeLineEnding, trimTrailingWhitespace } from './buffers';

describe('buffers', () => {
	
	describe('.normalizeLineEnding()', () => {
		
		it('ASCII / UTF-8 empty', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 ignore all chars except \\r and \\n', () => {
			
			for (let i = 0; i < 0xff; i++) {
				if (i !== 10 && i !== 13) assert.deepEqual(normalizeLineEnding(Buffer.from([i])), Buffer.from([i]));
			}
			
		});
		
		it('ASCII / UTF-8 don\'t change \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([10])), Buffer.from([10]));
			
		});
		
		it('ASCII / UTF-8 change \\r to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([13])), Buffer.from([10]));
			
		});
		
		it('ASCII / UTF-8 change \\r\\n to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([13, 10])), Buffer.from([10]));
			
		});
		
		it('ASCII / UTF-8 change \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([10, 13])), Buffer.from([10, 10]));
			
		});
		
		it('ASCII / UTF-8 don\'t change multiple \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([10, 10, 10])), Buffer.from([10, 10, 10]));
			
		});
		
		it('ASCII / UTF-8 change multiple \\r to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([13, 13, 13])), Buffer.from([10, 10, 10]));
			
		});
		
		it('ASCII / UTF-8 change multiple \\r\\n to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([13, 10, 13, 10, 13, 10])), Buffer.from([10, 10, 10]));
			
		});
		
		it('ASCII / UTF-8 change multiple \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([10, 13, 10, 13, 10, 13])), Buffer.from([10, 10, 10, 10]));
			
		});
		
		it('UTF-8 with BOM empty', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM ignore all chars except \\r and \\n', () => {
			
			for (let i = 0; i < 0xff; i++) {
				if (i !== 10 && i !== 13) assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, i])), Buffer.from([239, 187, 191, i]));
			}
			
		});
		
		it('UTF-8 with BOM don\'t change \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, 10])), Buffer.from([239, 187, 191, 10]));
			
		});
		
		it('UTF-8 with BOM change \\r to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, 13])), Buffer.from([239, 187, 191, 10]));
			
		});
		
		it('UTF-8 with BOM change \\r\\n to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, 13, 10])), Buffer.from([239, 187, 191, 10]));
			
		});
		
		it('UTF-8 with BOM change \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, 10, 13])), Buffer.from([239, 187, 191, 10, 10]));
			
		});
		
		it('UTF-8 with BOM don\'t change multiple \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, 10, 10, 10])), Buffer.from([239, 187, 191, 10, 10, 10]));
			
		});
		
		it('UTF-8 with BOM change multiple \\r to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, 13, 13, 13])), Buffer.from([239, 187, 191, 10, 10, 10]));
			
		});
		
		it('UTF-8 with BOM change multiple \\r\\n to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, 13, 10, 13, 10, 13, 10])), Buffer.from([239, 187, 191, 10, 10, 10]));
			
		});
		
		it('UTF-8 with BOM change multiple \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, 10, 13, 10, 13, 10, 13])), Buffer.from([239, 187, 191, 10, 10, 10, 10]));
			
		});
		
		it('UTF-16BE empty', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE ignore all chars except \\r and \\n', () => {
			
			for (let i = 0; i < 0xff; i++) {
				for (let j = 0; j < 0xff; j++) {
					if (i !== 0 && j !== 10 && j !== 13) assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, i, j])), Buffer.from([254, 255, i, j]));
				}
			}
			
		});
		
		it('UTF-16BE don\'t change \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 0, 10])), Buffer.from([254, 255, 0, 10]));
			
		});
		
		it('UTF-16BE change \\r to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 0, 13])), Buffer.from([254, 255, 0, 10]));
			
		});
		
		it('UTF-16BE change \\r\\n to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 0, 13, 0, 10])), Buffer.from([254, 255, 0, 10]));
			
		});
		
		it('UTF-16BE change \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 0, 10, 0, 13])), Buffer.from([254, 255, 0, 10, 0, 10]));
			
		});
		
		it('UTF-16BE don\'t change multiple \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 0, 10, 0, 10, 0, 10])), Buffer.from([254, 255, 0, 10, 0, 10, 0, 10]));
			
		});
		
		it('UTF-16BE change multiple \\r to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 0, 13, 0, 13, 0, 13])), Buffer.from([254, 255, 0, 10, 0, 10, 0, 10]));
			
		});
		
		it('UTF-16BE change multiple \\r\\n to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10])), Buffer.from([254, 255, 0, 10, 0, 10, 0, 10]));
			
		});
		
		it('UTF-16BE change multiple \\n\\r to \\n\\n', () => {
			
			// tslint:disable-next-line: max-line-length
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13])), Buffer.from([254, 255, 0, 10, 0, 10, 0, 10, 0, 10]));
			
		});
		
		it('UTF-16LE empty', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE ignore all chars except \\r and \\n', () => {
			
			for (let i = 0; i < 0xff; i++) {
				for (let j = 0; j < 0xff; j++) {
					if (i !== 10 && i !== 13 && j !== 0) assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, i, j])), Buffer.from([255, 254, i, j]));
				}
			}
			
		});
		
		it('UTF-16LE don\'t change \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, 10, 0])), Buffer.from([255, 254, 10, 0]));
			
		});
		
		it('UTF-16LE change \\r to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, 13, 0])), Buffer.from([255, 254, 10, 0]));
			
		});
		
		it('UTF-16LE change \\r\\n to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, 13, 0, 10, 0])), Buffer.from([255, 254, 10, 0]));
			
		});
		
		it('UTF-16LE change \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, 10, 0, 13, 0])), Buffer.from([255, 254, 10, 0, 10, 0]));
			
		});
		
		it('UTF-16LE don\'t change multiple \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, 10, 0, 10, 0, 10, 0])), Buffer.from([255, 254, 10, 0, 10, 0, 10, 0]));
			
		});
		
		it('UTF-16LE change multiple \\r to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, 13, 0, 13, 0, 13, 0])), Buffer.from([255, 254, 10, 0, 10, 0, 10, 0]));
			
		});
		
		it('UTF-16LE change multiple \\r\\n to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0])), Buffer.from([255, 254, 10, 0, 10, 0, 10, 0]));
			
		});
		
		it('UTF-16LE change multiple \\n\\r to \\n\\n', () => {
			
			// tslint:disable-next-line: max-line-length
			assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0])), Buffer.from([255, 254, 10, 0, 10, 0, 10, 0, 10, 0]));
			
		});
		
	});
	
	describe('.trimTrailingWhitespace()', () => {
		
		it('ASCII / UTF-8 empty', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 ignore all chars except \\v, \\f, \\t and space', () => {
			
			for (let i = 0; i < 0xff; i++) {
				if (i !== 9 && i !== 11 && i !== 12 && i !== 32) assert.deepEqual(trimTrailingWhitespace(Buffer.from([i])), Buffer.from([i]));
			}
			
		});
		
		it('ASCII / UTF-8 remove tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([9])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 remove vertical tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([11])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 remove form feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([12])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 remove space', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([32])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 remove multiple tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([9, 9, 9])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 remove multiple vertical tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([11, 11, 11])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 remove multiple form feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([12, 12, 12])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 remove multiple space', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([32, 32, 32])), Buffer.from([]));
			
		});
		
		it('ASCII / UTF-8 ignore line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([10])), Buffer.from([10]));
			
		});
		
		it('ASCII / UTF-8 ignore carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([13])), Buffer.from([13]));
			
		});
		
		it('ASCII / UTF-8 ignore multiple line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([10, 10, 10])), Buffer.from([10, 10, 10]));
			
		});
		
		it('ASCII / UTF-8 ignore multiple carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([13, 13, 13])), Buffer.from([13, 13, 13]));
			
		});
		
		it('UTF-8 with BOM empty', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM ignore all chars except \\v, \\f, \\t and space', () => {
			
			for (let i = 0; i < 0xff; i++) {
				if (i !== 9 && i !== 11 && i !== 12 && i !== 32) assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, i])), Buffer.from([239, 187, 191, i]));
			}
			
		});
		
		it('UTF-8 with BOM remove tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 9])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM remove vertical tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 11])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM remove form feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 12])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM remove space', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 32])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM remove multiple tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 9, 9, 9])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM remove multiple vertical tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 11, 11, 11])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM remove multiple form feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 12, 12, 12])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM remove multiple space', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 32, 32, 32])), Buffer.from([239, 187, 191]));
			
		});
		
		it('UTF-8 with BOM ignore line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 10])), Buffer.from([239, 187, 191, 10]));
			
		});
		
		it('UTF-8 with BOM ignore carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 13])), Buffer.from([239, 187, 191, 13]));
			
		});
		
		it('UTF-8 with BOM ignore multiple line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 10, 10, 10])), Buffer.from([239, 187, 191, 10, 10, 10]));
			
		});
		
		it('UTF-8 with BOM ignore multiple carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, 13, 13, 13])), Buffer.from([239, 187, 191, 13, 13, 13]));
			
		});
		
		it('UTF-16BE empty', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE ignore all chars except \\v, \\f, \\t and space', () => {
			
			for (let i = 0; i < 0xff; i++) {
				for (let j = 0; j < 0xff; j++) {
					// tslint:disable-next-line: max-line-length
					if (i !== 0 && j !== 9 && j !== 11 && j !== 12 && j !== 32) assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, i, j])), Buffer.from([254, 255, i, j]));
				}
			}
			
		});
		
		it('UTF-16BE remove tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 9])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE remove vertical tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 11])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE remove form feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 12])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE remove space', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 32])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE remove multiple tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 9, 0, 9, 0, 9])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE remove multiple vertical tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 11, 0, 11, 0, 11])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE remove multiple form feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 12, 0, 12, 0, 12])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE remove multiple space', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 32, 0, 32, 0, 32])), Buffer.from([254, 255]));
			
		});
		
		it('UTF-16BE ignore line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 10])), Buffer.from([254, 255, 0, 10]));
			
		});
		
		it('UTF-16BE ignore carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 13])), Buffer.from([254, 255, 0, 13]));
			
		});
		
		it('UTF-16BE ignore multiple line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 10, 0, 10, 0, 10])), Buffer.from([254, 255, 0, 10, 0, 10, 0, 10]));
			
		});
		
		it('UTF-16BE ignore multiple carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 13, 0, 13, 0, 13])), Buffer.from([254, 255, 0, 13, 0, 13, 0, 13]));
			
		});
		
		it('UTF-16LE empty', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE ignore all chars except \\v, \\f, \\t and space', () => {
			
			for (let i = 0; i < 0xff; i++) {
				for (let j = 0; j < 0xff; j++) {
					// tslint:disable-next-line: max-line-length
					if (i !== 9 && i !== 11 && i !== 12 && i !== 32 && j !== 0) assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, i, j])), Buffer.from([255, 254, i, j]));
				}
			}
			
		});
		
		it('UTF-16LE remove tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 9, 0])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE remove vertical tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 11, 0])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE remove form feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 12, 0])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE remove space', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 32, 0])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE remove multiple tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 9, 0, 9, 0, 9, 0])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE remove multiple vertical tab', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 11, , 11, , 11, 0])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE remove multiple form feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 12, , 12, , 12, 0])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE remove multiple space', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 32, , 32, , 32, 0])), Buffer.from([255, 254]));
			
		});
		
		it('UTF-16LE ignore line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 10, 0])), Buffer.from([255, 254, 10, 0]));
			
		});
		
		it('UTF-16LE ignore carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 13, 0])), Buffer.from([255, 254, 13, 0]));
			
		});
		
		it('UTF-16LE ignore multiple line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 10, 0, 10, 0, 10, 0])), Buffer.from([255, 254, 10, 0, 10, 0, 10, 0]));
			
		});
		
		it('UTF-16LE ignore multiple carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 13, 0, 13, 0, 13, 0])), Buffer.from([255, 254, 13, 0, 13, 0, 13, 0]));
			
		});
		
	});
	
});