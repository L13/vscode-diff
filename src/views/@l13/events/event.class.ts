//	Imports ____________________________________________________________________



//	Variables __________________________________________________________________

const IS_STOPPED = Symbol.for('isStopped');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class Event {
	
	public type:string;
	
	private [IS_STOPPED]:boolean = false;
	
	public constructor (options:{ type:string }) {
		
		this.type = options.type;
		
	}
	
	public get isStopped () :boolean {
		
		return this[IS_STOPPED];
		
	}
	
	public stopPropagation () :void {
		
		this[IS_STOPPED] = true;
		
	}
	
}

//	Functions __________________________________________________________________

