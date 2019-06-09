//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export let isMacOs = false;
export let isWindows = false;
export let isOtherPlatform = false;

export function detectPlatform () {
	
	const body = document.body;
	
	isMacOs = !!body.classList.contains('platform-mac');
	isWindows = !!body.classList.contains('platform-win');
	isOtherPlatform = !!body.classList.contains('platform-other');
	
}

// Only for testing platform features

export function changePlatform () {
	
	let platform;
	
	if (isMacOs) {
		isMacOs = false;
		isWindows = true;
		platform = 'Windows';
	} else if (isWindows) {
		isWindows = false;
		isOtherPlatform = true;
		platform = 'Linux';
	} else {
		isOtherPlatform = false;
		isMacOs = true;
		platform = 'macOS';
	}
	
// tslint:disable-next-line: no-console
	console.log(`Changed platform to '${platform}'`);
	
}

//	Functions __________________________________________________________________

