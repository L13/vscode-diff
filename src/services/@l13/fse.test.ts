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
				it(`"${test.expect}" matches "${test.toBe}"`, () => assert.ok(createFindGlob(test.expect).test(test.toBe)));
			}
			
		}
		
		function runNegativeTests (tests:Test[]) {
			
			for (const test of tests) {
				it(`"${test.expect}" doesn't match "${test.toBe}"`, () => assert.ok(!createFindGlob(test.expect).test(test.toBe)));
			}
			
		}
		
		describe('empty', () => {
			
			runPositiveTests([
				{
					desc: '',
					expect: [],
					toBe: '',
				},
				{
					desc: '',
					expect: [''],
					toBe: '',
				},
			]);
			
			runNegativeTests([
				{
					desc: '',
					expect: [],
					toBe: 'a',
				},
				{
					desc: '',
					expect: [''],
					toBe: 'a',
				},
			]);
			
		});
		
		describe('*', () => {
			
			runPositiveTests([
				{
					desc: '',
					expect: ['*'],
					toBe: 'a',
				},
				{
					desc: '',
					expect: ['*.txt'],
					toBe: 'a.txt',
				},
				{
					desc: '',
					expect: ['a*.txt'],
					toBe: 'ab.txt',
				},
				{
					desc: '',
					expect: ['a*.txt'],
					toBe: 'abc.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: '',
					expect: ['*.txt'],
					toBe: '.txt',
				},
				{
					desc: '',
					expect: ['a*.txt'],
					toBe: 'a.txt',
				},
				{
					desc: '',
					expect: ['*.txt'],
					toBe: 'a.tst',
				},
				{
					desc: '',
					expect: ['a*.txt'],
					toBe: 'b.txt',
				},
			]);
			
		});
		
		describe('?', () => {
			
			runPositiveTests([
				{
					desc: '',
					expect: ['a?.txt'],
					toBe: 'a.txt',
				},
				{
					desc: '',
					expect: ['ab?.txt'],
					toBe: 'a.txt',
				},
				{
					desc: '',
					expect: ['ab?.txt'],
					toBe: 'ab.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: '',
					expect: ['ab?.txt'],
					toBe: 'aa.txt',
				},
				{
					desc: '',
					expect: ['ab?.txt'],
					toBe: 'ac.txt',
				},
			]);
			
		});
		
		describe('./', () => {
			
			runPositiveTests([
				{
					desc: '',
					expect: ['./a.txt'],
					toBe: 'a.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: '',
					expect: ['./a.txt'],
					toBe: 'a/a.txt',
				},
			]);
			
		});
		
		describe('**/ start', () => {
			
			runPositiveTests([
				{
					desc: '',
					expect: ['**/a.txt'],
					toBe: 'a.txt',
				},
				{
					desc: '',
					expect: ['**/b.txt'],
					toBe: 'a/b.txt',
				},
				{
					desc: '',
					expect: ['**/c.txt'],
					toBe: 'a/b/c.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: '',
					expect: ['**/a.txt'],
					toBe: 'ba.txt',
				},
				{
					desc: '',
					expect: ['**/a.txt'],
					toBe: 'ba.txt',
				},
				{
					desc: '',
					expect: ['**/a.txt'],
					toBe: 'c/ba.txt',
				},
				{
					desc: '',
					expect: ['**/a.txt'],
					toBe: 'd/c/ba.txt',
				},
			]);
			
		});
		
		describe('**/ between', () => {
			
			runPositiveTests([
				{
					desc: '',
					expect: ['a/**/a.txt'],
					toBe: 'a/b/a.txt',
				},
				{
					desc: '',
					expect: ['a/**/a.txt'],
					toBe: 'a/b/c/a.txt',
				},
				{
					desc: '',
					expect: ['a/**/a.txt'],
					toBe: 'b/a/c/a.txt',
				},
				{
					desc: '',
					expect: ['a/**/a.txt'],
					toBe: 'b/c/a/a.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: '',
					expect: ['a/**/a.txt'],
					toBe: 'c/b/a.txt',
				},
				{
					desc: '',
					expect: ['a/**/a.txt'],
					toBe: 'd/b/c/a.txt',
				}
			]);
			
		});
		
		describe('**/ end', () => {
			
			runPositiveTests([
				{
					desc: '',
					expect: ['a/**'],
					toBe: 'a/a.txt',
				},
				{
					desc: '',
					expect: ['a/**'],
					toBe: 'a/b/a.txt',
				},
				{
					desc: '',
					expect: ['a/**'],
					toBe: 'a/b/c/a.txt',
				},
				{
					desc: '',
					expect: ['a/**'],
					toBe: 'b/a/a.txt',
				},
				{
					desc: '',
					expect: ['a/**'],
					toBe: 'c/b/a/a.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: '',
					expect: ['a/**'],
					toBe: 'b/a.txt',
				},
			]);
			
		});
		
		describe('**/ and ./', () => {
			
			runPositiveTests([
				{
					desc: '',
					expect: ['./a/**/a.txt'],
					toBe: 'a/a.txt',
				},
				{
					desc: '',
					expect: ['./a/**/a.txt'],
					toBe: 'a/b/a.txt',
				},
				{
					desc: '',
					expect: ['./a/**/a.txt'],
					toBe: 'a/b/c/a.txt',
				},
			]);
			
			runNegativeTests([
				{
					desc: '',
					expect: ['./a/**/a.txt'],
					toBe: 'b/a/a.txt',
				},
				{
					desc: '',
					expect: ['./a/**/a.txt'],
					toBe: 'c/a/b/a.txt',
				},
				{
					desc: '',
					expect: ['./a/**/a.txt'],
					toBe: 'c/b/a/a.txt',
				},
			]);
			
		});
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

