//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as vscode from 'vscode';

//	Variables __________________________________________________________________

const findTimestamp = /\?ts=\d+$/;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class SymlinkContentProvider implements vscode.TextDocumentContentProvider {
	
	public static SCHEME = 'l13diffsymlink';
	
	public provideTextDocumentContent (uri: vscode.Uri, cancel: vscode.CancellationToken): Promise<string> {
		
		if (cancel.isCancellationRequested) return Promise.resolve('');
		
		return new Promise((resolve, reject) => {
			
			fs.readlink(uri.fsPath.replace(findTimestamp, ''), (error, content) => {
				
				if (error) reject(error);
				else resolve(content);
				
			});
			
		});
		
	}
	
	public static parse (pathname: string) {
		
		return vscode.Uri.parse(`${SymlinkContentProvider.SCHEME}:${pathname}?ts=${+new Date()}`, true);
		
	}
	
}

//	Functions __________________________________________________________________

