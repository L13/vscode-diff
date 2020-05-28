import * as assert from 'assert';

import { normalizeLineEnding, trimTrailingWhitespace } from './buffers';

describe('buffers', () => {
	
	describe('.normalizeBuffer()', () => {
		
		it('ASCII / UTF-8 don\'t change \\n', () => {
			
			assert.deepEqual(Buffer.from([10]), normalizeLineEnding(Buffer.from([10])));
			
		});
		
		it('ASCII / UTF-8 change \\r to \\n', () => {
			
			assert.deepEqual(Buffer.from([10]), normalizeLineEnding(Buffer.from([13])));
			
		});
		
		it('ASCII / UTF-8 change \\r\\n to \\n', () => {
			
			assert.deepEqual(Buffer.from([10]), normalizeLineEnding(Buffer.from([13, 10])));
			
		});
		
		it('ASCII / UTF-8 change \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(Buffer.from([10, 10]), normalizeLineEnding(Buffer.from([10, 13])));
			
		});
		
		it('UTF-8 with BOM don\'t change \\n', () => {
			
			assert.deepEqual(Buffer.from([239, 187, 191, 10]), normalizeLineEnding(Buffer.from([239, 187, 191, 10])));
			
		});
		
		it('UTF-8 with BOM change \\r to \\n', () => {
			
			assert.deepEqual(Buffer.from([239, 187, 191, 10]), normalizeLineEnding(Buffer.from([239, 187, 191, 13])));
			
		});
		
		it('UTF-8 with BOM change \\r\\n to \\n', () => {
			
			assert.deepEqual(Buffer.from([239, 187, 191, 10]), normalizeLineEnding(Buffer.from([239, 187, 191, 13, 10])));
			
		});
		
		it('UTF-8 with BOM change \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(Buffer.from([239, 187, 191, 10, 10]), normalizeLineEnding(Buffer.from([239, 187, 191, 10, 13])));
			
		});
		
		it('UTF-16BE don\'t change \\n', () => {
			
			assert.deepEqual(Buffer.from([254, 255, 0, 10]), normalizeLineEnding(Buffer.from([254, 255, 0, 10])));
			
		});
		
		it('UTF-16BE change \\r to \\n', () => {
			
			assert.deepEqual(Buffer.from([254, 255, 0, 10]), normalizeLineEnding(Buffer.from([254, 255, 0, 13])));
			
		});
		
		it('UTF-16BE change \\r\\n to \\n', () => {
			
			assert.deepEqual(Buffer.from([254, 255, 0, 10]), normalizeLineEnding(Buffer.from([254, 255, 0, 13, 0, 10])));
			
		});
		
		it('UTF-16BE change \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(Buffer.from([254, 255, 0, 10, 0, 10]), normalizeLineEnding(Buffer.from([254, 255, 0, 10, 0, 13])));
			
		});
		
		it('UTF-16LE don\'t change \\n', () => {
			
			assert.deepEqual(Buffer.from([254, 255, 10, 0]), normalizeLineEnding(Buffer.from([254, 255, 10, 0])));
			
		});
		
		it('UTF-16LE change \\r to \\n', () => {
			
			assert.deepEqual(Buffer.from([254, 255, 10, 0]), normalizeLineEnding(Buffer.from([254, 255, 13, 0])));
			
		});
		
		it('UTF-16LE change \\r\\n to \\n', () => {
			
			assert.deepEqual(Buffer.from([254, 255, 10, 0]), normalizeLineEnding(Buffer.from([254, 255, 13, 0, 10, 0])));
			
		});
		
		it('UTF-16LE change \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(Buffer.from([254, 255, 10, 0, 10, 0]), normalizeLineEnding(Buffer.from([254, 255, 10, 0, 13, 0])));
			
		});
		
	});
	
	describe('.trimTrailingWhitespace()', () => {
		
		it('ASCII / UTF-8 remove tab', () => {
			
			assert.deepEqual(Buffer.from([]), trimTrailingWhitespace(Buffer.from([9])));
			
		});
		
		it('ASCII / UTF-8 remove vertical tab', () => {
			
			assert.deepEqual(Buffer.from([]), trimTrailingWhitespace(Buffer.from([11])));
			
		});
		
		it('ASCII / UTF-8 remove form feed', () => {
			
			assert.deepEqual(Buffer.from([]), trimTrailingWhitespace(Buffer.from([12])));
			
		});
		
		it('ASCII / UTF-8 remove space', () => {
			
			assert.deepEqual(Buffer.from([]), trimTrailingWhitespace(Buffer.from([32])));
			
		});
		
		it('ASCII / UTF-8 ignore line feed', () => {
			
			assert.deepEqual(Buffer.from([10]), trimTrailingWhitespace(Buffer.from([10])));
			
		});
		
		it('ASCII / UTF-8 ignore carriage return', () => {
			
			assert.deepEqual(Buffer.from([13]), trimTrailingWhitespace(Buffer.from([13])));
			
		});
		
	});
	
});