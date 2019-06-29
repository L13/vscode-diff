//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffOutput {
	
	private output:vscode.OutputChannel = null;
	
	public static currentOutput:DiffOutput|undefined;
	
	public constructor () {
		
		this.output = vscode.window.createOutputChannel('L13 Diff');
		
	}
	
	public log (text:string) :void {
		
		this.output.appendLine(`[${createTimestamp()}] ${text}`);
		
	}
	
	public msg (text:string = '') :void {
		
		this.output.appendLine(text);
		
	}
	
	public show () :void {
		
		this.output.show();
		
	}
	
	public clear () :void {
		
		this.output.clear();
		
	}
	
	public dispose () :void {
		
		this.output.dispose();
		DiffOutput.currentOutput = undefined;
		
	}
	
	public static createOutput () {
		
		return DiffOutput.currentOutput || (DiffOutput.currentOutput = new DiffOutput());
		
	}
	
}

//	Functions __________________________________________________________________

function createTimestamp () {
	
	const now = new Date();
	const hours = '' + now.getHours();
	const minutes = '' + now.getHours();
	const seconds = '' + now.getSeconds();
	
	return `${padStart(hours, 2, '0')}:${padStart(minutes, 2, '0')}:${padStart(seconds, 2, '0')}`;
	
}

function padStart (str:string, length:number, pad:string) {
	
	while (str.length < length) str = pad + str;
	
	return str;
	
}