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
		
		it('remove single line comment', () => {
			
			assert.deepEqual({ a: 1 }, parse(`// test
			{
				"a": 1
			}
			`));
			
			assert.deepEqual({ a: 1 }, parse(`
			{ // test
				"a": 1
			}
			`));
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1 // test
			}
			`));
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1
			} // test
			`));
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1
			}
			// test`));
			
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
			
			assert.deepEqual({ a: 1 }, parse(`
			{ /* test */
				"a": 1
			}
			`));
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1 /* test */
			}
			`));
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1
			} /* test */
			`));
			
			assert.deepEqual({ a: 1 }, parse(`
			{
				"a": 1
			}
			/* test */`));
			
			assert.deepEqual({ a: 1 }, parse(`/* test */
			{/* test */
			/* test */"a":/* test */1/* test */
			}/* test */
			/* test */`));
			
		});
		
		it('ignore strings', () => {
			
			assert.deepEqual({ 'a// test': '1' }, parse(`
			{
				"a// test": "1"
			}
			`));
			
			assert.deepEqual({ 'a': '1// test' }, parse(`
			{
				"a": "1// test"
			}
			`));
			
			assert.deepEqual({ 'a/* test */': '1' }, parse(`
			{
				"a/* test */": "1"
			}
			`));
			
			assert.deepEqual({ 'a': '1/* test */' }, parse(`
			{
				"a": "1/* test */"
			}
			`));
			
		});
		
		it('ignore quotes in strings', () => {
			
			assert.deepEqual({ 'a"': 1 }, parse(`{
				"a\\"": 1
			}`));
			
			assert.deepEqual({ 'a"': '1' }, parse(`{
				"a\\"": "1"
			}`));
			
			assert.deepEqual({ 'a"': '1' }, parse(`{
				"a\\"": "1"
			}`));
			
			assert.deepEqual({ 'a': '1"' }, parse(`{
				"a": "1\\""
			}`));
			
			assert.deepEqual({ 'a"': '1"' }, parse(`{
				"a\\"": "1\\""
			}`));
			
			assert.deepEqual({ 'a""': '1""' }, parse(`{
				"a\\"\\"": "1\\"\\""
			}`));
			
		});
		
	});
	
});