//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________

export let isMacOs = false;
export let isWindows = false;
export let isLinux = false;

//	Initialize _________________________________________________________________

if (process.platform === 'darwin') isMacOs = true;
else if (process.platform === 'win32') isWindows = true;
else isLinux = true;

//	Exports ____________________________________________________________________



//	Functions __________________________________________________________________

