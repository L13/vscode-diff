import * as assert from 'assert';

import { normalizeLineEnding, trimTrailingWhitespace } from './buffers';

type Test = {
	desc:string,
	expect:number[],
	toBe:number[],
};

describe('buffers', () => {
	
	describe('.normalizeLineEnding()', () => {
		
		function runTests (tests:Test[]) {
			
			for (const test of tests) {
				it(test.desc, () => assert.deepEqual(normalizeLineEnding(Buffer.from(test.expect)), Buffer.from(test.toBe)));
			}
			
		}
		
		describe('ASCII / UTF-8', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [],
					toBe: [],
				},
				{
					desc: 'don\'t change \\n',
					expect: [10],
					toBe: [10],
				},
				{
					desc: 'change \\r to \\n',
					expect: [13],
					toBe: [10],
				},
				{
					desc: 'change \\r\\n to \\n',
					expect: [13, 10],
					toBe: [10],
				},
				{
					desc: 'change \\n\\r to \\n\\n',
					expect: [10, 13],
					toBe: [10, 10],
				},
				{
					desc: 'don\'t change multiple \\n',
					expect: [10, 10, 10],
					toBe: [10, 10, 10],
				},
				{
					desc: 'change multiple \\r to \\n',
					expect: [13, 13, 13],
					toBe: [10, 10, 10],
				},
				{
					desc: 'change multiple \\r\\n to \\n',
					expect: [13, 10, 13, 10, 13, 10],
					toBe: [10, 10, 10],
				},
				{
					desc: 'change multiple \\n\\r to \\n\\n',
					expect: [10, 13, 10, 13, 10, 13],
					toBe: [10, 10, 10, 10],
				},
				{
					desc: 'don\'t change multiple \\n with content',
					expect: [65, 10, 65, 10, 65, 10, 65],
					toBe: [65, 10, 65, 10, 65, 10, 65],
				},
				{
					desc: 'change multiple \\r to \\n with content',
					expect: [65, 13, 65, 13, 65, 13, 65],
					toBe: [65, 10, 65, 10, 65, 10, 65],
				},
				{
					desc: 'change multiple \\r\\n to \\n with content',
					expect: [65, 13, 10, 65, 13, 10, 65, 13, 10, 65],
					toBe: [65, 10, 65, 10, 65, 10, 65],
				},
			]);
			
			it('ignore all chars except \\r and \\n', () => {
				
				for (let i = 0; i < 0xff; i++) {
					if (i !== 10 && i !== 13) assert.deepEqual(normalizeLineEnding(Buffer.from([i])), Buffer.from([i]));
				}
				
			});
			
		});
		
		describe('UTF-8 with BOM', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [239, 187, 191],
					toBe: [239, 187, 191],
				},
				{
					desc: 'don\'t change \\n',
					expect: [239, 187, 191, 10],
					toBe: [239, 187, 191, 10],
				},
				{
					desc: 'change \\r to \\n',
					expect: [239, 187, 191, 13],
					toBe: [239, 187, 191, 10],
				},
				{
					desc: 'change \\r\\n to \\n',
					expect: [239, 187, 191, 13, 10],
					toBe: [239, 187, 191, 10],
				},
				{
					desc: 'change \\n\\r to \\n\\n',
					expect: [239, 187, 191, 10, 13],
					toBe: [239, 187, 191, 10, 10],
				},
				{
					desc: 'don\'t change multiple \\n',
					expect: [239, 187, 191, 10, 10, 10],
					toBe: [239, 187, 191, 10, 10, 10],
				},
				{
					desc: 'change multiple \\r to \\n',
					expect: [239, 187, 191, 13, 13, 13],
					toBe: [239, 187, 191, 10, 10, 10],
				},
				{
					desc: 'change multiple \\r\\n to \\n',
					expect: [239, 187, 191, 13, 10, 13, 10, 13, 10],
					toBe: [239, 187, 191, 10, 10, 10],
				},
				{
					desc: 'change multiple \\n\\r to \\n\\n',
					expect: [239, 187, 191, 10, 13, 10, 13, 10, 13],
					toBe: [239, 187, 191, 10, 10, 10, 10],
				},
				{
					desc: 'don\'t change multiple \\n with content',
					expect: [239, 187, 191, 65, 10, 65, 10, 65, 10],
					toBe: [239, 187, 191, 65, 10, 65, 10, 65, 10],
				},
				{
					desc: 'change multiple \\r to \\n with content',
					expect: [239, 187, 191, 65, 13, 65, 13, 65, 13, 65],
					toBe: [239, 187, 191, 65, 10, 65, 10, 65, 10, 65],
				},
				{
					desc: 'change multiple \\r\\n to \\n with content',
					expect: [239, 187, 191, 65, 13, 10, 65, 13, 10, 65, 13, 10, 65],
					toBe: [239, 187, 191, 65, 10, 65, 10, 65, 10, 65],
				},
			]);
		
			it('ignore all chars except \\r and \\n', () => {
				
				for (let i = 0; i < 0xff; i++) {
					if (i !== 10 && i !== 13) assert.deepEqual(normalizeLineEnding(Buffer.from([239, 187, 191, i])), Buffer.from([239, 187, 191, i]));
				}
				
			});
			
		});
		
		describe('UTF-16BE', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [254, 255],
					toBe: [254, 255],
				},
				{
					desc: 'don\'t change \\n',
					expect: [254, 255, 0, 10],
					toBe: [254, 255, 0, 10],
				},
				{
					desc: 'change \\r to \\n',
					expect: [254, 255, 0, 13],
					toBe: [254, 255, 0, 10],
				},
				{
					desc: 'change \\r\\n to \\n',
					expect: [254, 255, 0, 13, 0, 10],
					toBe: [254, 255, 0, 10],
				},
				{
					desc: 'change \\n\\r to \\n\\n',
					expect: [254, 255, 0, 10, 0, 13],
					toBe: [254, 255, 0, 10, 0, 10],
				},
				{
					desc: 'don\'t change multiple \\n',
					expect: [254, 255, 0, 10, 0, 10, 0, 10],
					toBe: [254, 255, 0, 10, 0, 10, 0, 10],
				},
				{
					desc: 'change multiple \\r to \\n',
					expect: [254, 255, 0, 13, 0, 13, 0, 13],
					toBe: [254, 255, 0, 10, 0, 10, 0, 10],
				},
				{
					desc: 'change multiple \\r\\n to \\n',
					expect: [254, 255, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10],
					toBe: [254, 255, 0, 10, 0, 10, 0, 10],
				},
				{
					desc: 'change multiple \\n\\r to \\n\\n',
					expect: [254, 255, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13],
					toBe: [254, 255, 0, 10, 0, 10, 0, 10, 0, 10],
				},
				{
					desc: 'don\'t change multiple \\n with content',
					expect: [254, 255, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65],
					toBe: [254, 255, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65],
				},
				{
					desc: 'change multiple \\r to \\n with content',
					expect: [254, 255, 0, 65, 0, 13, 0, 65, 0, 13, 0, 65, 0, 13, 0, 65],
					toBe: [254, 255, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65],
				},
				{
					desc: 'change multiple \\r\\n to \\n with content',
					expect: [254, 255, 0, 65, 0, 13, 0, 10, 0, 65, 0, 13, 0, 10, 0, 65, 0, 13, 0, 10, 0, 65],
					toBe: [254, 255, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65],
				},
			]);
		
			it('ignore all chars except \\r and \\n', () => {
				
				for (let i = 0; i < 0xff; i++) {
					for (let j = 0; j < 0xff; j++) {
						if (i !== 0 && j !== 10 && j !== 13) assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, i, j])), Buffer.from([254, 255, i, j]));
					}
				}
				
			});
			
		});
		
		describe('UTF-16LE', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [255, 254],
					toBe: [255, 254],
				},
				{
					desc: 'don\'t change \\n',
					expect: [255, 254, 10, 0],
					toBe: [255, 254, 10, 0],
				},
				{
					desc: 'change \\r to \\n',
					expect: [255, 254, 13, 0],
					toBe: [255, 254, 10, 0],
				},
				{
					desc: 'change \\r\\n to \\n',
					expect: [255, 254, 13, 0, 10, 0],
					toBe: [255, 254, 10, 0],
				},
				{
					desc: 'change \\n\\r to \\n\\n',
					expect: [255, 254, 10, 0, 13, 0],
					toBe: [255, 254, 10, 0, 10, 0],
				},
				{
					desc: 'don\'t change multiple \\n',
					expect: [255, 254, 10, 0, 10, 0, 10, 0],
					toBe: [255, 254, 10, 0, 10, 0, 10, 0],
				},
				{
					desc: 'change multiple \\r to \\n',
					expect: [255, 254, 13, 0, 13, 0, 13, 0],
					toBe: [255, 254, 10, 0, 10, 0, 10, 0],
				},
				{
					desc: 'change multiple \\r\\n to \\n',
					expect: [255, 254, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0],
					toBe: [255, 254, 10, 0, 10, 0, 10, 0],
				},
				{
					desc: 'change multiple \\n\\r to \\n\\n',
					expect: [255, 254, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0],
					toBe: [255, 254, 10, 0, 10, 0, 10, 0, 10, 0],
				},
				{
					desc: 'don\'t change multiple \\n with content',
					expect: [255, 254, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0],
					toBe: [255, 254, 65, 0 , 10, 0, 65, 0 , 10, 0, 65, 0 , 10, 0, 65, 0],
				},
				{
					desc: 'change multiple \\r to \\n with content',
					expect: [255, 254, 65, 0, 13, 0, 65, 0, 13, 0, 65, 0, 13, 0, 65, 0],
					toBe: [255, 254, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0],
				},
				{
					desc: 'change multiple \\r\\n to \\n with content',
					expect: [255, 254, 65, 0, 13, 0, 10, 0, 65, 0, 13, 0, 10, 0, 65, 0, 13, 0, 10, 0, 65, 0],
					toBe: [255, 254, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0],
				},
			]);
		
			it('ignore all chars except \\r and \\n', () => {
				
				for (let i = 0; i < 0xff; i++) {
					for (let j = 0; j < 0xff; j++) {
						if (i !== 10 && i !== 13 && j !== 0) assert.deepEqual(normalizeLineEnding(Buffer.from([255, 254, i, j])), Buffer.from([255, 254, i, j]));
					}
				}
				
			});
			
		});
		
	});
	
	describe('.trimTrailingWhitespace()', () => {
		
		function runTests (tests:Test[]) {
			
			for (const test of tests) {
				it(test.desc, () => assert.deepEqual(trimTrailingWhitespace(Buffer.from(test.expect)), Buffer.from(test.toBe)));
			}
			
		}
		
		describe('ASCII / UTF-8', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [],
					toBe: [],
				},
				{
					desc: 'remove tab',
					expect: [9],
					toBe: [],
				},
				{
					desc: 'remove vertical tab',
					expect: [11],
					toBe: [],
				},
				{
					desc: 'remove form feed',
					expect: [12],
					toBe: [],
				},
				{
					desc: 'remove space',
					expect: [32],
					toBe: [],
				},
				{
					desc: 'remove multiple tab',
					expect: [9, 9, 9],
					toBe: [],
				},
				{
					desc: 'remove multiple vertical tab',
					expect: [11, 11, 11],
					toBe: [],
				},
				{
					desc: 'remove multiple form feed',
					expect: [12, 12, 12],
					toBe: [],
				},
				{
					desc: 'remove multiple space',
					expect: [32, 32, 32],
					toBe: [],
				},
				{
					desc: 'ignore line feed',
					expect: [10],
					toBe: [10],
				},
				{
					desc: 'ignore carriage return',
					expect: [13],
					toBe: [13],
				},
				{
					desc: 'ignore carriage return and line feed',
					expect: [13, 10],
					toBe: [13, 10],
				},
				{
					desc: 'ignore multiple line feed',
					expect: [10, 10, 10],
					toBe: [10, 10, 10],
				},
				{
					desc: 'ignore multiple carriage return',
					expect: [13, 13, 13],
					toBe: [13, 13, 13],
				},
				{
					desc: 'ignore multiple carriage return and line feed',
					expect: [13, 10, 13, 10, 13, 10],
					toBe: [13, 10, 13, 10, 13, 10],
				},
				{
					desc: 'remove trailing tab',
					expect: [9, 65, 9],
					toBe: [65],
				},
				{
					desc: 'remove trailing vertical tab',
					expect: [11, 65, 11],
					toBe: [65],
				},
				{
					desc: 'remove trailing form feed',
					expect: [12, 65, 12],
					toBe: [65],
				},
				{
					desc: 'remove trailing space',
					expect: [32, 65, 32],
					toBe: [65],
				},
				{
					desc: 'remove multipe trailing tab',
					expect: [9, 9, 9, 65, 9, 9, 9],
					toBe: [65],
				},
				{
					desc: 'remove multipe trailing vertical tab',
					expect: [11, 11, 11, 65, 11, 11, 11],
					toBe: [65],
				},
				{
					desc: 'remove multipe trailing form feed',
					expect: [12, 12, 12, 65, 12, 12, 12],
					toBe: [65],
				},
				{
					desc: 'remove multipe trailing space',
					expect: [32, 32, 32, 65, 32, 32, 32],
					toBe: [65],
				},
				{
					desc: 'ignore tab in between',
					expect: [9, 65, 9, 65, 9],
					toBe: [65, 9, 65],
				},
				{
					desc: 'ignore vertical tab in between',
					expect: [11, 65, 11, 65, 11],
					toBe: [65, 11, 65],
				},
				{
					desc: 'ignore form feed in between',
					expect: [12, 65, 12, 65, 12],
					toBe: [65, 12, 65],
				},
				{
					desc: 'ignore space in between',
					expect: [32, 65, 32, 65, 32],
					toBe: [65, 32, 65],
				},
			]);
		
			it('ignore all chars except \\v, \\f, \\t and space', () => {
				
				for (let i = 0; i < 0xff; i++) {
					if (i !== 9 && i !== 11 && i !== 12 && i !== 32) {
						assert.deepEqual(trimTrailingWhitespace(Buffer.from([i])), Buffer.from([i]));
					}
				}
				
			});
			
		});
		
		describe('UTF-8 with BOM', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [239, 187, 191],
					toBe: [239, 187, 191],
				},
				{
					desc: 'remove tab',
					expect: [239, 187, 191, 9],
					toBe: [239, 187, 191],
				},
				{
					desc: 'remove vertical tab',
					expect: [239, 187, 191, 11],
					toBe: [239, 187, 191],
				},
				{
					desc: 'remove form feed',
					expect: [239, 187, 191, 12],
					toBe: [239, 187, 191],
				},
				{
					desc: 'remove space',
					expect: [239, 187, 191, 32],
					toBe: [239, 187, 191],
				},
				{
					desc: 'remove multiple tab',
					expect: [239, 187, 191, 9, 9, 9],
					toBe: [239, 187, 191],
				},
				{
					desc: 'remove multiple vertical tab',
					expect: [239, 187, 191, 11, 11, 11],
					toBe: [239, 187, 191],
				},
				{
					desc: 'remove multiple form feed',
					expect: [239, 187, 191, 12, 12, 12],
					toBe: [239, 187, 191],
				},
				{
					desc: 'remove multiple space',
					expect: [239, 187, 191, 32, 32, 32],
					toBe: [239, 187, 191],
				},
				{
					desc: 'ignore line feed',
					expect: [239, 187, 191, 10],
					toBe: [239, 187, 191, 10],
				},
				{
					desc: 'ignore carriage return',
					expect: [239, 187, 191, 13],
					toBe: [239, 187, 191, 13],
				},
				{
					desc: 'ignore multiple line feed',
					expect: [239, 187, 191, 10, 10, 10],
					toBe: [239, 187, 191, 10, 10, 10],
				},
				{
					desc: 'ignore multiple carriage return',
					expect: [239, 187, 191, 13, 13, 13],
					toBe: [239, 187, 191, 13, 13, 13],
				},
				{
					desc: 'ignore multiple carriage return and line feed',
					expect: [239, 187, 191, 13, 10, 13, 10, 13, 10],
					toBe: [239, 187, 191, 13, 10, 13, 10, 13, 10],
				},
				{
					desc: 'remove trailing tab',
					expect: [239, 187, 191, 9, 65, 9],
					toBe: [239, 187, 191, 65],
				},
				{
					desc: 'remove trailing vertical tab',
					expect: [239, 187, 191, 11, 65, 11],
					toBe: [239, 187, 191, 65],
				},
				{
					desc: 'remove trailing form feed',
					expect: [239, 187, 191, 12, 65, 12],
					toBe: [239, 187, 191, 65],
				},
				{
					desc: 'remove trailing space',
					expect: [239, 187, 191, 32, 65, 32],
					toBe: [239, 187, 191, 65],
				},
				{
					desc: 'remove multiple trailing tab',
					expect: [239, 187, 191, 9, 9, 9, 65, 9, 9, 9],
					toBe: [239, 187, 191, 65],
				},
				{
					desc: 'remove multiple trailing vertical tab',
					expect: [239, 187, 191, 11, 11, 11, 65, 11, 11, 11],
					toBe: [239, 187, 191, 65],
				},
				{
					desc: 'remove multiple trailing form feed',
					expect: [239, 187, 191, 12, 12, 12, 65, 12, 12, 12],
					toBe: [239, 187, 191, 65],
				},
				{
					desc: 'remove multiple trailing space',
					expect: [239, 187, 191, 32, 32, 32, 65, 32, 32, 32],
					toBe: [239, 187, 191, 65],
				},
				{
					desc: 'ignore tab in between',
					expect: [239, 187, 191, 9, 65, 9, 65, 9],
					toBe: [239, 187, 191, 65, 9, 65],
				},
				{
					desc: 'ignore vertical tab in between',
					expect: [239, 187, 191, 11, 65, 11, 65, 11],
					toBe: [239, 187, 191, 65, 11, 65],
				},
				{
					desc: 'ignore form feed in between',
					expect: [239, 187, 191, 12, 65, 12, 65, 12],
					toBe: [239, 187, 191, 65, 12, 65],
				},
				{
					desc: 'ignore space in between',
					expect: [239, 187, 191, 32, 65, 32, 65, 32],
					toBe: [239, 187, 191, 65, 32, 65],
				},
			]);
		
			it('ignore all chars except \\v, \\f, \\t and space', () => {
				
				for (let i = 0; i < 0xff; i++) {
					if (i !== 9 && i !== 11 && i !== 12 && i !== 32) {
						assert.deepEqual(trimTrailingWhitespace(Buffer.from([239, 187, 191, i])), Buffer.from([239, 187, 191, i]));
					}
				}
				
			});
			
		});
		
		describe('UTF-16BE', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [254, 255],
					toBe: [254, 255],
				},
				{
					desc: 'remove tab',
					expect: [254, 255, 0, 9],
					toBe: [254, 255],
				},
				{
					desc: 'remove vertical tab',
					expect: [254, 255, 0, 11],
					toBe: [254, 255],
				},
				{
					desc: 'remove form feed',
					expect: [254, 255, 0, 12],
					toBe: [254, 255],
				},
				{
					desc: 'remove space',
					expect: [254, 255, 0, 32],
					toBe: [254, 255],
				},
				{
					desc: 'remove multiple tab',
					expect: [254, 255, 0, 9, 0, 9, 0, 9],
					toBe: [254, 255],
				},
				{
					desc: 'remove multiple vertical tab',
					expect: [254, 255, 0, 11, 0, 11, 0, 11],
					toBe: [254, 255],
				},
				{
					desc: 'remove multiple form feed',
					expect: [254, 255, 0, 12, 0, 12, 0, 12],
					toBe: [254, 255],
				},
				{
					desc: 'remove multiple space',
					expect: [254, 255, 0, 32, 0, 32, 0, 32],
					toBe: [254, 255],
				},
				{
					desc: 'ignore line feed',
					expect: [254, 255, 0, 10],
					toBe: [254, 255, 0, 10],
				},
				{
					desc: 'ignore carriage return',
					expect: [254, 255, 0, 13],
					toBe: [254, 255, 0, 13],
				},
				{
					desc: 'ignore multiple line feed',
					expect: [254, 255, 0, 10, 0, 10, 0, 10],
					toBe: [254, 255, 0, 10, 0, 10, 0, 10],
				},
				{
					desc: 'ignore multiple carriage return',
					expect: [254, 255, 0, 13, 0, 13, 0, 13],
					toBe: [254, 255, 0, 13, 0, 13, 0, 13],
				},
				{
					desc: 'ignore multiple carriage return and line feed',
					expect: [254, 255, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10],
					toBe: [254, 255, 0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10],
				},
				{
					desc: 'remove trailing tab',
					expect: [254, 255, 0, 9, 0, 65, 0, 9],
					toBe: [254, 255, 0, 65],
				},
				{
					desc: 'remove trailing vertical tab',
					expect: [254, 255, 0, 11, 0, 65, 0, 11],
					toBe: [254, 255, 0, 65],
				},
				{
					desc: 'remove trailing form feed',
					expect: [254, 255, 0, 12, 0, 65, 0, 12],
					toBe: [254, 255, 0, 65],
				},
				{
					desc: 'remove trailing space',
					expect: [254, 255, 0, 32, 0, 65, 0, 32],
					toBe: [254, 255, 0, 65],
				},
				{
					desc: 'remove multiple trailing tab',
					expect: [254, 255, 0, 9, 0, 9, 0, 9, 0, 9, 0, 65, 0, 9, 0, 9, 0, 9, 0, 9],
					toBe: [254, 255, 0, 65],
				},
				{
					desc: 'remove multiple trailing vertical tab',
					expect: [254, 255, 0, 11, 0, 11, 0, 11, 0, 65, 0, 11, 0, 11, 0, 11],
					toBe: [254, 255, 0, 65],
				},
				{
					desc: 'remove multiple trailing form feed',
					expect: [254, 255, 0, 12, 0, 12, 0, 12, 0, 65, 0, 12, 0, 12, 0, 12],
					toBe: [254, 255, 0, 65],
				},
				{
					desc: 'remove multiple trailing space',
					expect: [254, 255, 0, 32, 0, 32, 0, 32, 0, 65, 0, 32, 0, 32, 0, 32],
					toBe: [254, 255, 0, 65],
				},
				{
					desc: 'ignore tab in between',
					expect: [254, 255, 0, 9, 0, 65, 0, 9, 0, 65, 0, 9],
					toBe: [254, 255, 0, 65, 0, 9, 0, 65],
				},
				{
					desc: 'ignore vertical tab in between',
					expect: [254, 255, 0, 11, 0, 65, 0, 11, 0, 65, 0, 11],
					toBe: [254, 255, 0, 65, 0, 11, 0, 65],
				},
				{
					desc: 'ignore form feed in between',
					expect: [254, 255, 0, 12, 0, 65, 0, 12, 0, 65, 0, 12],
					toBe: [254, 255, 0, 65, 0, 12, 0, 65],
				},
				{
					desc: 'ignore space in between',
					expect: [254, 255, 0, 32, 0, 65, 0, 32, 0, 65, 0, 32],
					toBe: [254, 255, 0, 65, 0, 32, 0, 65],
				},
			]);
		
			it('ignore all chars except \\v, \\f, \\t and space', () => {
				
				for (let i = 0; i < 0xff; i++) {
					for (let j = 0; j < 0xff; j++) {
						if (i !== 0 && j !== 9 && j !== 11 && j !== 12 && j !== 32) {
							assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, i, j])), Buffer.from([254, 255, i, j]));
						}
					}
				}
				
			});
			
		});
		
		describe('ASCII / UTF-8', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [255, 254],
					toBe: [255, 254],
				},
				{
					desc: 'remove tab',
					expect: [255, 254, 9, 0],
					toBe: [255, 254],
				},
				{
					desc: 'remove vertical tab',
					expect: [255, 254, 11, 0],
					toBe: [255, 254],
				},
				{
					desc: 'remove form feed',
					expect: [255, 254, 12, 0],
					toBe: [255, 254],
				},
				{
					desc: 'remove space',
					expect: [255, 254, 32, 0],
					toBe: [255, 254],
				},
				{
					desc: 'remove multiple tab',
					expect: [255, 254, 9, 0, 9, 0, 9, 0],
					toBe: [255, 254],
				},
				{
					desc: 'remove multiple vertical tab',
					expect: [255, 254, 11, , 11, , 11, 0],
					toBe: [255, 254],
				},
				{
					desc: 'remove multiple form feed',
					expect: [255, 254, 12, , 12, , 12, 0],
					toBe: [255, 254],
				},
				{
					desc: 'remove multiple space',
					expect: [255, 254, 32, , 32, , 32, 0],
					toBe: [255, 254],
				},
				{
					desc: 'ignore line feed',
					expect: [255, 254, 10, 0],
					toBe: [255, 254, 10, 0],
				},
				{
					desc: 'ignore carriage return',
					expect: [255, 254, 13, 0],
					toBe: [255, 254, 13, 0],
				},
				{
					desc: 'ignore multiple line feed',
					expect: [255, 254, 10, 0, 10, 0, 10, 0],
					toBe: [255, 254, 10, 0, 10, 0, 10, 0],
				},
				{
					desc: 'ignore multiple carriage return',
					expect: [255, 254, 13, 0, 13, 0, 13, 0],
					toBe: [255, 254, 13, 0, 13, 0, 13, 0],
				},
				{
					desc: 'ignore multiple carriage return and line feed',
					expect: [255, 254, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0],
					toBe: [255, 254, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0],
				},
				{
					desc: 'remove trailing tab',
					expect: [255, 254, 9, 0, 65, 0, 9, 0],
					toBe: [255, 254, 65, 0],
				},
				{
					desc: 'remove trailing vertical tab',
					expect: [255, 254, 11, 0, 65, 0, 11, 0],
					toBe: [255, 254, 65, 0],
				},
				{
					desc: 'remove trailing form feed',
					expect: [255, 254, 12, 0, 65, 0, 12, 0],
					toBe: [255, 254, 65, 0],
				},
				{
					desc: 'remove trailing space',
					expect: [255, 254, 32, 0, 65, 0, 32, 0],
					toBe: [255, 254, 65, 0],
				},
				{
					desc: 'remove multiple trailing tab',
					expect: [255, 254, 9, 0, 9, 0, 9, 0, 65, 0, 9, 0, 9, 0, 9, 0],
					toBe: [255, 254, 65, 0],
				},
				{
					desc: 'remove multiple trailing vertical tab',
					expect: [255, 254, 11, 0, 11, 0, 11, 0, 65, 0, 11, 0, 11, 0, 11, 0],
					toBe: [255, 254, 65, 0],
				},
				{
					desc: 'remove multiple trailing form feed',
					expect: [255, 254, 12, 0, 12, 0, 12, 0, 65, 0, 12, 0, 12, 0, 12, 0],
					toBe: [255, 254, 65, 0],
				},
				{
					desc: 'remove multiple trailing space',
					expect: [255, 254, 32, 0, 32, 0, 32, 0, 65, 0, 32, 0, 32, 0, 32, 0],
					toBe: [255, 254, 65, 0],
				},
				{
					desc: 'ignore tab in between',
					expect: [255, 254, 9, 0, 65, 0, 9, 0, 65, 0, 9, 0],
					toBe: [255, 254, 65, 0, 9, 0, 65, 0],
				},
				{
					desc: 'ignore vertical tab in between',
					expect: [255, 254, 11, 0, 65, 0, 11, 0, 65, 0, 11, 0],
					toBe: [255, 254, 65, 0, 11, 0, 65, 0],
				},
				{
					desc: 'ignore form feed in between',
					expect: [255, 254, 12, 0, 65, 0, 12, 0, 65, 0, 12, 0],
					toBe: [255, 254, 65, 0, 12, 0, 65, 0],
				},
				{
					desc: 'ignore space in between',
					expect: [255, 254, 32, 0, 65, 0, 32, 0, 65, 0, 32, 0],
					toBe: [255, 254, 65, 0, 32, 0, 65, 0],
				},
			]);
		
			it('ignore all chars except \\v, \\f, \\t and space', () => {
				
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
	
});