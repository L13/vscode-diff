//	Imports ____________________________________________________________________

import * as assert from 'assert';

import { createFindGlob } from './fse';

import { Test } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________

describe('fse', () => {
	
	describe('.createFindGlob()', () => {
		
		function runPositiveTests (tests:Test[]) {
			
			for (const test of tests) {
				it(`"${test.expect}" matches "${test.toBe}" (${test.desc})`, () => assert.ok(createFindGlob(test.expect).test(test.toBe)));
			}
			
		}
		
		function runNegativeTests (tests:Test[]) {
			
			for (const test of tests) {
				it(`"${test.expect}" doesn't match "${test.toBe}" (${test.desc})`, () => assert.ok(!createFindGlob(test.expect).test(test.toBe)));
			}
			
		}
		
		describe('empty', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					expect: [],
					toBe: '',
				},
				{
					desc: 'win and posix',
					expect: [''],
					toBe: '',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'win and posix',
					expect: [],
					toBe: 'a',
				},
				{
					desc: 'win and posix',
					expect: [''],
					toBe: 'a',
				},
			]);
			
		});
		
		describe('*', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					expect: ['*'],
					toBe: 'a',
				},
				{
					desc: 'win and posix',
					expect: ['*.txt'],
					toBe: '.txt',
				},
				{
					desc: 'win and posix',
					expect: ['*.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'win and posix',
					expect: ['a*.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'win and posix',
					expect: ['a*.txt'],
					toBe: 'ab.txt',
				},
				{
					desc: 'win and posix',
					expect: ['a*.txt'],
					toBe: 'abc.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'win and posix',
					expect: ['*.txt'],
					toBe: 'a.tst',
				},
				{
					desc: 'win and posix',
					expect: ['a*.txt'],
					toBe: 'b.txt',
				},
			]);
			
		});
		
		describe('?', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					expect: ['a?.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'win and posix',
					expect: ['ab?.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'win and posix',
					expect: ['ab?.txt'],
					toBe: 'ab.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'win and posix',
					expect: ['ab?.txt'],
					toBe: 'aa.txt',
				},
				{
					desc: 'win and posix',
					expect: ['ab?.txt'],
					toBe: 'ac.txt',
				},
			]);
			
		});
		
		describe('**/', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					expect: ['**/a.txt'],
					toBe: 'a.txt',
				},
				{
					desc: 'posix',
					expect: ['**/b.txt'],
					toBe: 'a/b.txt',
				},
				{
					desc: 'win',
					expect: ['**/b.txt'],
					toBe: 'a\\b.txt',
				},
				{
					desc: 'posix',
					expect: ['**/c.txt'],
					toBe: 'a/b/c.txt',
				},
				{
					desc: 'win',
					expect: ['**/c.txt'],
					toBe: 'a\\b\\c.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'win and posix',
					expect: ['**/a.txt'],
					toBe: 'ba.txt',
				},
				{
					desc: 'posix',
					expect: ['**/a.txt'],
					toBe: 'c/ba.txt',
				},
				{
					desc: 'win',
					expect: ['**/a.txt'],
					toBe: 'c\\ba.txt',
				},
				{
					desc: 'posix',
					expect: ['**/a.txt'],
					toBe: 'd/c/ba.txt',
				},
				{
					desc: 'win',
					expect: ['**/a.txt'],
					toBe: 'd\\c\\ba.txt',
				},
			]);
			
		});
		
		describe('/**/', () => {
			
			runPositiveTests([
				{
					desc: 'posix',
					expect: ['a/**/a.txt'],
					toBe: 'a/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**/a.txt'],
					toBe: 'a\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['a/**/a.txt'],
					toBe: 'a/b/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**/a.txt'],
					toBe: 'a\\b\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['a/**/a.txt'],
					toBe: 'a/b/c/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**/a.txt'],
					toBe: 'a\\b\\c\\a.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'posix',
					expect: ['a/**/a.txt'],
					toBe: 'b/a/c/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**/a.txt'],
					toBe: 'b\\a\\c\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['a/**/a.txt'],
					toBe: 'b/c/a/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**/a.txt'],
					toBe: 'b\\c\\a\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['a/**/a.txt'],
					toBe: 'c/b/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**/a.txt'],
					toBe: 'c\\b\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['a/**/a.txt'],
					toBe: 'd/b/c/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**/a.txt'],
					toBe: 'd\\b\\c\\a.txt',
				},
			]);
			
		});
		
		describe('/**', () => {
			
			runPositiveTests([
				{
					desc: 'win and posix',
					expect: ['a/**'],
					toBe: 'a',
				},
				{
					desc: 'posix',
					expect: ['a/**'],
					toBe: 'a/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**'],
					toBe: 'a\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['a/**'],
					toBe: 'a/b/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**'],
					toBe: 'a\\b\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['a/**'],
					toBe: 'a/b/c/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**'],
					toBe: 'a\\b\\c\\a.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: 'posix',
					expect: ['a/**'],
					toBe: 'b/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**'],
					toBe: 'b\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['a/**'],
					toBe: 'b/a/a.txt',
				},
				{
					desc: 'win',
					expect: ['a/**'],
					toBe: 'b\\a\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['a/**'],
					toBe: 'c/b/a/a.txt',
				},
				{
					desc: 'win',
					expect: ['a\\**'],
					toBe: 'c\\b\\a\\a.txt',
				},
			]);
			
		});
		
		describe('** and *', () => {
			
			runPositiveTests([
				{
					desc: 'posix',
					expect: ['**/a/**/*.txt'],
					toBe: 'a/a.txt',
				},
				{
					desc: 'win',
					expect: ['**/a/**/*.txt'],
					toBe: 'a\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['**/a/**/*.txt'],
					toBe: 'b/a/a.txt',
				},
				{
					desc: 'win',
					expect: ['**/a/**/*.txt'],
					toBe: 'b\\a\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['**/a/**/*.txt'],
					toBe: 'a/b/a.txt',
				},
				{
					desc: 'win',
					expect: ['**/a/**/*.txt'],
					toBe: 'a\\b\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['**/a/**/*.txt'],
					toBe: 'c/a/b/a.txt',
				},
				{
					desc: 'win',
					expect: ['**/a/**/*.txt'],
					toBe: 'c\\a\\b\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['**/a/**/*.txt'],
					toBe: 'c/a/b/d/a.txt',
				},
				{
					desc: 'win',
					expect: ['**/a/**/*.txt'],
					toBe: 'c\\a\\b\\d\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['**/a/**/*.txt'],
					toBe: 'e/c/a/b/d/a.txt',
				},
				{
					desc: 'win',
					expect: ['**/a/**/*.txt'],
					toBe: 'e\\c\\a\\b\\d\\a.txt',
				},
				{
					desc: 'posix',
					expect: ['**/a/**/*.txt'],
					toBe: 'e/c/a/b/d/ab.txt',
				},
				{
					desc: 'win',
					expect: ['**/a/**/*.txt'],
					toBe: 'e\\c\\a\\b\\d\\ab.txt',
				},
				{
					desc: 'posix',
					expect: ['**/a/**/*.txt'],
					toBe: 'e/c/a/b/d/abc.txt',
				},
				{
					desc: 'win',
					expect: ['**/a/**/*.txt'],
					toBe: 'e\\c\\a\\b\\d\\abc.txt',
				},
			]);
			
		});
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

