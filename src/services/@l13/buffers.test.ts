import * as assert from 'assert';

import { normalizeLineEnding, trimTrailingWhitespace } from './buffers';

type Test = {
	desc:string,
	expect:number[],
	toBe:number[],
};

describe('buffers', () => {
	
	describe('.normalizeLineEnding()', () => {
		
		const tests:Test[] = [
			{
				desc: 'ASCII / UTF-8 empty',
				expect: [],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 don\'t change \\n',
				expect: [10],
				toBe: [10],
			},
			{
				desc: 'ASCII / UTF-8 change \\r to \\n',
				expect: [13],
				toBe: [10],
			},
			{
				desc: 'ASCII / UTF-8 change \\r\\n to \\n',
				expect: [13, 10],
				toBe: [10],
			},
			{
				desc: 'ASCII / UTF-8 change \\n\\r to \\n\\n',
				expect: [10, 13],
				toBe: [10, 10],
			},
			{
				desc: 'ASCII / UTF-8 don\'t change multiple \\n',
				expect: [10, 10, 10],
				toBe: [10, 10, 10],
			},
			{
				desc: 'ASCII / UTF-8 change multiple \\r to \\n',
				expect: [13, 13, 13],
				toBe: [10, 10, 10],
			},
			{
				desc: 'ASCII / UTF-8 change multiple \\r\\n to \\n',
				expect: [13, 10, 13, 10, 13, 10],
				toBe: [10, 10, 10],
			},
			{
				desc: 'ASCII / UTF-8 change multiple \\n\\r to \\n\\n',
				expect: [10, 13, 10, 13, 10, 13],
				toBe: [10, 10, 10, 10],
			},
			{
				desc: 'ASCII / UTF-8 don\'t change multiple \\n with content',
				expect: [65, 10, 65, 10, 65, 10, 65],
				toBe: [65, 10, 65, 10, 65, 10, 65],
			},
			{
				desc: 'ASCII / UTF-8 change multiple \\r to \\n with content',
				expect: [65, 13, 65, 13, 65, 13, 65],
				toBe: [65, 10, 65, 10, 65, 10, 65],
			},
			{
				desc: 'ASCII / UTF-8 change multiple \\r\\n to \\n with content',
				expect: [65, 13, 10, 65, 13, 10, 65, 13, 10, 65],
				toBe: [65, 10, 65, 10, 65, 10, 65],
			},
			{
				desc: 'UTF-8 with BOM empty',
				expect: [239, 187, 191],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM don\'t change \\n',
				expect: [239, 187, 191, 10],
				toBe: [239, 187, 191, 10],
			},
			{
				desc: 'UTF-8 with BOM change \\r to \\n',
				expect: [239, 187, 191, 13],
				toBe: [239, 187, 191, 10],
			},
			{
				desc: 'UTF-8 with BOM change \\r\\n to \\n',
				expect: [239, 187, 191, 13, 10],
				toBe: [239, 187, 191, 10],
			},
			{
				desc: 'UTF-8 with BOM change \\n\\r to \\n\\n',
				expect: [239, 187, 191, 10, 13],
				toBe: [239, 187, 191, 10, 10],
			},
			{
				desc: 'UTF-8 with BOM don\'t change multiple \\n',
				expect: [239, 187, 191, 10, 10, 10],
				toBe: [239, 187, 191, 10, 10, 10],
			},
			{
				desc: 'UTF-8 with BOM change multiple \\r to \\n',
				expect: [239, 187, 191, 13, 13, 13],
				toBe: [239, 187, 191, 10, 10, 10],
			},
			{
				desc: 'UTF-8 with BOM change multiple \\r\\n to \\n',
				expect: [239, 187, 191, 13, 10, 13, 10, 13, 10],
				toBe: [239, 187, 191, 10, 10, 10],
			},
			{
				desc: 'UTF-8 with BOM change multiple \\n\\r to \\n\\n',
				expect: [239, 187, 191, 10, 13, 10, 13, 10, 13],
				toBe: [239, 187, 191, 10, 10, 10, 10],
			},
			{
				desc: 'UTF-8 with BOM don\'t change multiple \\n with content',
				expect: [239, 187, 191, 65, 10, 65, 10, 65, 10],
				toBe: [239, 187, 191, 65, 10, 65, 10, 65, 10],
			},
			{
				desc: 'UTF-8 with BOM change multiple \\r to \\n with content',
				expect: [239, 187, 191, 65, 13, 65, 13, 65, 13, 65],
				toBe: [239, 187, 191, 65, 10, 65, 10, 65, 10, 65],
			},
			{
				desc: 'UTF-8 with BOM change multiple \\r\\n to \\n with content',
				expect: [239, 187, 191, 65, 13, 10, 65, 13, 10, 65, 13, 10, 65],
				toBe: [239, 187, 191, 65, 10, 65, 10, 65, 10, 65],
			},
			{
				desc: 'UTF-16BE empty',
				expect: [254, 255],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE don\'t change \\n',
				expect: [254, 255, 0, 10],
				toBe: [254, 255, 0, 10],
			},
			{
				desc: 'UTF-16BE change \\r to \\n',
				expect: [254, 255, 0, 13],
				toBe: [254, 255, 0, 10],
			},
			{
				desc: 'UTF-16BE change \\r\\n to \\n',
				expect: [254, 255, 0, 13, 0, 10],
				toBe: [254, 255, 0, 10],
			},
			{
				desc: 'UTF-16BE change \\n\\r to \\n\\n',
				expect: [254, 255, 0, 10, 0, 13],
				toBe: [254, 255, 0, 10, 0, 10],
			},
			{
				desc: 'UTF-16BE don\'t change multiple \\n',
				expect: [254, 255, 0, 10, 0, 10, 0, 10],
				toBe: [254, 255, 0, 10, 0, 10, 0, 10],
			},
			{
				desc: 'UTF-16BE change multiple \\r to \\n',
				expect: [254, 255, 0, 13, 0, 13, 0, 13],
				toBe: [254, 255, 0, 10, 0, 10, 0, 10],
			},
			{
				desc: 'UTF-16BE change multiple \\r\\n to \\n',
				expect: [254, 255, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10],
				toBe: [254, 255, 0, 10, 0, 10, 0, 10],
			},
			{
				desc: 'UTF-16BE change multiple \\n\\r to \\n\\n',
				expect: [254, 255, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13],
				toBe: [254, 255, 0, 10, 0, 10, 0, 10, 0, 10],
			},
			{
				desc: 'UTF-16BE don\'t change multiple \\n with content',
				expect: [254, 255, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65],
				toBe: [254, 255, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65],
			},
			{
				desc: 'UTF-16BE change multiple \\r to \\n with content',
				expect: [254, 255, 0, 65, 0, 13, 0, 65, 0, 13, 0, 65, 0, 13, 0, 65],
				toBe: [254, 255, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65],
			},
			{
				desc: 'UTF-16BE change multiple \\r\\n to \\n with content',
				expect: [254, 255, 0, 65, 0, 13, 0, 10, 0, 65, 0, 13, 0, 10, 0, 65, 0, 13, 0, 10, 0, 65],
				toBe: [254, 255, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65],
			},
			{
				desc: 'UTF-16LE empty',
				expect: [255, 254],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE don\'t change \\n',
				expect: [255, 254, 10, 0],
				toBe: [255, 254, 10, 0],
			},
			{
				desc: 'UTF-16LE change \\r to \\n',
				expect: [255, 254, 13, 0],
				toBe: [255, 254, 10, 0],
			},
			{
				desc: 'UTF-16LE change \\r\\n to \\n',
				expect: [255, 254, 13, 0, 10, 0],
				toBe: [255, 254, 10, 0],
			},
			{
				desc: 'UTF-16LE change \\n\\r to \\n\\n',
				expect: [255, 254, 10, 0, 13, 0],
				toBe: [255, 254, 10, 0, 10, 0],
			},
			{
				desc: 'UTF-16LE don\'t change multiple \\n',
				expect: [255, 254, 10, 0, 10, 0, 10, 0],
				toBe: [255, 254, 10, 0, 10, 0, 10, 0],
			},
			{
				desc: 'UTF-16LE change multiple \\r to \\n',
				expect: [255, 254, 13, 0, 13, 0, 13, 0],
				toBe: [255, 254, 10, 0, 10, 0, 10, 0],
			},
			{
				desc: 'UTF-16LE change multiple \\r\\n to \\n',
				expect: [255, 254, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0],
				toBe: [255, 254, 10, 0, 10, 0, 10, 0],
			},
			{
				desc: 'UTF-16LE change multiple \\n\\r to \\n\\n',
				expect: [255, 254, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0],
				toBe: [255, 254, 10, 0, 10, 0, 10, 0, 10, 0],
			},
			{
				desc: 'UTF-16LE don\'t change multiple \\n with content',
				expect: [255, 254, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0],
				toBe: [255, 254, 65, 0 , 10, 0, 65, 0 , 10, 0, 65, 0 , 10, 0, 65, 0],
			},
			{
				desc: 'UTF-16LE change multiple \\r to \\n with content',
				expect: [255, 254, 65, 0, 13, 0, 65, 0, 13, 0, 65, 0, 13, 0, 65, 0],
				toBe: [255, 254, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0],
			},
			{
				desc: 'UTF-16LE change multiple \\r\\n to \\n with content',
				expect: [255, 254, 65, 0, 13, 0, 10, 0, 65, 0, 13, 0, 10, 0, 65, 0, 13, 0, 10, 0, 65, 0],
				toBe: [255, 254, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0],
			},
		];
		
		for (const test of tests) {
			it(test.desc, () => assert.deepEqual(normalizeLineEnding(Buffer.from(test.expect)), Buffer.from(test.toBe)));
		}
		
		it('ASCII / UTF-8 ignore all chars except \\r and \\n', () => {
			
			for (let i = 0; i < 0xff; i++) {
				if (i !== 10 && i !== 13) assert.deepEqual(normalizeLineEnding(Buffer.from([i])), Buffer.from([i]));
			}
			
		});
		
		it('UTF-8 with BOM ignore all chars except \\r and \\n', () => {
			
			for (let i = 0; i < 0xff; i++) {
				if (i !== 10 && i !== 13) assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, i])), Buffer.from([239, 187, 191, i]));
			}
			
		});
		
		it('UTF-16BE ignore all chars except \\r and \\n', () => {
			
			for (let i = 0; i < 0xff; i++) {
				for (let j = 0; j < 0xff; j++) {
					if (i !== 0 && j !== 10 && j !== 13) assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, i, j])), Buffer.from([254, 255, i, j]));
				}
			}
			
		});
		
		it('UTF-16LE ignore all chars except \\r and \\n', () => {
			
			for (let i = 0; i < 0xff; i++) {
				for (let j = 0; j < 0xff; j++) {
					if (i !== 10 && i !== 13 && j !== 0) assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, i, j])), Buffer.from([255, 254, i, j]));
				}
			}
			
		});
		
		
	});
	
	describe('.trimTrailingWhitespace()', () => {
		
		const tests:Test[] = [
			{
				desc: 'ASCII / UTF-8 empty',
				expect: [],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 remove tab',
				expect: [9],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 remove vertical tab',
				expect: [11],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 remove form feed',
				expect: [12],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 remove space',
				expect: [32],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 remove multiple tab',
				expect: [9, 9, 9],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 remove multiple vertical tab',
				expect: [11, 11, 11],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 remove multiple form feed',
				expect: [12, 12, 12],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 remove multiple space',
				expect: [32, 32, 32],
				toBe: [],
			},
			{
				desc: 'ASCII / UTF-8 ignore line feed',
				expect: [10],
				toBe: [10],
			},
			{
				desc: 'ASCII / UTF-8 ignore carriage return',
				expect: [13],
				toBe: [13],
			},
			{
				desc: 'ASCII / UTF-8 ignore carriage return and line feed',
				expect: [13, 10],
				toBe: [13, 10],
			},
			{
				desc: 'ASCII / UTF-8 ignore multiple line feed',
				expect: [10, 10, 10],
				toBe: [10, 10, 10],
			},
			{
				desc: 'ASCII / UTF-8 ignore multiple carriage return',
				expect: [13, 13, 13],
				toBe: [13, 13, 13],
			},
			{
				desc: 'ASCII / UTF-8 ignore multiple carriage return and line feed',
				expect: [13, 10, 13, 10, 13, 10],
				toBe: [13, 10, 13, 10, 13, 10],
			},
			{
				desc: 'ASCII / UTF-8 remove trailing tab',
				expect: [9, 65, 9],
				toBe: [65],
			},
			{
				desc: 'ASCII / UTF-8 remove trailing vertical tab',
				expect: [11, 65, 11],
				toBe: [65],
			},
			{
				desc: 'ASCII / UTF-8 remove trailing form feed',
				expect: [12, 65, 12],
				toBe: [65],
			},
			{
				desc: 'ASCII / UTF-8 remove trailing space',
				expect: [32, 65, 32],
				toBe: [65],
			},
			{
				desc: 'ASCII / UTF-8 remove multipe trailing tab',
				expect: [9, 9, 9, 65, 9, 9, 9],
				toBe: [65],
			},
			{
				desc: 'ASCII / UTF-8 remove multipe trailing vertical tab',
				expect: [11, 11, 11, 65, 11, 11, 11],
				toBe: [65],
			},
			{
				desc: 'ASCII / UTF-8 remove multipe trailing form feed',
				expect: [12, 12, 12, 65, 12, 12, 12],
				toBe: [65],
			},
			{
				desc: 'ASCII / UTF-8 remove multipe trailing space',
				expect: [32, 32, 32, 65, 32, 32, 32],
				toBe: [65],
			},
			{
				desc: 'ASCII / UTF-8 ignore tab in between',
				expect: [9, 65, 9, 65, 9],
				toBe: [65, 9, 65],
			},
			{
				desc: 'ASCII / UTF-8 ignore vertical tab in between',
				expect: [11, 65, 11, 65, 11],
				toBe: [65, 11, 65],
			},
			{
				desc: 'ASCII / UTF-8 ignore form feed in between',
				expect: [12, 65, 12, 65, 12],
				toBe: [65, 12, 65],
			},
			{
				desc: 'ASCII / UTF-8 ignore space in between',
				expect: [32, 65, 32, 65, 32],
				toBe: [65, 32, 65],
			},
			{
				desc: 'UTF-8 with BOM empty',
				expect: [239, 187, 191],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM remove tab',
				expect: [239, 187, 191, 9],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM remove vertical tab',
				expect: [239, 187, 191, 11],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM remove form feed',
				expect: [239, 187, 191, 12],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM remove space',
				expect: [239, 187, 191, 32],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM remove multiple tab',
				expect: [239, 187, 191, 9, 9, 9],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM remove multiple vertical tab',
				expect: [239, 187, 191, 11, 11, 11],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM remove multiple form feed',
				expect: [239, 187, 191, 12, 12, 12],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM remove multiple space',
				expect: [239, 187, 191, 32, 32, 32],
				toBe: [239, 187, 191],
			},
			{
				desc: 'UTF-8 with BOM ignore line feed',
				expect: [239, 187, 191, 10],
				toBe: [239, 187, 191, 10],
			},
			{
				desc: 'UTF-8 with BOM ignore carriage return',
				expect: [239, 187, 191, 13],
				toBe: [239, 187, 191, 13],
			},
			{
				desc: 'UTF-8 with BOM ignore multiple line feed',
				expect: [239, 187, 191, 10, 10, 10],
				toBe: [239, 187, 191, 10, 10, 10],
			},
			{
				desc: 'UTF-8 with BOM ignore multiple carriage return',
				expect: [239, 187, 191, 13, 13, 13],
				toBe: [239, 187, 191, 13, 13, 13],
			},
			{
				desc: 'UTF-8 with BOM ignore multiple carriage return and line feed',
				expect: [239, 187, 191, 13, 10, 13, 10, 13, 10],
				toBe: [239, 187, 191, 13, 10, 13, 10, 13, 10],
			},
			{
				desc: 'UTF-8 with BOM remove trailing tab',
				expect: [239, 187, 191, 9, 65, 9],
				toBe: [239, 187, 191, 65],
			},
			{
				desc: 'UTF-8 with BOM remove trailing vertical tab',
				expect: [239, 187, 191, 11, 65, 11],
				toBe: [239, 187, 191, 65],
			},
			{
				desc: 'UTF-8 with BOM remove trailing form feed',
				expect: [239, 187, 191, 12, 65, 12],
				toBe: [239, 187, 191, 65],
			},
			{
				desc: 'UTF-8 with BOM remove trailing space',
				expect: [239, 187, 191, 32, 65, 32],
				toBe: [239, 187, 191, 65],
			},
			{
				desc: 'UTF-8 with BOM remove multiple trailing tab',
				expect: [239, 187, 191, 9, 9, 9, 65, 9, 9, 9],
				toBe: [239, 187, 191, 65],
			},
			{
				desc: 'UTF-8 with BOM remove multiple trailing vertical tab',
				expect: [239, 187, 191, 11, 11, 11, 65, 11, 11, 11],
				toBe: [239, 187, 191, 65],
			},
			{
				desc: 'UTF-8 with BOM remove multiple trailing form feed',
				expect: [239, 187, 191, 12, 12, 12, 65, 12, 12, 12],
				toBe: [239, 187, 191, 65],
			},
			{
				desc: 'UTF-8 with BOM remove multiple trailing space',
				expect: [239, 187, 191, 32, 32, 32, 65, 32, 32, 32],
				toBe: [239, 187, 191, 65],
			},
			{
				desc: 'UTF-8 with BOM ignore tab in between',
				expect: [239, 187, 191, 9, 65, 9, 65, 9],
				toBe: [239, 187, 191, 65, 9, 65],
			},
			{
				desc: 'UTF-8 with BOM ignore vertical tab in between',
				expect: [239, 187, 191, 11, 65, 11, 65, 11],
				toBe: [239, 187, 191, 65, 11, 65],
			},
			{
				desc: 'UTF-8 with BOM ignore form feed in between',
				expect: [239, 187, 191, 12, 65, 12, 65, 12],
				toBe: [239, 187, 191, 65, 12, 65],
			},
			{
				desc: 'UTF-8 with BOM ignore space in between',
				expect: [239, 187, 191, 32, 65, 32, 65, 32],
				toBe: [239, 187, 191, 65, 32, 65],
			},
			{
				desc: 'UTF-16BE empty',
				expect: [254, 255],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE remove tab',
				expect: [254, 255, 0, 9],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE remove vertical tab',
				expect: [254, 255, 0, 11],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE remove form feed',
				expect: [254, 255, 0, 12],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE remove space',
				expect: [254, 255, 0, 32],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE remove multiple tab',
				expect: [254, 255, 0, 9, 0, 9, 0, 9],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE remove multiple vertical tab',
				expect: [254, 255, 0, 11, 0, 11, 0, 11],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE remove multiple form feed',
				expect: [254, 255, 0, 12, 0, 12, 0, 12],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE remove multiple space',
				expect: [254, 255, 0, 32, 0, 32, 0, 32],
				toBe: [254, 255],
			},
			{
				desc: 'UTF-16BE ignore line feed',
				expect: [254, 255, 0, 10],
				toBe: [254, 255, 0, 10],
			},
			{
				desc: 'UTF-16BE ignore carriage return',
				expect: [254, 255, 0, 13],
				toBe: [254, 255, 0, 13],
			},
			{
				desc: 'UTF-16BE ignore multiple line feed',
				expect: [254, 255, 0, 10, 0, 10, 0, 10],
				toBe: [254, 255, 0, 10, 0, 10, 0, 10],
			},
			{
				desc: 'UTF-16BE ignore multiple carriage return',
				expect: [254, 255, 0, 13, 0, 13, 0, 13],
				toBe: [254, 255, 0, 13, 0, 13, 0, 13],
			},
			{
				desc: 'UTF-16BE ignore multiple carriage return and line feed',
				expect: [254, 255, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10],
				toBe: [254, 255, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10],
			},
			{
				desc: 'UTF-16BE remove trailing tab',
				expect: [254, 255, 0, 9, 0, 65, 0, 9],
				toBe: [254, 255, 0, 65],
			},
			{
				desc: 'UTF-16BE remove trailing vertical tab',
				expect: [254, 255, 0, 11, 0, 65, 0, 11],
				toBe: [254, 255, 0, 65],
			},
			{
				desc: 'UTF-16BE remove trailing form feed',
				expect: [254, 255, 0, 12, 0, 65, 0, 12],
				toBe: [254, 255, 0, 65],
			},
			{
				desc: 'UTF-16BE remove trailing space',
				expect: [254, 255, 0, 32, 0, 65, 0, 32],
				toBe: [254, 255, 0, 65],
			},
			{
				desc: 'UTF-16BE remove multiple trailing tab',
				expect: [254, 255, 0, 9, 0, 9, 0, 9, 0, 9, 0, 65, 0, 9, 0, 9, 0, 9, 0, 9],
				toBe: [254, 255, 0, 65],
			},
			{
				desc: 'UTF-16BE remove multiple trailing vertical tab',
				expect: [254, 255, 0, 11, 0, 11, 0, 11, 0, 65, 0, 11, 0, 11, 0, 11],
				toBe: [254, 255, 0, 65],
			},
			{
				desc: 'UTF-16BE remove multiple trailing form feed',
				expect: [254, 255, 0, 12, 0, 12, 0, 12, 0, 65, 0, 12, 0, 12, 0, 12],
				toBe: [254, 255, 0, 65],
			},
			{
				desc: 'UTF-16BE remove multiple trailing space',
				expect: [254, 255, 0, 32, 0, 32, 0, 32, 0, 65, 0, 32, 0, 32, 0, 32],
				toBe: [254, 255, 0, 65],
			},
			{
				desc: 'UTF-16BE ignore tab in between',
				expect: [254, 255, 0, 9, 0, 65, 0, 9, 0, 65, 0, 9],
				toBe: [254, 255, 0, 65, 0, 9, 0, 65],
			},
			{
				desc: 'UTF-16BE ignore vertical tab in between',
				expect: [254, 255, 0, 11, 0, 65, 0, 11, 0, 65, 0, 11],
				toBe: [254, 255, 0, 65, 0, 11, 0, 65],
			},
			{
				desc: 'UTF-16BE ignore form feed in between',
				expect: [254, 255, 0, 12, 0, 65, 0, 12, 0, 65, 0, 12],
				toBe: [254, 255, 0, 65, 0, 12, 0, 65],
			},
			{
				desc: 'UTF-16BE ignore space in between',
				expect: [254, 255, 0, 32, 0, 65, 0, 32, 0, 65, 0, 32],
				toBe: [254, 255, 0, 65, 0, 32, 0, 65],
			},
			{
				desc: 'UTF-16LE empty',
				expect: [255, 254],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE remove tab',
				expect: [255, 254, 9, 0],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE remove vertical tab',
				expect: [255, 254, 11, 0],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE remove form feed',
				expect: [255, 254, 12, 0],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE remove space',
				expect: [255, 254, 32, 0],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE remove multiple tab',
				expect: [255, 254, 9, 0, 9, 0, 9, 0],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE remove multiple vertical tab',
				expect: [255, 254, 11, , 11, , 11, 0],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE remove multiple form feed',
				expect: [255, 254, 12, , 12, , 12, 0],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE remove multiple space',
				expect: [255, 254, 32, , 32, , 32, 0],
				toBe: [255, 254],
			},
			{
				desc: 'UTF-16LE ignore line feed',
				expect: [255, 254, 10, 0],
				toBe: [255, 254, 10, 0],
			},
			{
				desc: 'UTF-16LE ignore carriage return',
				expect: [255, 254, 13, 0],
				toBe: [255, 254, 13, 0],
			},
			{
				desc: 'UTF-16LE ignore multiple line feed',
				expect: [255, 254, 10, 0, 10, 0, 10, 0],
				toBe: [255, 254, 10, 0, 10, 0, 10, 0],
			},
			{
				desc: 'UTF-16LE ignore multiple carriage return',
				expect: [255, 254, 13, 0, 13, 0, 13, 0],
				toBe: [255, 254, 13, 0, 13, 0, 13, 0],
			},
			{
				desc: 'UTF-16LE ignore multiple carriage return and line feed',
				expect: [255, 254, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0],
				toBe: [255, 254, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0],
			},
			{
				desc: 'UTF-16LE remove trailing tab',
				expect: [255, 254, 9, 0, 65, 0, 9, 0],
				toBe: [255, 254, 65, 0],
			},
			{
				desc: 'UTF-16LE remove trailing vertical tab',
				expect: [255, 254, 11, 0, 65, 0, 11, 0],
				toBe: [255, 254, 65, 0],
			},
			{
				desc: 'UTF-16LE remove trailing form feed',
				expect: [255, 254, 12, 0, 65, 0, 12, 0],
				toBe: [255, 254, 65, 0],
			},
			{
				desc: 'UTF-16LE remove trailing space',
				expect: [255, 254, 32, 0, 65, 0, 32, 0],
				toBe: [255, 254, 65, 0],
			},
			{
				desc: 'UTF-16LE remove multiple trailing tab',
				expect: [255, 254, 9, 0, 9, 0, 9, 0, 65, 0, 9, 0, 9, 0, 9, 0],
				toBe: [255, 254, 65, 0],
			},
			{
				desc: 'UTF-16LE remove multiple trailing vertical tab',
				expect: [255, 254, 11, 0, 11, 0, 11, 0, 65, 0, 11, 0, 11, 0, 11, 0],
				toBe: [255, 254, 65, 0],
			},
			{
				desc: 'UTF-16LE remove multiple trailing form feed',
				expect: [255, 254, 12, 0, 12, 0, 12, 0, 65, 0, 12, 0, 12, 0, 12, 0],
				toBe: [255, 254, 65, 0],
			},
			{
				desc: 'UTF-16LE remove multiple trailing space',
				expect: [255, 254, 32, 0, 32, 0, 32, 0, 65, 0, 32, 0, 32, 0, 32, 0],
				toBe: [255, 254, 65, 0],
			},
			{
				desc: 'UTF-16LE ignore tab in between',
				expect: [255, 254, 9, 0, 65, 0, 9, 0, 65, 0, 9, 0],
				toBe: [255, 254, 65, 0, 9, 0, 65, 0],
			},
			{
				desc: 'UTF-16LE ignore vertical tab in between',
				expect: [255, 254, 11, 0, 65, 0, 11, 0, 65, 0, 11, 0],
				toBe: [255, 254, 65, 0, 11, 0, 65, 0],
			},
			{
				desc: 'UTF-16LE ignore form feed in between',
				expect: [255, 254, 12, 0, 65, 0, 12, 0, 65, 0, 12, 0],
				toBe: [255, 254, 65, 0, 12, 0, 65, 0],
			},
			{
				desc: 'UTF-16LE ignore space in between',
				expect: [255, 254, 32, 0, 65, 0, 32, 0, 65, 0, 32, 0],
				toBe: [255, 254, 65, 0, 32, 0, 65, 0],
			},
		];
		
		for (const test of tests) {
			it(test.desc, () => assert.deepEqual(trimTrailingWhitespace(Buffer.from(test.expect)), Buffer.from(test.toBe)));
		}
		
		it('ASCII / UTF-8 ignore all chars except \\v, \\f, \\t and space', () => {
			
			for (let i = 0; i < 0xff; i++) {
				if (i !== 9 && i !== 11 && i !== 12 && i !== 32) {
					assert.deepEqual(trimTrailingWhitespace(Buffer.from([i])), Buffer.from([i]));
				}
			}
			
		});
		
		it('UTF-8 with BOM ignore all chars except \\v, \\f, \\t and space', () => {
			
			for (let i = 0; i < 0xff; i++) {
				if (i !== 9 && i !== 11 && i !== 12 && i !== 32) {
					assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, i])), Buffer.from([239, 187, 191, i]));
				}
			}
			
		});
		
		it('UTF-16BE ignore all chars except \\v, \\f, \\t and space', () => {
			
			for (let i = 0; i < 0xff; i++) {
				for (let j = 0; j < 0xff; j++) {
					if (i !== 0 && j !== 9 && j !== 11 && j !== 12 && j !== 32) {
						assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, i, j])), Buffer.from([254, 255, i, j]));
					}
				}
			}
			
		});
		
		it('UTF-16LE ignore all chars except \\v, \\f, \\t and space', () => {
			
			for (let i = 0; i < 0xff; i++) {
				for (let j = 0; j < 0xff; j++) {
					if (i !== 9 && i !== 11 && i !== 12 && i !== 32 && j !== 0) {
						assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, i, j])), Buffer.from([255, 254, i, j]));
					}
				}
			}
			
		});
	});
	
});