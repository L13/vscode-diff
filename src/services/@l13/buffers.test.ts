//	Imports ____________________________________________________________________

import * as assert from 'assert';

import type { Diff, Test } from '../../types';

import { BOM, detectUTFBOM, MODIFIED, normalizeLineEnding, trimWhitespace } from './buffers';

//	Variables __________________________________________________________________

const diff: Diff = {
	id: '',
	status: 'untracked',
	type: 'unknown',
	ignoredBOM: MODIFIED.NONE,
	ignoredEOL: MODIFIED.NONE,
	ignoredWhitespace: MODIFIED.NONE,
	fileA: null,
	fileB: null,
};

//	Initialize _________________________________________________________________

describe('buffers', () => {
	
	describe('.detectUTFBOM()', () => {
		
		function runTests (tests: Test[]) {
			
			for (const test of tests) {
				it(test.desc, () => assert.strictEqual(detectUTFBOM(Buffer.from(test.expect)), test.toBe));
			}
			
		}
		
		describe('UTF-8 with BOM', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [239, 187, 191],
					toBe: BOM.UTF_8,
				},
				{
					desc: 'just \\n',
					expect: [239, 187, 191, 10],
					toBe: BOM.UTF_8,
				},
			]);
			
			it('all 255 chars', () => {
				
				for (let i = 0; i <= 0xff; i++) {
					assert.strictEqual(detectUTFBOM(Buffer.from([239, 187, 191, i])), BOM.UTF_8);
				}
				
			});
			
		});
		
		describe('UTF-8 without BOM', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [],
					toBe: BOM.NONE,
				},
				{
					desc: 'just \\n',
					expect: [10],
					toBe: BOM.NONE,
				},
			]);
			
			it('all 255 chars', () => {
				
				for (let i = 0; i <= 0xff; i++) {
					assert.deepStrictEqual(detectUTFBOM(Buffer.from([i])), BOM.NONE);
				}
				
			});
			
		});
		
		describe('UTF-16BE with BOM', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [254, 255],
					toBe: BOM.UTF_16BE,
				},
				{
					desc: 'just \\n',
					expect: [254, 255, 10],
					toBe: BOM.UTF_16BE,
				},
			]);
			
			it('all 255 chars', () => {
				
				for (let i = 0; i <= 0xff; i++) {
					assert.strictEqual(detectUTFBOM(Buffer.from([254, 255, i])), BOM.UTF_16BE);
				}
				
			});
			
		});
		
		describe('UTF-16LE with BOM', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [255, 254],
					toBe: BOM.UTF_16LE,
				},
				{
					desc: 'just \\n',
					expect: [255, 254, 10],
					toBe: BOM.UTF_16LE,
				},
			]);
			
			it('all 255 chars', () => {
				
				for (let i = 0; i <= 0xff; i++) {
					assert.strictEqual(detectUTFBOM(Buffer.from([255, 254, i])), BOM.UTF_16LE);
				}
				
			});
			
		});
		
	});
	
	describe('.normalizeLineEnding()', () => {
		
		function runTests (tests: Test[], bom?: BOM) {
			
			for (const test of tests) {
				it(test.desc, () => assert.deepStrictEqual(normalizeLineEnding(Buffer.from(test.expect), diff, MODIFIED.NONE, bom), Buffer.from(test.toBe)));
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
					if (i !== 10 && i !== 13) assert.deepStrictEqual(normalizeLineEnding(Buffer.from([i]), diff, MODIFIED.NONE), Buffer.from([i]));
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
					// eslint-disable-next-line max-len
					if (i !== 10 && i !== 13) assert.deepStrictEqual(normalizeLineEnding(Buffer.from([239, 187, 191, i]), diff, MODIFIED.NONE), Buffer.from([239, 187, 191, i]));
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
						if (!(i === 0 && (j === 10 || j === 13))) {
							assert.deepStrictEqual(normalizeLineEnding(Buffer.from([254, 255, i, j]), diff, MODIFIED.NONE), Buffer.from([254, 255, i, j]));
						}
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
					toBe: [255, 254, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0, 10, 0, 65, 0],
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
						if (!(j === 0 && (i === 10 || i === 13))) {
							assert.deepStrictEqual(normalizeLineEnding(Buffer.from([255, 254, i, j]), diff, MODIFIED.NONE), Buffer.from([255, 254, i, j]));
						}
					}
				}
				
			});
			
		});
		
	});
	
	describe('.trimWhitespace()', () => {
		
		function runTests (tests: Test[], bom?: BOM) {
			
			for (const test of tests) {
				it(test.desc, () => assert.deepStrictEqual(trimWhitespace(Buffer.from(test.expect), diff, MODIFIED.NONE, bom), Buffer.from(test.toBe)));
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
					desc: 'ignore single line tab',
					expect: [9],
					toBe: [9],
				},
				{
					desc: 'ignore single line space',
					expect: [32],
					toBe: [32],
				},
				{
					desc: 'ignore single line tabs',
					expect: [9, 9, 9],
					toBe: [9, 9, 9],
				},
				{
					desc: 'ignore single line  spaces',
					expect: [32, 32, 32],
					toBe: [32, 32, 32],
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
					desc: 'ignore space in between',
					expect: [32, 65, 32, 65, 32],
					toBe: [65, 32, 65],
				},
			]);
			
			it('ignore all chars except \\t and space', () => {
				
				for (let i = 0; i < 0xff; i++) {
					if (i !== 9 && i !== 32) {
						assert.deepStrictEqual(trimWhitespace(Buffer.from([i]), diff, MODIFIED.NONE), Buffer.from([i]));
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
					desc: 'ignore single line tab',
					expect: [239, 187, 191, 9],
					toBe: [239, 187, 191, 9],
				},
				{
					desc: 'ignore single line space',
					expect: [239, 187, 191, 32],
					toBe: [239, 187, 191, 32],
				},
				{
					desc: 'ignore single line tabs',
					expect: [239, 187, 191, 9, 9, 9],
					toBe: [239, 187, 191, 9, 9, 9],
				},
				{
					desc: 'ignore single line  spaces',
					expect: [239, 187, 191, 32, 32, 32],
					toBe: [239, 187, 191, 32, 32, 32],
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
					desc: 'ignore space in between',
					expect: [239, 187, 191, 32, 65, 32, 65, 32],
					toBe: [239, 187, 191, 65, 32, 65],
				},
			]);
			
			it('ignore all chars except \\t and space', () => {
				
				for (let i = 0; i < 0xff; i++) {
					if (i !== 9 && i !== 32) {
						assert.deepStrictEqual(trimWhitespace(Buffer.from([239, 187, 191, i]), diff, MODIFIED.NONE), Buffer.from([239, 187, 191, i]));
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
					desc: 'ignore single line tab',
					expect: [254, 255, 0, 9],
					toBe: [254, 255, 0, 9],
				},
				{
					desc: 'ignore single line space',
					expect: [254, 255, 0, 32],
					toBe: [254, 255, 0, 32],
				},
				{
					desc: 'ignore single line tabs',
					expect: [254, 255, 0, 9, 0, 9, 0, 9],
					toBe: [254, 255, 0, 9, 0, 9, 0, 9],
				},
				{
					desc: 'ignore single line  spaces',
					expect: [254, 255, 0, 32, 0, 32, 0, 32],
					toBe: [254, 255, 0, 32, 0, 32, 0, 32],
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
					desc: 'ignore space in between',
					expect: [254, 255, 0, 32, 0, 65, 0, 32, 0, 65, 0, 32],
					toBe: [254, 255, 0, 65, 0, 32, 0, 65],
				},
			]);
			
			it('ignore all chars except \\t and space', () => {
				
				for (let i = 0; i < 0xff; i++) {
					for (let j = 0; j < 0xff; j++) {
						if (!(i === 0 && (j === 9 || j === 32))) {
							assert.deepStrictEqual(trimWhitespace(Buffer.from([254, 255, i, j]), diff, MODIFIED.NONE), Buffer.from([254, 255, i, j]));
						}
					}
				}
				
			});
			
		});
		
		describe('UTF-16BE without BOM', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [],
					toBe: [],
				},
				{
					desc: 'ignore single line tab',
					expect: [0, 9],
					toBe: [0, 9],
				},
				{
					desc: 'ignore single line space',
					expect: [0, 32],
					toBe: [0, 32],
				},
				{
					desc: 'ignore single line tabs',
					expect: [0, 9, 0, 9, 0, 9],
					toBe: [0, 9, 0, 9, 0, 9],
				},
				{
					desc: 'ignore single line  spaces',
					expect: [0, 32, 0, 32, 0, 32],
					toBe: [0, 32, 0, 32, 0, 32],
				},
				{
					desc: 'ignore line feed',
					expect: [0, 10],
					toBe: [0, 10],
				},
				{
					desc: 'ignore carriage return',
					expect: [0, 13],
					toBe: [0, 13],
				},
				{
					desc: 'ignore multiple line feed',
					expect: [0, 10, 0, 10, 0, 10],
					toBe: [0, 10, 0, 10, 0, 10],
				},
				{
					desc: 'ignore multiple carriage return',
					expect: [0, 13, 0, 13, 0, 13],
					toBe: [0, 13, 0, 13, 0, 13],
				},
				{
					desc: 'ignore multiple carriage return and line feed',
					expect: [0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10],
					toBe: [0, 13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10],
				},
				{
					desc: 'remove trailing tab',
					expect: [0, 9, 0, 65, 0, 9],
					toBe: [0, 65],
				},
				{
					desc: 'remove trailing space',
					expect: [0, 32, 0, 65, 0, 32],
					toBe: [0, 65],
				},
				{
					desc: 'remove multiple trailing tab',
					expect: [0, 9, 0, 9, 0, 9, 0, 9, 0, 65, 0, 9, 0, 9, 0, 9, 0, 9],
					toBe: [0, 65],
				},
				{
					desc: 'remove multiple trailing space',
					expect: [0, 32, 0, 32, 0, 32, 0, 65, 0, 32, 0, 32, 0, 32],
					toBe: [0, 65],
				},
				{
					desc: 'ignore tab in between',
					expect: [0, 9, 0, 65, 0, 9, 0, 65, 0, 9],
					toBe: [0, 65, 0, 9, 0, 65],
				},
				{
					desc: 'ignore space in between',
					expect: [0, 32, 0, 65, 0, 32, 0, 65, 0, 32],
					toBe: [0, 65, 0, 32, 0, 65],
				},
			], BOM.UTF_16BE);
			
			it('ignore all chars except \\t and space', () => {
				
				for (let i = 0; i < 0xff; i++) {
					for (let j = 0; j < 0xff; j++) {
						if (!(i === 0 && (j === 9 || j === 32))) {
							assert.deepStrictEqual(trimWhitespace(Buffer.from([i, j]), diff, MODIFIED.NONE, BOM.UTF_16BE), Buffer.from([i, j]));
						}
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
					desc: 'ignore single line tab',
					expect: [255, 254, 9, 0],
					toBe: [255, 254, 9, 0],
				},
				{
					desc: 'ignore single line space',
					expect: [255, 254, 32, 0],
					toBe: [255, 254, 32, 0],
				},
				{
					desc: 'ignore single line tabs',
					expect: [255, 254, 9, 0, 9, 0, 9, 0],
					toBe: [255, 254, 9, 0, 9, 0, 9, 0],
				},
				{
					desc: 'ignore single line  spaces',
					expect: [255, 254, 32, 0, 32, 0, 32, 0],
					toBe: [255, 254, 32, 0, 32, 0, 32, 0],
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
					desc: 'ignore space in between',
					expect: [255, 254, 32, 0, 65, 0, 32, 0, 65, 0, 32, 0],
					toBe: [255, 254, 65, 0, 32, 0, 65, 0],
				},
			]);
			
			it('ignore all chars except \\t and space', () => {
				
				for (let i = 0; i < 0xff; i++) {
					for (let j = 0; j < 0xff; j++) {
						if (!(j === 0 && (i === 9 || i === 32))) {
							assert.deepStrictEqual(trimWhitespace(Buffer.from([255, 254, i, j]), diff, MODIFIED.NONE), Buffer.from([255, 254, i, j]));
						}
					}
				}
				
			});
			
		});
		
		describe('UTF-16LE without BOM', () => {
			
			runTests([
				{
					desc: 'empty',
					expect: [],
					toBe: [],
				},
				{
					desc: 'ignore single line tab',
					expect: [9, 0],
					toBe: [9, 0],
				},
				{
					desc: 'ignore single line space',
					expect: [32, 0],
					toBe: [32, 0],
				},
				{
					desc: 'ignore single line tabs',
					expect: [9, 0, 9, 0, 9, 0],
					toBe: [9, 0, 9, 0, 9, 0],
				},
				{
					desc: 'ignore single line  spaces',
					expect: [32, 0, 32, 0, 32, 0],
					toBe: [32, 0, 32, 0, 32, 0],
				},
				{
					desc: 'ignore line feed',
					expect: [10, 0],
					toBe: [10, 0],
				},
				{
					desc: 'ignore carriage return',
					expect: [13, 0],
					toBe: [13, 0],
				},
				{
					desc: 'ignore multiple line feed',
					expect: [10, 0, 10, 0, 10, 0],
					toBe: [10, 0, 10, 0, 10, 0],
				},
				{
					desc: 'ignore multiple carriage return',
					expect: [13, 0, 13, 0, 13, 0],
					toBe: [13, 0, 13, 0, 13, 0],
				},
				{
					desc: 'ignore multiple carriage return and line feed',
					expect: [13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0],
					toBe: [13, 0, 10, 0, 13, 0, 10, 0, 13, 0, 10, 0],
				},
				{
					desc: 'remove trailing tab',
					expect: [9, 0, 65, 0, 9, 0],
					toBe: [65, 0],
				},
				{
					desc: 'remove trailing space',
					expect: [32, 0, 65, 0, 32, 0],
					toBe: [65, 0],
				},
				{
					desc: 'remove multiple trailing tab',
					expect: [9, 0, 9, 0, 9, 0, 65, 0, 9, 0, 9, 0, 9, 0],
					toBe: [65, 0],
				},
				{
					desc: 'remove multiple trailing space',
					expect: [32, 0, 32, 0, 32, 0, 65, 0, 32, 0, 32, 0, 32, 0],
					toBe: [65, 0],
				},
				{
					desc: 'ignore tab in between',
					expect: [9, 0, 65, 0, 9, 0, 65, 0, 9, 0],
					toBe: [65, 0, 9, 0, 65, 0],
				},
				{
					desc: 'ignore space in between',
					expect: [32, 0, 65, 0, 32, 0, 65, 0, 32, 0],
					toBe: [65, 0, 32, 0, 65, 0],
				},
			], BOM.UTF_16LE);
			
			it('ignore all chars except \\t and space', () => {
				
				for (let i = 0; i < 0xff; i++) {
					for (let j = 0; j < 0xff; j++) {
						if (!(j === 0 && (i === 9 || i === 32))) {
							assert.deepStrictEqual(trimWhitespace(Buffer.from([i, j]), diff, MODIFIED.NONE, BOM.UTF_16LE), Buffer.from([i, j]));
						}
					}
				}
				
			});
			
		});
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

