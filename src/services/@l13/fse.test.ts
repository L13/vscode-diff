//	Imports ____________________________________________________________________

import * as assert from 'assert';

import { createFindGlob } from './fse';

import { Test } from '../../types';

//	Variables __________________________________________________________________

interface GlobTest extends Test {
	useCaseSensitive:boolean;
};

//	Initialize _________________________________________________________________

describe('fse', () => {
	
	describe('.createFindGlob()', () => {
		
		function runPositiveTests (tests:GlobTest[]) {
			
			for (const test of tests) {
				it(`"${test.expect}" matches "${test.toBe}" (${test.desc})`, () => assert.ok(createFindGlob(test.expect, test.useCaseSensitive).test(test.toBe)));
			}
			
		}
		
		function runNegativeTests (tests:GlobTest[]) {
			
			for (const test of tests) {
				it(`"${test.expect}" doesn't match "${test.toBe}" (${test.desc})`, () => assert.ok(!createFindGlob(test.expect, test.useCaseSensitive).test(test.toBe)));
			}
			
		}
		
		describe('empty', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: [],
					toBe: '',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: [''],
					toBe: '',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: [],
					toBe: 'a',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: [''],
					toBe: 'a',
				},
			]);
			
		});
		
		describe('*', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['*'],
					toBe: 'a',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['*.txt'],
					toBe: '.txt',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['*.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['a*.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['a*.txt'],
					toBe: 'ab.txt',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['a*.txt'],
					toBe: 'abc.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['*.txt'],
					toBe: 'a.tst',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['a*.txt'],
					toBe: 'b.txt',
				},
			]);
			
		});
		
		describe('?', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['?.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['a?.txt'],
					toBe: 'ab.txt',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['a??.txt'],
					toBe: 'abc.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['a?.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['aa?.txt'],
					toBe: 'aa.txt',
				},
			]);
			
		});
		
		describe('**/', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['**/a.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/b.txt'],
					toBe: 'a/b.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/b.txt'],
					toBe: 'a\\b.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/c.txt'],
					toBe: 'a/b/c.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/c.txt'],
					toBe: 'a\\b\\c.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['**/a.txt'],
					toBe: 'ba.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a.txt'],
					toBe: 'c/ba.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a.txt'],
					toBe: 'c\\ba.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a.txt'],
					toBe: 'd/c/ba.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a.txt'],
					toBe: 'd\\c\\ba.txt',
				},
			]);
			
		});
		
		describe('/**/', () => {
			
			runPositiveTests([
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'a/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'a\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'a/b/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'a\\b\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'a/b/c/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'a\\b\\c\\a.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'b/a/c/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'b\\a\\c\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'b/c/a/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'b\\c\\a\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'c/b/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'c\\b\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'd/b/c/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**/a.txt'],
					toBe: 'd\\b\\c\\a.txt',
				},
			]);
			
		});
		
		describe('/**', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'a',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'a/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'a\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'a/b/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'a\\b\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'a/b/c/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'a\\b\\c\\a.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'b/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'b\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'b/a/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'b\\a\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['a/**'],
					toBe: 'c/b/a/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['a\\**'],
					toBe: 'c\\b\\a\\a.txt',
				},
			]);
			
		});
		
		describe('** and *', () => {
			
			runPositiveTests([
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'a/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'a\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'b/a/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'b\\a\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'a/b/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'a\\b\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'c/a/b/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'c\\a\\b\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'c/a/b/d/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'c\\a\\b\\d\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'e/c/a/b/d/a.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'e\\c\\a\\b\\d\\a.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'e/c/a/b/d/ab.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'e\\c\\a\\b\\d\\ab.txt',
				},
				{
					desc: 'posix',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'e/c/a/b/d/abc.txt',
				},
				{
					desc: 'win',
					useCaseSensitive: true,
					expect: ['**/a/**/*.txt'],
					toBe: 'e\\c\\a\\b\\d\\abc.txt',
				},
			]);
			
		});
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

