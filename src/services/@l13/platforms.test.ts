//	Imports ____________________________________________________________________

import * as assert from 'assert';

import type { Platform } from '../../@types/platforms';

import { isLinux, isMacOs, isWindows, platform, restoreDefaultPlatform, setPlatform } from './platforms';

//	Variables __________________________________________________________________

const platforms: Platform[] = ['Linux', 'macOS', 'Windows'];
const defaultPlattforms = { isLinux, isMacOs, isWindows };

//	Initialize _________________________________________________________________

describe('platforms', () => {
	
	describe('platform', () => {
		
		it('is a known platform', () => {
			
			assert.ok(platforms.includes(platform));
			
		});
		
	});
	
	describe('.restoreDefaultPlatform()', () => {
		
		const nextPlatform: Platform = next(platforms, platform);
		const nextNextPlatform: Platform = next(platforms, nextPlatform);
		
		function assertNextPlatform (currentPlatform: Platform, nextCurrentPlatform: Platform) {
			
			it(`set current platform "${currentPlatform}" to "${nextCurrentPlatform}" and restore`, () => {
				
				assertDefaultPlatform();
				
				setPlatform(nextCurrentPlatform);
				
				assertPlatform(nextCurrentPlatform);
				
				assertNotDefaultPlatform();
				
				restoreDefaultPlatform();
				
				assertPlatform(currentPlatform);
				
				assertDefaultPlatform();
				
			});
			
		}
		
		assertNextPlatform(platform, nextPlatform);
		assertNextPlatform(platform, nextNextPlatform);
		
	});
	
	describe('.setPlatform()', () => {
		
		it('Linux', () => {
			
			setPlatform('Linux');
			
			assertLinuxPlatform();
			
			restoreDefaultPlatform();
			
			assertDefaultPlatform();
			
		});
		
		it('macOS', () => {
			
			setPlatform('macOS');
			
			assertMacOSPlatform();
			
			restoreDefaultPlatform();
			
			assertDefaultPlatform();
			
		});
		
		it('Windows', () => {
			
			setPlatform('Windows');
			
			assertWindowsPlatform();
			
			restoreDefaultPlatform();
			
			assertDefaultPlatform();
			
		});
		
	});
	
});

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

function assertDefaultPlatform () {
	
	assert.deepStrictEqual({ isLinux, isMacOs, isWindows }, defaultPlattforms);
	
}

function assertNotDefaultPlatform () {
	
	assert.notDeepStrictEqual({ isLinux, isMacOs, isWindows }, defaultPlattforms);
	
}

function assertLinuxPlatform () {
	
	assert.strictEqual(isLinux, true);
	assert.strictEqual(isMacOs, false);
	assert.strictEqual(isWindows, false);
	
}

function assertMacOSPlatform () {
	
	assert.strictEqual(isLinux, false);
	assert.strictEqual(isMacOs, true);
	assert.strictEqual(isWindows, false);
	
}

function assertWindowsPlatform () {
	
	assert.strictEqual(isLinux, false);
	assert.strictEqual(isMacOs, false);
	assert.strictEqual(isWindows, true);
	
}

function assertPlatform (value: Platform) {
	
	switch (value) {
		case 'Linux': {
			assertLinuxPlatform();
			break;
		}
		case 'macOS': {
			assertMacOSPlatform();
			break;
		}
		case 'Windows': {
			assertWindowsPlatform();
			break;
		}
		default:
			throw new Error(`"${value}" is an unknown platform`);
	}
	
}

function next (items: any[], item: any) {
	
	const index = items.indexOf(item) + 1;
	
	return items[index >= items.length ? 0 : index];
	
}