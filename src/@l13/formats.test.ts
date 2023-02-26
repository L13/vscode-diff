//	Imports ____________________________________________________________________

import * as assert from 'assert';

import type { Plural, Test } from '../types';

import { formatAmount, formatFileSize } from './formats';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________

describe('formats', () => {
	
	describe(`.${formatAmount.name}()`, () => {
		
		function runTests (tests: Test[], measure: Plural) {
			
			for (const test of tests) {
				it(test.desc, () => assert.equal(formatAmount(test.expect, measure), test.toBe));
			}
			
		}
		
		describe('Pixel', () => {
			
			runTests([
				{
					desc: '0 px',
					expect: 0,
					toBe: '0 px',
				},
				{
					desc: '1 px',
					expect: 1,
					toBe: '1 px',
				},
				{
					desc: '2 px',
					expect: 2,
					toBe: '2 px',
				},
				{
					desc: '3 px',
					expect: 3,
					toBe: '3 px',
				},
			], {
				size: 'px',
			});
			
		});
		
		describe('Bytes', () => {
			
			runTests([
				{
					desc: '0 Bytes',
					expect: 0,
					toBe: '0 Bytes',
				},
				{
					desc: '1 Byte',
					expect: 1,
					toBe: '1 Byte',
				},
				{
					desc: '2 Bytes',
					expect: 2,
					toBe: '2 Bytes',
				},
			], {
				size: 'Bytes',
				1: 'Byte',
			});
			
		});
		
	});
	
	describe(`.${formatFileSize.name}()`, () => {
		
		function runTests (tests: Test[]) {
			
			for (const test of tests) {
				it(test.desc, () => assert.equal(formatFileSize(test.expect), test.toBe));
			}
			
		}
		
		describe('Bytes', () => {
			
			runTests([
				{
					desc: '0 Bytes',
					expect: 0,
					toBe: '0 Bytes',
				},
				{
					desc: '1 Byte',
					expect: 1,
					toBe: '1 Byte',
				},
				{
					desc: '2 Bytes',
					expect: 2,
					toBe: '2 Bytes',
				},
				{
					desc: '3 Bytes',
					expect: 3,
					toBe: '3 Bytes',
				},
				{
					desc: '1023 Bytes',
					expect: 1023,
					toBe: '1023 Bytes',
				},
			]);
			
		});
		
		describe('KBytes', () => {
			
			runTests([
				{
					desc: '1 KB (1024 Bytes)',
					expect: 1024,
					toBe: '1 KB (1024 Bytes)',
				},
				{
					desc: '1024 KB (1048575 Bytes)',
					expect: 1048575,
					toBe: '1024 KB (1048575 Bytes)',
				},
			]);
			
		});
		
		describe('MBytes', () => {
			
			runTests([
				{
					desc: '1 MB (1048576 Bytes)',
					expect: 1048576,
					toBe: '1 MB (1048576 Bytes)',
				},
				{
					desc: '1.04 MB (1088576 Bytes)',
					expect: 1088576,
					toBe: '1.04 MB (1088576 Bytes)',
				},
				{
					desc: '1024 MB (1073741823 Bytes)',
					expect: 1073741823,
					toBe: '1024 MB (1073741823 Bytes)',
				},
			]);
			
		});
		
		describe('GBytes', () => {
			
			runTests([
				{
					desc: '1 GB (1073741824 Bytes)',
					expect: 1073741824,
					toBe: '1 GB (1073741824 Bytes)',
				},
				{
					desc: '1024 GB (1099511627775 Bytes)',
					expect: 1099511627775,
					toBe: '1024 GB (1099511627775 Bytes)',
				},
			]);
			
		});
		
		describe('TBytes', () => {
			
			runTests([
				{
					desc: '1 TB (1099511627776 Bytes)',
					expect: 1099511627776,
					toBe: '1 TB (1099511627776 Bytes)',
				},
				{
					desc: '1 PB (1125899906842623 Bytes)',
					expect: 1125899906842623,
					toBe: '1 PB (1125899906842623 Bytes)',
				},
			]);
			
		});
		
		describe('PBytes', () => {
			
			runTests([
				{
					desc: '1 PB (1125899906842624 Bytes)',
					expect: 1125899906842624,
					toBe: '1 PB (1125899906842624 Bytes)',
				},
			//	Number.MAX_SAFE_INTEGER 9007199254740991
				{
					desc: '1024 PB (1152921504606847000 Bytes)',
					// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
					expect: 1152921504606846999,
					toBe: '1024 PB (1152921504606847000 Bytes)',
				},
				{
					desc: '1024 PB (1152921504606847000 Bytes)',
					expect: 1152921504606847000,
					toBe: '1024 PB (1152921504606847000 Bytes)',
				},
			]);
			
		});
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

