//	Imports ____________________________________________________________________

import * as fs from 'fs';
import { join } from 'path';
import * as vscode from 'vscode';

import { parse } from '../services/@l13/natives/jsons';
import { lstatSync, walkUp } from '../services/@l13/nodes/fse';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function get (key:string, value?:any) {
	
	return vscode.workspace.getConfiguration('l13Diff').get(key, value);
	
}

export function update (key:string, value:any, global:boolean = true) {
	
	return vscode.workspace.getConfiguration('l13Diff').update(key, value, global);
	
}

export function getIgnore (pathA:string, pathB:string) :string[] {
	
	const ignores = <string[]>vscode.workspace.getConfiguration('l13Diff').get('ignore', []);
	const ignoresA:string[] = useWorkspaceSettings(pathA) ? ignores : loadSettingsIgnore(pathA) || ignores;
	const ignoresB:string[] = useWorkspaceSettings(pathB) ? ignores : loadSettingsIgnore(pathB) || ignores;
	
	return [].concat(ignoresA, ignoresB).filter((value, index, values) => values.indexOf(value) === index);
	
}

export function ignoreTrimWhitespace () {
	
	const useDefault = get('ignoreTrimWhitespace', 'default');
	
	return useDefault === 'default' ? vscode.workspace.getConfiguration('diffEditor').get('ignoreTrimWhitespace', true) : useDefault === 'on';
	
}

export function enableTrash () {
	
	return vscode.workspace.getConfiguration('files').get('enableTrash', true);
	
}

//	Functions __________________________________________________________________

function loadSettingsIgnore (pathname:string) :string[] {
	
	const codePath = walkUp(pathname, '.vscode');
	
	if (!codePath) return null;
	
	const codeSettingsPath = join(codePath, 'settings.json');
	const stat = lstatSync(codeSettingsPath);
	let json:any = {};
	
	if (stat && stat.isFile()) {
		const content = fs.readFileSync(codeSettingsPath, { encoding: 'utf-8' });
		try {
			json = parse(content);
		} catch {
			vscode.window.showErrorMessage(`Syntax error in settings file '${codeSettingsPath}'!`);
		}
	}
	
	return json['l13Diff.ignore'] || null;
	
}

function useWorkspaceSettings (pathname:string) :boolean {
	
	return vscode.workspace.workspaceFile && vscode.workspace.workspaceFolders.some((folder) => pathname.startsWith(folder.uri.fsPath));
	
}