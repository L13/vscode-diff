//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function remove (values: any[], value: any) {
	
	const index = values.indexOf(value);
	
	if (index !== -1) values.splice(index, 1);
	
}

export function sortCaseInsensitive (a: string, b: string) {
	
	a = a.toUpperCase();
	b = b.toUpperCase();
	
	return a < b ? -1 : a > b ? 1 : 0;
	
}

//	Functions __________________________________________________________________

