//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import type { Comparison, Favorite, FavoriteGroup } from '../../types';

import * as commands from '../common/commands';
import * as dialogs from '../common/dialogs';
import * as files from '../common/files';
import * as states from '../common/states';

//	Variables __________________________________________________________________

// eslint-disable-next-line no-useless-escape
const findBackupFileName = /\d{4}(\-\d{2}){5}(?:\-auto)?.json/;

type Backup = {
	comparisons: Comparison[],
	favorites: Favorite[],
	favoriteGroups: FavoriteGroup[],
	history: string[],
};

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context: vscode.ExtensionContext) {
	
	const dirname = path.join(context.globalStorageUri.fsPath, 'backups');
	
	commands.register(context, {
		'l13Diff.action.developer.backup': () => {
			
			createBackup(context, dirname, `${formatDate(new Date())}.json`);
			
		},
		
		'l13Diff.action.developer.reveal': () => {
			
			if (fs.existsSync(dirname)) files.reveal(dirname);
			else vscode.window.showInformationMessage('No backups available');
			
		},
		
		'l13Diff.action.developer.remove': async () => {
			
			const item = await selectBackup(dirname);
			
			if (item) fs.unlinkSync(path.join(dirname, item.label));
			
		},
		
		'l13Diff.action.developer.restore': async () => {
			
			const item = await selectBackup(dirname);
			
			if (item) {
				const content = <Backup>JSON.parse(fs.readFileSync(path.join(dirname, item.label), 'utf-8'));
				
				states.updateComparisons(context, content.comparisons);
				states.updateFavorites(context, content.favorites);
				states.updateFavoriteGroups(context, content.favoriteGroups);
				states.updateHistory(context, content.history);
				
				showMessageReload(`Restored backup "${item.label}"`);
			}
			
		},
		
		'l13Diff.action.developer.clear': async () => {
			
			if (!await dialogs.confirm('Delete all global states?', 'Ok')) return;
			if (!await dialogs.confirm('Are you sure?', 'Ok')) return;
			
			createBackup(context, dirname, `${formatDate(new Date())}-auto.json`);
			
			states.updateFavorites(context, undefined);
			states.updateFavoriteGroups(context, undefined);
			states.updateHistory(context, undefined);
			states.updateComparisons(context, undefined);
			
			showMessageReload('Cleared global state');
			
		},
	});

}

//	Functions __________________________________________________________________

async function createBackup (context: vscode.ExtensionContext, dirname: string, basename: string) {
	
	if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
	
	const filename = path.join(dirname, basename);
			
	const content: Backup = {
		comparisons: states.getComparisons(context),
		favorites: states.getFavorites(context),
		favoriteGroups: states.getFavoriteGroups(context),
		history: states.getHistory(context),
	};
	
	fs.writeFileSync(filename, JSON.stringify(content, null, '\t'), 'utf-8');
	
	const value = await vscode.window.showInformationMessage(`Created file "${basename}"`, 'Go to File');
	
	if (value) files.reveal(filename);
	
}

async function selectBackup (dirname: string) {
	
	if (!fs.existsSync(dirname)) {
		vscode.window.showInformationMessage('No backups available');
		return;
	}
	
	const filenames = fs.readdirSync(dirname);
	const items = filenames.filter((name) => findBackupFileName.test(name)).map((label) => ({ label }));
	
	if (!items.length) {
		vscode.window.showInformationMessage('No backups available');
		return;
	}
	
	return await vscode.window.showQuickPick(items, {
		placeHolder: 'Please select a backup to restore',
	});
	
}

function formatDate (date: Date) {
	
	// eslint-disable-next-line max-len
	return `${date.getFullYear()}-${formatDigit(date.getMonth() + 1)}-${formatDigit(date.getDate())}-${formatDigit(date.getHours())}-${formatDigit(date.getMinutes())}-${formatDigit(date.getSeconds())}`;
	
}

function formatDigit (digit: number) {
	
	return `${digit}`.padStart(2, '0');
	
}

async function showMessageReload (text: string) {
	
	const reload = await vscode.window.showInformationMessage(text, 'Reload Window');
	
	if (reload) vscode.commands.executeCommand('workbench.action.reloadWindow');
	
}