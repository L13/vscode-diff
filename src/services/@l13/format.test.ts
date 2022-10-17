//	Imports ____________________________________________________________________

import * as assert from 'assert';

import { formatNameAndDesc } from './formats';

//	Variables __________________________________________________________________

export type Test = {
	desc: string,
	pathA: string,
	pathB: string,
	toBe: string[],
};

//	Initialize _________________________________________________________________

describe('formats', () => {
	
	describe('.formatNameAndDesc()', () => {
		
		function runTests (tests: Test[]) {
			
			for (const test of tests) {
				it(test.desc, () => assert.deepStrictEqual(formatNameAndDesc(test.pathA, test.pathB), test.toBe));
			}
			
		}
		
		describe('diffrent root', () => {
			
			runTests([
				{
					desc: 'one folder',
					pathA: '/a',
					pathB: '/b',
					toBe: ['/a ↔ /b', ''],
				},
				{
					desc: 'two folders',
					pathA: '/a/c',
					pathB: '/b/c',
					toBe: ['/a/c ↔ /b/c', ''],
				},
				{
					desc: 'three folders',
					pathA: '/a/c/d',
					pathB: '/b/c/d',
					toBe: ['/a/c/d ↔ /b/c/d', ''],
				},
			]);
			
		});
		
		describe('same root', () => {
			
			runTests([
				{
					desc: 'one folder',
					pathA: '/a',
					pathB: '/a',
					toBe: ['/a ↔ /a', ''],
				},
				{
					desc: 'two folders',
					pathA: '/a/b',
					pathB: '/a/c',
					toBe: ['b ↔ c', '/a'],
				},
				{
					desc: 'three folders',
					pathA: '/a/b/d',
					pathB: '/a/c/e',
					toBe: ['b/d ↔ c/e', '/a'],
				},
				{
					desc: 'two root folders',
					pathA: '/a/b/d',
					pathB: '/a/b/e',
					toBe: ['d ↔ e', '/a/b'],
				},
				{
					desc: 'empty root',
					pathA: '/a',
					pathB: '/',
					toBe: ['/a ↔ /', ''],
				},
			]);
			
		});
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

