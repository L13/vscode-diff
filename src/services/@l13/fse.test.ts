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
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

