//	Imports ____________________________________________________________________

import * as fs from 'fs';
import { join } from 'path';
import * as vscode from 'vscode';

import { parse } from './@l13/natives/jsons';
import { createFindGlob, lstatSync, walkUp } from './@l13/nodes/fse';

import { TextFiles } from '../types';

const { push } = Array.prototype;

//	Variables __________________________________________________________________

export const textfiles:TextFiles = {
	extensions: [],
	filenames: [],
	glob: null,
};

//	Initialize _________________________________________________________________

buildWhitelistForTextFiles();

vscode.extensions.onDidChange(() => buildWhitelistForTextFiles());

//	Exports ____________________________________________________________________

export class DiffSettings {
	
	public static get (key:string, value?:any) {
		
		return vscode.workspace.getConfiguration('l13Diff').get(key, value);
		
	}
	
	public static update (key:string, value:any, global:boolean = true) {
		
		return vscode.workspace.getConfiguration('l13Diff').update(key, value, global);
		
	}
	
	public static getIgnore (pathA:string, pathB:string) :string[] {
		
		const ignores = <string[]>vscode.workspace.getConfiguration('l13Diff').get('ignore', []);
		const ignoresA:string[] = useWorkspaceSettings(pathA) ? ignores : loadSettingsIgnore(pathA) || ignores;
		const ignoresB:string[] = useWorkspaceSettings(pathB) ? ignores : loadSettingsIgnore(pathB) || ignores;
		
		return [].concat(ignoresA, ignoresB).filter((value, index, values) => values.indexOf(value) === index);
		
	}
	
	public static ignoreTrimWhitespace () {
		
		const useDefault = DiffSettings.get('ignoreTrimWhitespace', 'default');
		
		return useDefault === 'default' ? vscode.workspace.getConfiguration('diffEditor').get('ignoreTrimWhitespace', true) : useDefault === 'on';
		
	}
	
	public static enableTrash () {
		
		return vscode.workspace.getConfiguration('files').get('enableTrash', true);
		
	}
	
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

function buildWhitelistForTextFiles () {
	
	const config = vscode.workspace.getConfiguration();
	
	textfiles.extensions = ['.txt'];
	textfiles.filenames = [];
	
	vscode.extensions.all.forEach((extension) => {
		
		const packageJSON = extension.packageJSON;
		
		if (packageJSON.contributes && packageJSON.contributes.languages) {
			packageJSON.contributes.languages.forEach((language:any) => {
				
				if (language.extensions) push.apply(textfiles.extensions, language.extensions);
				if (language.filenames) push.apply(textfiles.filenames, language.filenames);
				
			});
		}
		
	});
	
	if (config.has('files.associations')) {
		textfiles.glob = createFindGlob(Object.keys(config.get<object>('files.associations', {})));
	} else textfiles.glob = null;
	
	textfiles.extensions.sort();
	textfiles.filenames.sort();
	
}