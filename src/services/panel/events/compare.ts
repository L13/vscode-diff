//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import type { Diff, DiffStatus, StatsMap } from '../../../types';

import { formatAmount } from '../../../@l13/formats';
import { pluralEntries } from '../../../@l13/units/files';

import { DiffResult } from '../../output/DiffResult';
import { DiffStats } from '../../output/DiffStats';

import { HistoryState } from '../../states/HistoryState';
import { MenuState } from '../../states/MenuState';

import type { DiffPanel } from '../DiffPanel';

//	Variables __________________________________________________________________

const findFileOperator = /\[[!=+-]\]/;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function init (currentDiffPanel: DiffPanel) {
	
	const historyState = HistoryState.create(currentDiffPanel.context);
	const menuState = MenuState.create(currentDiffPanel.context);
	
	currentDiffPanel.msg.on('create:diffs', (data: DiffResult) => {
		
		currentDiffPanel.compare.initCompare(data);
		
	});
	
	currentDiffPanel.compare.onWillCompare(() => {
		
		currentDiffPanel.status.update();
		currentDiffPanel.output.clear();
		currentDiffPanel.output.msg('LOG\n');
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.compare.onDidNotCompare(({ diffSettings, error, pathA, pathB }) => {
		
		currentDiffPanel.output.log(`${error}`);
		
		if (error instanceof Error) currentDiffPanel.output.msg(`${error.stack}`);
		
		if (diffSettings) currentDiffPanel.output.msg(`\n\n\n${DiffStats.formatSettings(diffSettings)}`);
		
		currentDiffPanel.msg.send('create:diffs', new DiffResult(pathA, pathB, null));
		
	}, null, currentDiffPanel.disposables);
	
// compare files
	
	currentDiffPanel.compare.onWillCompareFiles(({ data, pathA, pathB }) => {
		
		historyState.add(pathA, pathB, 'file');
		menuState.saveRecentlyUsed(data.pathA, data.pathB);
		currentDiffPanel.setTitle(pathA, pathB);
		currentDiffPanel.output.log(`Comparing "${pathA}" ↔ "${pathB}"`);
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.compare.onDidCompareFiles((data: DiffResult) => {
		
		currentDiffPanel.msg.send('create:diffs', data);
		
	}, null, currentDiffPanel.disposables);
	
//	compare folders
	
	currentDiffPanel.compare.onWillCompareFolders(({ data, pathA, pathB }) => {
		
		historyState.add(pathA, pathB, 'folder');
		menuState.saveRecentlyUsed(data.pathA, data.pathB);
		currentDiffPanel.setTitle(pathA, pathB);
		currentDiffPanel.output.log(`Start comparing "${pathA}" ↔ "${pathB}"`);
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.compare.onWillScanFolder((pathname: string) => {
		
		currentDiffPanel.output.log(`Scanning "${pathname}"`);
		
	}, null, currentDiffPanel.disposables);
	
	currentDiffPanel.compare.onDidScanFolder((result: StatsMap) => {
		
		const total = Object.entries(result).length;
		
		currentDiffPanel.output.log(`Found ${formatAmount(total, pluralEntries)}`);
		
	}, null, currentDiffPanel.disposables);
	
	if (currentDiffPanel.context.extensionMode === vscode.ExtensionMode.Development) {
		currentDiffPanel.compare.onDidCompareFolders((data: DiffResult) => {
			
			checkResult(data);
			
		}, null, currentDiffPanel.disposables);
	}
	
	currentDiffPanel.compare.onDidCompareFolders((data: DiffResult) => {
		
		currentDiffPanel.output.log('Creating stats for diff result');
		
		const diffStats = new DiffStats(data);
		const ignoredEntries = diffStats.ignored.entries;
		const comparedEntries = diffStats.all.entries - ignoredEntries;
		let text = `Compared ${formatAmount(comparedEntries, pluralEntries)}`;
		
		currentDiffPanel.status.update(text);
		
		if (ignoredEntries) text += `, ignored ${formatAmount(ignoredEntries, pluralEntries)}`;
		
		currentDiffPanel.output.log(`${text}\n\n\n`);
		currentDiffPanel.output.msg(diffStats.report());
		
		if (!comparedEntries) vscode.window.showInformationMessage('No files or folders to compare.');
		
		currentDiffPanel.msg.send('create:diffs', data);
		
	}, null, currentDiffPanel.disposables);
	
//	compare multi
	
	currentDiffPanel.msg.on('compare:multi', () => {
		
		currentDiffPanel.sendAll('compare:multi');
		
	});
	
}

//	Functions __________________________________________________________________

function testStatus (diff: Diff, status: DiffStatus) {
	
	if (diff.status !== status) {
		vscode.window.showErrorMessage(`The result for "${diff.id}" is not "${status}".`);
	}
	
}

function checkResult (data: DiffResult) {
	
	data.diffs.forEach((diff) => {
				
		const basenameA = diff.fileA?.basename;
		const basenameB = diff.fileB?.basename;
		
		if (basenameA && findFileOperator.test(basenameA) || basenameB && findFileOperator.test(basenameB)) {
			if (basenameA && basenameB) {
				if (basenameA.includes('[=]') && basenameB.includes('[=]')) testStatus(diff, 'unchanged');
				else if (basenameA.includes('[!]') && basenameB.includes('[!]')) testStatus(diff, 'modified');
				else if (basenameA.includes('[~]') && basenameB.includes('[~]')) testStatus(diff, 'conflicting');
				else vscode.window.showErrorMessage(`The result for "${diff.id}" does not match the requirements.`);
			} else if (basenameA) {
				if (basenameA.includes('[-]')) testStatus(diff, 'deleted');
			} else if (basenameB.includes('[+]')) testStatus(diff, 'untracked');
		}
		
	});
	
}