//	Imports ____________________________________________________________________

import * as assert from 'assert';

import type { Platform } from '../../@types/platforms';
import type { Test } from '../../@types/tests';

import { createFindGlob, sanitize } from './fse';
import { isWindows, restoreDefaultPlatform, setPlatform } from './platforms';

//	Variables __________________________________________________________________

type PositiveTest = {
	platform: string,
	useCaseSensitive?: boolean,
	glob: string[],
	matches: string,
};

type NegativeTest = {
	platform: string,
	useCaseSensitive?: boolean,
	glob: string[],
	doesNotMatch: string,
};

//	Initialize _________________________________________________________________

describe('fse', () => {
	
	describe('.createFindGlob()', () => {
		
		function runPositiveCaseTests (tests: PositiveTest[]) {
			
			for (const test of tests) {
				it(`"${test.glob}" matches "${test.matches}" (${test.platform}, case sensitive and insensitive)`, () => {
					
					assert.ok(createFindGlob(test.glob, true).test(test.matches));
					assert.ok(createFindGlob(test.glob, false).test(test.matches));
					
				});
			}
			
		}
		
		function runNegativeCaseTests (tests: NegativeTest[]) {
			
			for (const test of tests) {
				it(`"${test.glob}" doesn't match "${test.doesNotMatch}" (${test.platform}, case sensitive and insensitive))`, () => {
					
					assert.ok(!createFindGlob(test.glob, true).test(test.doesNotMatch));
					assert.ok(!createFindGlob(test.glob, false).test(test.doesNotMatch));
					
				});
			}
			
		}
		
		function runPositiveTests (tests: PositiveTest[]) {
			
			for (const test of tests) {
				it(`"${test.glob}" matches "${test.matches}" (${test.platform}, case ${test.useCaseSensitive ? 'sensitive' : 'insensitive'})`, () => {
					
					assert.ok(createFindGlob(test.glob, test.useCaseSensitive).test(test.matches));
					
				});
			}
			
		}
		
		function runNegativeTests (tests: NegativeTest[]) {
			
			for (const test of tests) {
				// eslint-disable-next-line max-len
				it(`"${test.glob}" doesn't match "${test.doesNotMatch}" (${test.platform}, case ${test.useCaseSensitive ? 'sensitive' : 'insensitive'})`, () => {
					
					assert.ok(!createFindGlob(test.glob, test.useCaseSensitive).test(test.doesNotMatch));
					
				});
			}
			
		}
		
		describe('empty', () => {
			
			runPositiveCaseTests([
				{
					platform: 'win and posix',
					glob: [],
					matches: '',
				},
				{
					platform: 'win and posix',
					glob: [''],
					matches: '',
				},
			]);
			
			runNegativeCaseTests([
				{
					platform: 'win and posix',
					glob: [],
					doesNotMatch: 'a',
				},
				{
					platform: 'win and posix',
					glob: [''],
					doesNotMatch: 'a',
				},
			]);
			
		});
		
		describe('names', () => {
			
			runPositiveTests([
				{
					platform: 'win and posix',
					useCaseSensitive: true,
					glob: ['a'],
					matches: 'a',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: true,
					glob: ['A'],
					matches: 'A',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: true,
					glob: ['a.txt'],
					matches: 'a.txt',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: true,
					glob: ['A.txt'],
					matches: 'A.txt',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: false,
					glob: ['a'],
					matches: 'a',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: false,
					glob: ['a.txt'],
					matches: 'a.txt',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: false,
					glob: ['A'],
					matches: 'a',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: false,
					glob: ['a'],
					matches: 'A',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: false,
					glob: ['A.TXT'],
					matches: 'a.txt',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: false,
					glob: ['a.txt'],
					matches: 'A.txt',
				},
			]);
			
			runNegativeTests([
				{
					platform: 'win and posix',
					useCaseSensitive: true,
					glob: ['a.txt'],
					doesNotMatch: 'A.TXT',
				},
				{
					platform: 'win and posix',
					useCaseSensitive: true,
					glob: ['A.TXT'],
					doesNotMatch: 'a.txt',
				},
			]);
			
		});
		
		describe('*', () => {
			
			runPositiveCaseTests([
				{
					platform: 'win and posix',
					glob: ['*'],
					matches: 'a',
				},
				{
					platform: 'win and posix',
					glob: ['*.txt'],
					matches: '.txt',
				},
				{
					platform: 'win and posix',
					glob: ['*.txt'],
					matches: 'a.txt',
				},
				{
					platform: 'win and posix',
					glob: ['a*.txt'],
					matches: 'a.txt',
				},
				{
					platform: 'win and posix',
					glob: ['a*.txt'],
					matches: 'ab.txt',
				},
				{
					platform: 'win and posix',
					glob: ['a*.txt'],
					matches: 'abc.txt',
				},
			]);
			
			runNegativeCaseTests([
				{
					platform: 'win and posix',
					glob: ['*.txt'],
					doesNotMatch: 'a.tst',
				},
				{
					platform: 'win and posix',
					glob: ['a*.txt'],
					doesNotMatch: 'b.txt',
				},
			]);
			
		});
		
		describe('?', () => {
			
			runPositiveCaseTests([
				{
					platform: 'win and posix',
					glob: ['?.txt'],
					matches: 'a.txt',
				},
				{
					platform: 'win and posix',
					glob: ['a?.txt'],
					matches: 'ab.txt',
				},
				{
					platform: 'win and posix',
					glob: ['a??.txt'],
					matches: 'abc.txt',
				},
			]);
			
			runNegativeCaseTests([
				{
					platform: 'win and posix',
					glob: ['a?.txt'],
					doesNotMatch: 'a.txt',
				},
				{
					platform: 'win and posix',
					glob: ['aa?.txt'],
					doesNotMatch: 'aa.txt',
				},
			]);
			
		});
		
		describe('**/', () => {
			
			runPositiveCaseTests([
				{
					platform: 'win and posix',
					glob: ['**/a.txt'],
					matches: 'a.txt',
				},
				{
					platform: 'posix',
					glob: ['**/b.txt'],
					matches: 'a/b.txt',
				},
				{
					platform: 'win',
					glob: ['**/b.txt'],
					matches: 'a\\b.txt',
				},
				{
					platform: 'posix',
					glob: ['**/c.txt'],
					matches: 'a/b/c.txt',
				},
				{
					platform: 'win',
					glob: ['**/c.txt'],
					matches: 'a\\b\\c.txt',
				},
			]);
			
			runNegativeCaseTests([
				{
					platform: 'win and posix',
					glob: ['**/a.txt'],
					doesNotMatch: 'ba.txt',
				},
				{
					platform: 'posix',
					glob: ['**/a.txt'],
					doesNotMatch: 'c/ba.txt',
				},
				{
					platform: 'win',
					glob: ['**/a.txt'],
					doesNotMatch: 'c\\ba.txt',
				},
				{
					platform: 'posix',
					glob: ['**/a.txt'],
					doesNotMatch: 'd/c/ba.txt',
				},
				{
					platform: 'win',
					glob: ['**/a.txt'],
					doesNotMatch: 'd\\c\\ba.txt',
				},
			]);
			
		});
		
		describe('/**/', () => {
			
			runPositiveCaseTests([
				{
					platform: 'posix',
					glob: ['a/**/a.txt'],
					matches: 'a/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**/a.txt'],
					matches: 'a\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['a/**/a.txt'],
					matches: 'a/b/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**/a.txt'],
					matches: 'a\\b\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['a/**/a.txt'],
					matches: 'a/b/c/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**/a.txt'],
					matches: 'a\\b\\c\\a.txt',
				},
			]);
			
			runNegativeCaseTests([
				{
					platform: 'posix',
					glob: ['a/**/a.txt'],
					doesNotMatch: 'b/a/c/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**/a.txt'],
					doesNotMatch: 'b\\a\\c\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['a/**/a.txt'],
					doesNotMatch: 'b/c/a/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**/a.txt'],
					doesNotMatch: 'b\\c\\a\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['a/**/a.txt'],
					doesNotMatch: 'c/b/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**/a.txt'],
					doesNotMatch: 'c\\b\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['a/**/a.txt'],
					doesNotMatch: 'd/b/c/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**/a.txt'],
					doesNotMatch: 'd\\b\\c\\a.txt',
				},
			]);
			
		});
		
		describe('/**', () => {
			
			runPositiveCaseTests([
				{
					platform: 'win and posix',
					glob: ['a/**'],
					matches: 'a',
				},
				{
					platform: 'posix',
					glob: ['a/**'],
					matches: 'a/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**'],
					matches: 'a\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['a/**'],
					matches: 'a/b/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**'],
					matches: 'a\\b\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['a/**'],
					matches: 'a/b/c/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**'],
					matches: 'a\\b\\c\\a.txt',
				},
			]);
			
			runNegativeCaseTests([
				{
					platform: 'posix',
					glob: ['a/**'],
					doesNotMatch: 'b/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**'],
					doesNotMatch: 'b\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['a/**'],
					doesNotMatch: 'b/a/a.txt',
				},
				{
					platform: 'win',
					glob: ['a/**'],
					doesNotMatch: 'b\\a\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['a/**'],
					doesNotMatch: 'c/b/a/a.txt',
				},
				{
					platform: 'win',
					glob: ['a\\**'],
					doesNotMatch: 'c\\b\\a\\a.txt',
				},
			]);
			
		});
		
		describe('** and *', () => {
			
			runPositiveCaseTests([
				{
					platform: 'posix',
					glob: ['**/a/**/*.txt'],
					matches: 'a/a.txt',
				},
				{
					platform: 'win',
					glob: ['**/a/**/*.txt'],
					matches: 'a\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['**/a/**/*.txt'],
					matches: 'b/a/a.txt',
				},
				{
					platform: 'win',
					glob: ['**/a/**/*.txt'],
					matches: 'b\\a\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['**/a/**/*.txt'],
					matches: 'a/b/a.txt',
				},
				{
					platform: 'win',
					glob: ['**/a/**/*.txt'],
					matches: 'a\\b\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['**/a/**/*.txt'],
					matches: 'c/a/b/a.txt',
				},
				{
					platform: 'win',
					glob: ['**/a/**/*.txt'],
					matches: 'c\\a\\b\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['**/a/**/*.txt'],
					matches: 'c/a/b/d/a.txt',
				},
				{
					platform: 'win',
					glob: ['**/a/**/*.txt'],
					matches: 'c\\a\\b\\d\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['**/a/**/*.txt'],
					matches: 'e/c/a/b/d/a.txt',
				},
				{
					platform: 'win',
					glob: ['**/a/**/*.txt'],
					matches: 'e\\c\\a\\b\\d\\a.txt',
				},
				{
					platform: 'posix',
					glob: ['**/a/**/*.txt'],
					matches: 'e/c/a/b/d/ab.txt',
				},
				{
					platform: 'win',
					glob: ['**/a/**/*.txt'],
					matches: 'e\\c\\a\\b\\d\\ab.txt',
				},
				{
					platform: 'posix',
					glob: ['**/a/**/*.txt'],
					matches: 'e/c/a/b/d/abc.txt',
				},
				{
					platform: 'win',
					glob: ['**/a/**/*.txt'],
					matches: 'e\\c\\a\\b\\d\\abc.txt',
				},
			]);
			
		});
		
	});
	
	describe('.sanitize()', () => {
		
		function runTests (platform: Platform, tests: Test[]) {
			
			for (const test of tests) {
				it(test.desc, () => {
					
					setPlatform(platform);
					
					assert.strictEqual(sanitize(test.expect), test.toBe);
				
					restoreDefaultPlatform();
					
				});
			}
			
		}
		
		function runPlatformTest (platform: Platform) {
			
			const specialChars = isWindows ? '"*<>?|' : '';
			const asciiChars = Array(96)
				.fill('')
				.map((value, index) => {
						
					const char = String.fromCharCode(index + 32);
						
					return specialChars.includes(char) ? '' : char;
						
				})
				.join('');
				
			runTests(platform, [
				{
					desc: 'remove ASCII control characters',
					expect: '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f',
					toBe: '',
				},
				{
					desc: specialChars ? `remove special characters ${specialChars}` : 'no special characters',
					expect: specialChars,
					toBe: '',
				},
				{
					desc: 'remove illegal characters',
					expect: '\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f',
					toBe: '',
				},
				{
					desc: 'keep ASCII characters',
					expect: asciiChars,
					toBe: asciiChars,
				},
			]);
			
		}
		
		function runPlatformTests (platform: Platform) {
			
			describe(platform, () => {
				
				setPlatform(platform);
				
				runPlatformTest(platform);
				
				restoreDefaultPlatform();
				
			});
			
		}
		
		const platforms: Platform[] = ['Linux', 'macOS', 'Windows'];
		
		platforms.forEach((platform) => runPlatformTests(platform));
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

