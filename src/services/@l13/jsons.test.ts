import * as assert from 'assert';

import { parse } from './jsons';

type Test = {
	desc:string,
	expect:string,
	toBe:any,
};

describe('jsons', () => {
	
	describe('.parse()', () => {
		
		const tests:Test[] = [
			{
				desc: 'no comment',
				expect: `{
					"a": 1
				}`,
				toBe: { a: 1 },
			},
			{
				desc: 'no comment',
				expect: `{
					"a": "1"
				}`,
				toBe: { a: '1' },
			},
			{
				desc: 'remove single line comment at document atart',
				expect: `// test
				{
					"a": 1
				}
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove single line comment at object start',
				expect: `
				{ // test
					"a": 1
				}
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove single line comment after member',
				expect: `
				{
					"a": 1 // test
				}
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove single line comment at object end',
				expect: `
				{
					"a": 1
				} // test
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove single line comment at document end',
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
			{
				desc: 'remove multi line comment',
				expect: `/* test */
				{
					"a": 1
				}
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove multi line comment at object start',
				expect: `
				{ /* test */
					"a": 1
				}
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove multi line comment before member',
				expect: `
				{
					/* test */ "a": 1
				}
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove multi line comment between member',
				expect: `
				{
					"a":/* test */1 
				}
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove multi line comment after member',
				expect: `
				{
					"a": 1 /* test */
				}
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove multi line comment at object end',
				expect: `
				{
					"a": 1
				} /* test */
				`,
				toBe: { a: 1 },
			},
			{
				desc: 'remove multi line comment at documnt end',
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
			{
				desc: 'ignore single line comment in key',
				expect: `
				{
					"a// test": "1"
				}
				`,
				toBe: { 'a// test': '1' },
			},
			{
				desc: 'ignore single line comment in value',
				expect: `
				{
					"a": "1// test"
				}
				`,
				toBe: { 'a': '1// test' },
			},
			{
				desc: 'ignore multi line comment in key',
				expect: `
				{
					"a/* test */": "1"
				}
				`,
				toBe: { 'a/* test */': '1' },
			},
			{
				desc: 'ignore multi line comment in value',
				expect: `
				{
					"a": "1/* test */"
				}
				`,
				toBe: { 'a': '1/* test */' },
			},
			{
				desc: 'ignore double quote in key',
				expect: `{
					"\\"": 1
				}`,
				toBe: { '"': 1 },
			},
			{
				desc: 'ignore double quote at key start',
				expect: `{
					"a\\"": 1
				}`,
				toBe: { 'a"': 1 },
			},
			{
				desc: 'ignore double quote at key end',
				expect: `{
					"a\\"": 1
				}`,
				toBe: { 'a"': 1 },
			},
			{
				desc: 'ignore double quote in key with string value',
				expect: `{
					"\\"": "1"
				}`,
				toBe: { '"': '1' },
			},
			{
				desc: 'ignore double quote at key start with string value',
				expect: `{
					"\\"a": "1"
				}`,
				toBe: { '"a': '1' },
			},
			{
				desc: 'ignore double quote at key end with string value',
				expect: `{
					"a\\"": "1"
				}`,
				toBe: { 'a"': '1' },
			},
			{
				desc: 'ignore double quote in string value',
				expect: `{
					"a": "\\""
				}`,
				toBe: { 'a': '"' },
			},
			{
				desc: 'ignore double quote at value start',
				expect: `{
					"a": "\\"1"
				}`,
				toBe: { 'a': '"1' },
			},
			{
				desc: 'ignore double quote at value end',
				expect: `{
					"a": "1\\""
				}`,
				toBe: { 'a': '1"' },
			},
			{
				desc: 'ignore double quotes in key and value',
				expect: `{
					"\\"": "\\""
				}`,
				toBe: { '"': '"' },
			},
			{
				desc: 'ignore multiple double quotes in key and value',
				expect: `{
					"\\"\\"\\"": "\\"\\"\\""
				}`,
				toBe: { '"""': '"""' },
			},
			{
				desc: 'ignore double quotes at key and value start',
				expect: `{
					"\\"a": "\\"1"
				}`,
				toBe: { '"a': '"1' },
			},
			{
				desc: 'ignore multipe double quotes at key and value start',
				expect: `{
					"\\"\\"\\"a": "\\"\\"\\"1"
				}`,
				toBe: { '"""a': '"""1' },
			},
			{
				desc: 'ignore double quotes at key and value end',
				expect: `{
					"a\\"": "1\\""
				}`,
				toBe: { 'a"': '1"' },
			},
			{
				desc: 'ignore multipe double quotes at key and value end',
				expect: `{
					"a\\"\\"\\"": "1\\"\\"\\""
				}`,
				toBe: { 'a"""': '1"""' },
			},
		];
		
		for (const test of tests) {
			it(test.desc, () => assert.deepEqual(parse(test.expect), test.toBe));
		}
		
	});
	
});