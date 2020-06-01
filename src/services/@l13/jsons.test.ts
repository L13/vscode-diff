//	Imports ____________________________________________________________________

import * as assert from 'assert';

import { parse } from './jsons';

import { Test } from '../../types';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________

describe('jsons', () => {
	
	describe('.parse()', () => {
		
		function runTests (tests:Test[]) {
			
			for (const test of tests) {
				it(test.desc, () => assert.deepEqual(parse(test.expect), test.toBe));
			}
			
		}
		
		describe('no comments', () => {
			
			runTests([
				{
					desc: 'with number value',
					expect: `{
						"a": 1
					}`,
					toBe: { a: 1 },
				},
				{
					desc: 'with string value',
					expect: `{
						"a": "1"
					}`,
					toBe: { a: '1' },
				},
			]);
			
		});
		
		describe('remove single line comment', () => {
			
			runTests([
				{
					desc: 'at document atart',
					expect: `// test
					{
						"a": 1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'at object start',
					expect: `
					{ // test
						"a": 1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'after member',
					expect: `
					{
						"a": 1 // test
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'at object end',
					expect: `
					{
						"a": 1
					} // test
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'at document end',
					expect: `
					{
						"a": 1
					}
					// test`,
					toBe: { a: 1 },
				},
				{
					desc: 'remove all single line comments',
					expect: `// test
					{// test
						"a": 1// test
					}// test
					// test`,
					toBe: { a: 1 },
				},
			]);
			
		});
		
		describe('remove multi line comment', () => {
			
			runTests([
				{
					desc: 'at document start',
					expect: `/* test */
					{
						"a": 1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'at object start',
					expect: `
					{ /* test */
						"a": 1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'before member',
					expect: `
					{
						/* test */ "a": 1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'between member',
					expect: `
					{
						"a":/* test */1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'after member',
					expect: `
					{
						"a": 1 /* test */
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'at object end',
					expect: `
					{
						"a": 1
					} /* test */
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'at documnt end',
					expect: `
					{
						"a": 1
					}
					/* test */`,
					toBe: { a: 1 },
				},
				{
					desc: 'remove all multi line comments',
					expect: `/* test */
					{/* test */
						/* test */"a":/* test */1/* test */
					}/* test */
					/* test */`,
					toBe: { a: 1 },
				},
			]);
			
		});
		
		describe('remove bigger multi line comments', () => {
			
			runTests([
				{
					desc: 'at document start',
					expect: `/*
					test
					*/{
						"a": 1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'at object start',
					expect: `
					{/*
						test
					*/
						"a": 1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'before member',
					expect: `
					{
						/*
						test
						*/"a": 1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'between member',
					expect: `
					{
						"a":/*
						test
						*/1
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'after member',
					expect: `
					{
						"a": 1 /*
						test
						*/
					}
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'at object end',
					expect: `
					{
						"a": 1
					}/*
					test
					*/
					`,
					toBe: { a: 1 },
				},
				{
					desc: 'at documnt end',
					expect: `
					{
						"a": 1
					}
					/*
						test
					*/`,
					toBe: { a: 1 },
				},
				{
					desc: 'remove bigger all multi line comments',
					expect: `/*
					test
					*/
					{/*
						test
					*//*
						test
					*/"a":/*
						test
					*/1/*
						test
					*/
					}/*
						test
					*//*
						test
					*/`,
					toBe: { a: 1 },
				},
			]);
			
		});
		
		describe('ignnore single line comment inside', () => {
			
			runTests([
				{
					desc: 'multi line comment',
					expect: `{
						"a": 1 /* // */
					}
					`,
					toBe: { 'a': 1 },
				},
				{
					desc: 'bigger multi line comment',
					expect: `{
						"a": 1 /*
						//
					*/
					}
					`,
					toBe: { 'a': 1 },
				},
			]);
			
		});
		
		describe('multi line comment start inside', () => {
			
			runTests([
				{
					desc: 'multi line comment',
					expect: `{
						"a": 1 /* /* */
					}
					`,
					toBe: { 'a': 1 },
				},
				{
					desc: 'bigger multi line comment',
					expect: `{
						"a": 1 /*
						/*
					*/
					}
					`,
					toBe: { 'a': 1 },
				},
			]);
			
		});
		
		describe('ignore single line comment in', () => {
			
			runTests([
				{
					desc: 'key',
					expect: `
					{
						"a// test": "1"
					}
					`,
					toBe: { 'a// test': '1' },
				},
				{
					desc: 'string value',
					expect: `
					{
						"a": "1// test"
					}
					`,
					toBe: { 'a': '1// test' },
				},
			]);
			
		});
		
		describe('ignore multi line comment in string in', () => {
			
			runTests([
				{
					desc: 'key',
					expect: `
					{
						"a/* test */": "1"
					}
					`,
					toBe: { 'a/* test */': '1' },
				},
				{
					desc: 'string value',
					expect: `
					{
						"a": "1/* test */"
					}
					`,
					toBe: { 'a': '1/* test */' },
				},
			]);
			
		});
		
		describe('ignore double quote', () => {
			
			runTests([
				{
					desc: 'in key',
					expect: `{
						"\\"": 1
					}`,
					toBe: { '"': 1 },
				},
				{
					desc: 'at key start',
					expect: `{
						"a\\"": 1
					}`,
					toBe: { 'a"': 1 },
				},
				{
					desc: 'at key end',
					expect: `{
						"a\\"": 1
					}`,
					toBe: { 'a"': 1 },
				},
				{
					desc: 'in key with string value',
					expect: `{
						"\\"": "1"
					}`,
					toBe: { '"': '1' },
				},
				{
					desc: 'at key start with string value',
					expect: `{
						"\\"a": "1"
					}`,
					toBe: { '"a': '1' },
				},
				{
					desc: 'at key end with string value',
					expect: `{
						"a\\"": "1"
					}`,
					toBe: { 'a"': '1' },
				},
				{
					desc: 'in string value',
					expect: `{
						"a": "\\""
					}`,
					toBe: { 'a': '"' },
				},
				{
					desc: 'at value start',
					expect: `{
						"a": "\\"1"
					}`,
					toBe: { 'a': '"1' },
				},
				{
					desc: 'at value end',
					expect: `{
						"a": "1\\""
					}`,
					toBe: { 'a': '1"' },
				},
			]);
			
		});
		
		describe('ignore double quotes', () => {
			
			runTests([
				{
					desc: 'in key and value',
					expect: `{
						"\\"": "\\""
					}`,
					toBe: { '"': '"' },
				},
				{
					desc: 'at key and value start',
					expect: `{
						"\\"a": "\\"1"
					}`,
					toBe: { '"a': '"1' },
				},
				{
					desc: 'at key and value end',
					expect: `{
						"a\\"": "1\\""
					}`,
					toBe: { 'a"': '1"' },
				},
			]);
			
		});
		
		describe('ignore multiple double quotes', () => {
			
			runTests([
				{
					desc: 'in key and value',
					expect: `{
						"\\"\\"\\"": "\\"\\"\\""
					}`,
					toBe: { '"""': '"""' },
				},
				
				{
					desc: 'at key and value start',
					expect: `{
						"\\"\\"\\"a": "\\"\\"\\"1"
					}`,
					toBe: { '"""a': '"""1' },
				},
				
				{
					desc: 'at key and value end',
					expect: `{
						"a\\"\\"\\"": "1\\"\\"\\""
					}`,
					toBe: { 'a"""': '1"""' },
				},
			]);
			
		});
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

