import * as assert from 'assert';

import { parse } from './jsons';

describe('jsons', () => {
	
	describe('.parse()', () => {
		
		it('no comment', () => {
			
			assert.deepEqual({ a: 1 }, parse(`{
				"a": 1
			}`));
			
			assert.deepEqual({ a: '1' }, parse(`{
				"a": "1"
			}`));
			
		});
		
		it('remove single line comment at document atart', () => {
			
			assert.deepEqual({ a: 1 }, parse(`// test
			{
				"a": 1
			}
			`));
			
		});
		
		it('remove single line comment at object start', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{ // test
				"a": 1
			}
			`));
			
		});
		
		it('remove single line comment after member', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1 // test
			}
			`));
			
		});
		
		it('remove single line comment at object end', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1
			} // test
			`));
			
		});
		
		it('remove single line comment at document end', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1
			}
			// test`));
			
		});
		
		it('remove all single line comments', () => {
			
			assert.deepEqual({ a: 1 }, parse(`// test
			{// test
				"a": 1// test
			}// test
			// test`));
			
		});
		
		it('remove multi line comment', () => {
			
			assert.deepEqual({ a: 1 }, parse(`/* test */
			{
				"a": 1
			}
			`));
			
		});
		
		it('remove multi line comment at object start', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{ /* test */
				"a": 1
			}
			`));
			
		});
		
		it('remove multi line comment before member', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				/* test */ "a": 1
			}
			`));
			
		});
		
		it('remove multi line comment between member', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a":/* test */1 
			}
			`));
			
		});
		
		it('remove multi line comment after member', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1 /* test */
			}
			`));
			
		});
		
		it('remove multi line comment at object end', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1
			} /* test */
			`));
			
		});
		
		it('remove multi line comment at documnt end', () => {
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1
			}
			/* test */`));
			
		});
		
		it('remove all multi line comments', () => {
			
			assert.deepEqual({ a: 1 }, parse(`/* test */
			{/* test */
			/* test */"a":/* test */1/* test */
			}/* test */
			/* test */`));
			
		});
		
		it('ignore single line comment in key', () => {
			
			assert.deepEqual({ 'a// test': '1' }, parse(`
			{
				"a// test": "1"
			}
			`));
			
		});
		
		it('ignore single line comment in value', () => {
			
			assert.deepEqual({ 'a': '1// test' }, parse(`
			{
				"a": "1// test"
			}
			`));
			
		});
		
		it('ignore multi line comment in key', () => {
			
			assert.deepEqual({ 'a/* test */': '1' }, parse(`
			{
				"a/* test */": "1"
			}
			`));
			
		});
		
		it('ignore multi line comment in value', () => {
			
			assert.deepEqual({ 'a': '1/* test */' }, parse(`
			{
				"a": "1/* test */"
			}
			`));
			
		});
		
		it('ignore double quote in key', () => {
			
			assert.deepEqual({ '"': 1 }, parse(`{
				"\\"": 1
			}`));
			
		});
		
		it('ignore double quote at key start', () => {
			
			assert.deepEqual({ 'a"': 1 }, parse(`{
				"a\\"": 1
			}`));
			
		});
		
		it('ignore double quote at key end', () => {
			
			assert.deepEqual({ 'a"': 1 }, parse(`{
				"a\\"": 1
			}`));
			
		});
		
		it('ignore double quote in key with string value', () => {
			
			assert.deepEqual({ '"': '1' }, parse(`{
				"\\"": "1"
			}`));
			
		});
		
		it('ignore double quote at key start with string value', () => {
			
			assert.deepEqual({ '"a': '1' }, parse(`{
				"\\"a": "1"
			}`));
			
		});
		
		it('ignore double quote at key end with string value', () => {
			
			assert.deepEqual({ 'a"': '1' }, parse(`{
				"a\\"": "1"
			}`));
			
		});
		
		it('ignore double quote in string value', () => {
			
			assert.deepEqual({ 'a': '"' }, parse(`{
				"a": "\\""
			}`));
			
		});
		
		it('ignore double quote at value start', () => {
			
			assert.deepEqual({ 'a': '"1' }, parse(`{
				"a": "\\"1"
			}`));
			
		});
		
		it('ignore double quote at value end', () => {
			
			assert.deepEqual({ 'a': '1"' }, parse(`{
				"a": "1\\""
			}`));
			
		});
		
		it('ignore double quotes in key and value', () => {
			
			assert.deepEqual({ '"': '"' }, parse(`{
				"\\"": "\\""
			}`));
			
		});
		
		it('ignore multiple double quotes in key and value', () => {
			
			assert.deepEqual({ '"""': '"""' }, parse(`{
				"\\"\\"\\"": "\\"\\"\\""
			}`));
			
		});
		
		it('ignore double quotes at key and value start', () => {
			
			assert.deepEqual({ '"a': '"1' }, parse(`{
				"\\"a": "\\"1"
			}`));
			
		});
		
		it('ignore multipe double quotes at key and value start', () => {
			
			assert.deepEqual({ '"""a': '"""1' }, parse(`{
				"\\"\\"\\"a": "\\"\\"\\"1"
			}`));
			
		});
		
		it('ignore double quotes at key and value end', () => {
			
			assert.deepEqual({ 'a"': '1"' }, parse(`{
				"a\\"": "1\\""
			}`));
			
		});
		
		it('ignore multipe double quotes at key and value end', () => {
			
			assert.deepEqual({ 'a"""': '1"""' }, parse(`{
				"a\\"\\"\\"": "1\\"\\"\\""
			}`));
			
		});
		
	});
	
});