//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Keybinding = {
	title?:string,
	key:string,
	mac?:string,
	win?:string,
};

export type Shortcut = {
	key:string,
	altKey:boolean,
	ctrlKey:boolean,
	metaKey:boolean,
	shiftKey:boolean,
};

export type SimpleMap = {
	[code:string]:string,
};

//	Functions __________________________________________________________________

