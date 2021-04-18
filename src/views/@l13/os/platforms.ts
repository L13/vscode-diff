//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export let isMacOs = false;
export let isWindows = false;
export let isLinux = false;

export function detectPlatform () {
	
	const body = document.body;
	
	isMacOs = !!body.classList.contains('platform-mac');
	isWindows = !!body.classList.contains('platform-win');
	isLinux = !!body.classList.contains('platform-linux');
	
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
		isLinux = true;
		platform = 'Linux';
	} else {
		isLinux = false;
		isMacOs = true;
		platform = 'macOS';
	}
	
	// eslint-disable-next-line no-console
	console.log(`Changed platform to '${platform}'`);
	
}

//	Functions __________________________________________________________________

