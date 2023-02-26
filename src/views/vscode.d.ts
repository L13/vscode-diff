declare function acquireVsCodeApi (): {
	postMessage (msg: any): any;
	setState (newState: any): any;
	getState (): any;
};