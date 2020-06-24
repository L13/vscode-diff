//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type Favorite = {
	fileA:string;
	fileB:string;
	label:string;
	groupId?:number;
};

export type FavoriteGroup = {
	label:string;
	id:number;
	collapsed:boolean;
};

export type InitialState = 'Collapsed'|'Expanded'|'Remember';

//	Functions __________________________________________________________________

