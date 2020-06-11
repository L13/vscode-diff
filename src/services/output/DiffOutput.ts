//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { remove } from '../../@l13/natvies/arrays';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffOutput {
	
	private static output:vscode.OutputChannel|undefined;
	
	public static currentOutput:DiffOutput|undefined;
	
	private static outputs:DiffOutput[] = [];
	
	private lines:string[] = [];
	
	public constructor () {
		
		if (!DiffOutput.output) {
			DiffOutput.output = vscode.window.createOutputChannel('L13 Diff');
		}
		
		DiffOutput.currentOutput = this;
		
	}
	
	public activate () {
		
		DiffOutput.currentOutput = this;
		DiffOutput.output.clear();
		
		this.lines.forEach((line) => DiffOutput.output.appendLine(line));
		
	}
	
	public log (text:string) :void {
		
		const line = `[${createTimestamp()}] ${text}`;
		
		this.lines.push(line);
		
		DiffOutput.output.appendLine(line);
		
	}
	
	public msg (line:string = '') :void {
		
		this.lines.push(line);
		
		DiffOutput.output.appendLine(line);
		
	}
	
	public show () :void {
		
		DiffOutput.output.show();
		
	}
	
	public hide () :void {
		
		DiffOutput.output.hide();
		
	}
	
	public clear () :void {
		
		this.lines = [];
		
		DiffOutput.output.clear();
		
	}
	
	public dispose () :void {
		
		remove(DiffOutput.outputs, this);
		DiffOutput.currentOutput = DiffOutput.outputs[DiffOutput.outputs.length - 1];
		
		if (!DiffOutput.outputs.length && DiffOutput.output) {
			DiffOutput.output.dispose();
			DiffOutput.output = undefined;
		}
		
	}
	
}

//	Functions __________________________________________________________________

function createTimestamp () {
	
	const now = new Date();
	const hours = '' + now.getHours();
	const minutes = '' + now.getMinutes();
	const seconds = '' + now.getSeconds();
	
	return `${padStart(hours, 2, '0')}:${padStart(minutes, 2, '0')}:${padStart(seconds, 2, '0')}`;
	
}

function padStart (str:string, length:number, pad:string) {
	
	while (str.length < length) str = pad + str;
	
	return str;
	
}