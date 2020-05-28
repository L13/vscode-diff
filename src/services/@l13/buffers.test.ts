import * as assert from 'assert';

import { normalizeLineEnding, trimTrailingWhitespace } from './buffers';

describe('buffers', () => {
	
	describe('.normalizeBuffer()', () => {
		
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
		
		it('UTF-16LE don\'t change \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 10, 0])), Buffer.from([254, 255, 10, 0]));
			
		});
		
		it('UTF-16LE change \\r to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 13, 0])), Buffer.from([254, 255, 10, 0]));
			
		});
		
		it('UTF-16LE change \\r\\n to \\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 13, 0, 10, 0])), Buffer.from([254, 255, 10, 0]));
			
		});
		
		it('UTF-16LE change \\n\\r to \\n\\n', () => {
			
			assert.deepEqual(normalizeLineEnding(Buffer.from([254, 255, 10, 0, 13, 0])), Buffer.from([254, 255, 10, 0, 10, 0]));
			
		});
		
	});
	
	describe('.trimTrailingWhitespace()', () => {
		
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
		
		it('ASCII / UTF-8 ignore line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([10])), Buffer.from([10]));
			
		});
		
		it('ASCII / UTF-8 ignore carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([13])), Buffer.from([13]));
			
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
		
		it('UTF-16BE ignore line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 10])), Buffer.from([254, 255, 0, 10]));
			
		});
		
		it('UTF-16BE ignore carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([254, 255, 0, 13])), Buffer.from([254, 255, 0, 13]));
			
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
		
		it('UTF-16LE ignore line feed', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 10, 0])), Buffer.from([255, 254, 10, 0]));
			
		});
		
		it('UTF-16LE ignore carriage return', () => {
			
			assert.deepEqual(trimTrailingWhitespace(Buffer.from([255, 254, 13, 0])), Buffer.from([255, 254, 13, 0]));
			
		});
		
	});
	
});