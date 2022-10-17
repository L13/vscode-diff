//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { JSONObject } from '../../types';

import { lstatSync, walkUp } from '../@l13/fse';
import { parse } from '../@l13/jsonc';

//	Variables __________________________________________________________________

export const hasCaseSensitiveFileSystem = !fs.existsSync(path.join(__dirname, path.basename(__filename).toUpperCase()));

const MB = 1048576;
const MAX_FILE_SIZE = Number.MAX_SAFE_INTEGER / MB;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function get (key: string, value?: any) {
	
	return vscode.workspace.getConfiguration('l13Diff').get(key, value);
	
}

export function update (key: string, value: any, global = true) {
	
	return vscode.workspace.getConfiguration('l13Diff').update(key, value, global);
	
}

export function maxHistoryEntries (): number {
	
	return get('maxHistoryEntries', 10);
	
}

export function maxRecentlyUsed (): number {
	
	return get('maxRecentlyUsed', 10);
	
}

export function getExcludes (pathA: string, pathB: string): string[] {
	
	let ignore = get('ignore');
	
	if (ignore) ignore = showDepricated(ignore, 'Settings');
	
	const excludes = get('exclude', []) || ignore;
	const excludesA: string[] = useWorkspaceSettings(pathA) ? excludes : loadSettingsExclude(pathA) || excludes;
	const excludesB: string[] = useWorkspaceSettings(pathB) ? excludes : loadSettingsExclude(pathB) || excludes;
	
	return [...excludesA, ...excludesB].filter((value, index, values) => values.indexOf(value) === index);
	
}

export function ignoreTrimWhitespace () {
	
	const useDefault = get('ignoreTrimWhitespace', 'default');
	
	return useDefault === 'default' ? vscode.workspace.getConfiguration('diffEditor').get('ignoreTrimWhitespace', true) : useDefault === 'on';
	
}

export function enableTrash () {
	
	const enableTrashValue = get('enableTrash', 'default');
	
	return enableTrashValue === 'default' ? vscode.workspace.getConfiguration('files').get('enableTrash', true) : enableTrashValue === 'on';
	
}

export function maxFileSize () {
	
	const maxFileSizeValue = parseInt(`${get('maxFileSize', 0)}`, 10);
	
	return maxFileSizeValue > 0 && maxFileSizeValue < MAX_FILE_SIZE ? maxFileSizeValue * MB : 0;
	
}

export function openInNewPanel () {
	
	return get('openInNewDiffPanel', false);
	
}

//	Functions __________________________________________________________________

function loadSettingsExclude (pathname: string): string[] {
	
	const codePath = walkUp(pathname, '.vscode');
	
	if (!codePath) return null;
	
	const codeSettingsPath = path.join(codePath, 'settings.json');
	const stat = lstatSync(codeSettingsPath);
	let json: JSONObject = {};
	
	if (stat && stat.isFile()) {
		const content = fs.readFileSync(codeSettingsPath, { encoding: 'utf-8' });
		try {
			json = parse(content);
		} catch {
			vscode.window.showErrorMessage(`Syntax error in settings file "${codeSettingsPath}"!`);
		}
	}
	
	let ignore: string[] = <string[]>json['l13Diff.ignore'];
	
	if (ignore) ignore = showDepricated(ignore, pathname);
	
	return <string[]>json['l13Diff.exclude'] || ignore || null;
	
}

function useWorkspaceSettings (pathname: string): boolean {
	
	return vscode.workspace.workspaceFile && vscode.workspace.workspaceFolders.some((folder) => pathname.startsWith(folder.uri.fsPath));
	
}

function showDepricated (ignore: string[], pathname?: string) {
	
	const filename = pathname ? `${pathname}: ` : '';
	const message = `${filename}"l13Diff.ignore" is depricated. Please use "l13Diff.exclude" which supports more glob patterns like path segments.`;
	
	vscode.window.showWarningMessage(message);
	
	return ignore.map((pattern) => `**/${pattern}`);
	
}