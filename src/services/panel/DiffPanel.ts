//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import { Diff, DiffCopyMessage, DiffFile, DiffGoToMessage, DiffInitMessage, DiffMultiCopyMessage, DiffOpenMessage, StatsMap, Uri } from '../../types';

import { remove } from '../../@l13/arrays';
import { formatAmount } from '../../@l13/formats';
import { pluralEntries } from '../../@l13/units/files';
import { formatNameAndDesc } from '../@l13/formats';
import { isMacOs, isWindows } from '../@l13/platforms';

import * as dialogs from '../../common/dialogs';
import * as files from '../../common/files';
import * as settings from '../../common/settings';

import { DiffCompare } from '../actions/DiffCompare';
import { DiffCopy } from '../actions/DiffCopy';
import { DiffDelete } from '../actions/DiffDelete';
import { DiffOpen } from '../actions/DiffOpen';
import { DiffOutput } from '../output/DiffOutput';
import { DiffResult } from '../output/DiffResult';
import { DiffStats } from '../output/DiffStats';
import { DiffStatusbar } from '../output/DiffStatusbar';
import { DiffFavorites } from '../sidebar/DiffFavorites';
import { DiffHistory } from '../sidebar/DiffHistory';
import { DiffMenu } from './DiffMenu';
import { DiffMessage } from './DiffMessage';

const { floor, random } = Math;

//	Variables __________________________________________________________________

const findLanguage = /^[a-z]{2,3}(-[A-Z]{2,3})?$/;

const platform = isMacOs ? 'mac' : isWindows ? 'win' : 'linux';
const language = findLanguage.test(vscode.env.language) ? vscode.env.language : 'en';

const PANEL_STATE = 'panelState';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffPanel {
	
	public static currentPanel:DiffPanel|undefined;
	public static currentPanels:DiffPanel[] = [];
	
	public static readonly viewType = 'l13Diff';
	
	private readonly panel:vscode.WebviewPanel;
	private readonly context:vscode.ExtensionContext;
	
	private readonly status:DiffStatusbar;
	private readonly output:DiffOutput;
	
	private readonly msg:DiffMessage;
	private readonly compare:DiffCompare;
	private readonly copy:DiffCopy;
	private readonly delete:DiffDelete;
	
	public readonly contextStates:{ [name:string]: boolean } = {};
	
	private disposables:vscode.Disposable[] = [];
	
	private _onDidInit:vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onDidInit:vscode.Event<undefined> = this._onDidInit.event;
	
	private constructor (panel:vscode.WebviewPanel, context:vscode.ExtensionContext, uris:null|Uri[]|vscode.Uri[] = null, compare?:boolean) {
		
		this.panel = panel;
		this.context = context;
		
		this.msg = new DiffMessage(panel, this.disposables);
		
		this.status = new DiffStatusbar(context);
		this.output = new DiffOutput();
		
		this.copy = new DiffCopy();
		this.delete = new DiffDelete();
		this.compare = new DiffCompare();
		
		this.disposables.push(this.msg);
		this.disposables.push(this.output);
		this.disposables.push(this.status);
		
		this.setTitle();
		this.panel.webview.html = this.getHTMLforDiff(this.panel.webview);
		
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
		
		this.panel.onDidChangeViewState(({ webviewPanel }) => {
			
			this.setContextFocus(webviewPanel.active);
			
			if (webviewPanel.active) {
				DiffPanel.currentPanel = this;
				this.msg.send('focus'); // Fixes losing focus if other tab has been closed
				this.status.activate();
				this.output.activate();
				for (const name in this.contextStates) this.setContext(name, this.contextStates[name]);
			} else {
				for (const name in this.contextStates) this.setContext(name, false);
			}
			
		}, null, this.disposables);
		
	//	compare
		
		this.msg.on('create:diffs', (data:DiffResult) => this.compare.initCompare(data));
		
		this.compare.onInitCompare(() => {
			
			this.status.update();
			this.output.clear();
			this.output.msg('LOG\n');
			
		}, null, this.disposables);
		
		this.compare.onDidNotCompare(({ error, pathA, pathB}) => {
			
			this.output.log(`${error}`);
			
			if (error instanceof Error) this.output.msg(`${error.stack}`);
			
			this.msg.send('create:diffs', new DiffResult(pathA, pathB));
			
		}, null, this.disposables);
		
	// compare files
		
		this.compare.onStartCompareFiles(({ data, pathA, pathB }) => {
			
			this.saveHistory(data, pathA, pathB);
			this.setTitle(pathA, pathB);
			this.output.log(`Comparing "${pathA}" ↔ "${pathB}"`);
			
		}, null, this.disposables);
		
		this.compare.onDidCompareFiles((data:DiffResult) => {
			
			this.msg.send('create:diffs', data);
			
		}, null, this.disposables);
		
	//	compare folders
		
		this.compare.onStartCompareFolders(({ data, pathA, pathB }) => {
			
			this.saveHistory(data, pathA, pathB);
			this.setTitle(pathA, pathB);
			this.output.log(`Start comparing "${pathA}" ↔ "${pathB}"`);
			
		}, null, this.disposables);
		
		this.compare.onStartScanFolder((pathname:string) => {
			
			this.output.log(`Scanning "${pathname}"`);
			
		}, null, this.disposables);
		
		this.compare.onEndScanFolder((result:StatsMap) => {
			
			const total = Object.entries(result).length;
			
			this.output.log(`Found ${formatAmount(total, pluralEntries)}`);
			
		}, null, this.disposables);
		
		this.compare.onDidCompareFolders((data:DiffResult) => {
			
			this.output.log('Creating stats for diff result');
			
			const diffStats = new DiffStats(data);
			const ignoredEntries = diffStats.ignored.entries;
			const comparedEntries = diffStats.all.entries - ignoredEntries;
			let text = `Compared ${formatAmount(comparedEntries, pluralEntries)}`;
			
			this.status.update(text);
			
			if (ignoredEntries) text += `, ignored ${formatAmount(ignoredEntries, pluralEntries)}`;
			
			this.output.log(`${text}\n\n\n`);
			this.output.msg(diffStats.report());
			
			if (!comparedEntries) vscode.window.showInformationMessage('No files or folders to compare.');
			
			this.msg.send('create:diffs', data);
			
		}, null, this.disposables);
		
	//	compare multi
		
		this.msg.on('compare:multi', () => {
			
			DiffPanel.currentPanels.forEach((diffPanel) => diffPanel.msg.send('compare:multi'));
			
		});
		
	//	update diffs
		
		this.msg.on('update:diffs', (data:DiffResult) => this.compare.updateDiffs(data));
		
		this.compare.onDidUpdateDiff((diff:Diff) => {
			
			this.output.log(`Compared "${formatPath(diff)}" again. Status is now "${diff.status}"`);
			
		}, null, this.disposables);
		
		this.compare.onDidUpdateAllDiffs((diffResult:DiffResult) => {
			
			this.msg.send('update:diffs', diffResult);
			
		}, null, this.disposables);
		
	//	copy
		
		this.msg.on('copy:left', (data:DiffCopyMessage) => this.copy.showCopyFromToDialog(data, 'A', 'B'));
		this.msg.on('copy:right', (data:DiffCopyMessage) => this.copy.showCopyFromToDialog(data, 'B', 'A'));
		
		this.msg.on('multi-copy:left', (data:DiffMultiCopyMessage) => this.copy.showMultiCopyFromToDialog(data, 'left'));
		this.msg.on('multi-copy:right', (data:DiffMultiCopyMessage) => this.copy.showMultiCopyFromToDialog(data, 'right'));
		
		this.copy.onDidCancel(() => this.msg.send('cancel'), null, this.disposables);
		
		this.copy.onDidCopyFile(({ from, to }) => {
			
			this.output.log(`Copied ${from.type} "${from.name}" from "${from.root}" to "${to.root}"`);
			
		}, null, this.disposables);
		
		this.copy.onDidCopyFiles(({ data, from }) => {
			
			this.msg.send(from === 'A' ? 'copy:left' : 'copy:right', data);
			
			if (data.multi) {
				DiffPanel.currentPanels.forEach((diffPanel) => {
					
					if (diffPanel !== this) diffPanel.msg.send('update:multi', data);
					
				});
			}
			
		}, null, this.disposables);
		
		this.copy.onInitMultiCopy(({ data, from }) => {
			
			DiffPanel.currentPanels.forEach((diffPanel) => diffPanel.msg.send(`multi-copy:${from}`, data));
			
		}, null, this.disposables);
		
	//	delete
		
		this.msg.on('delete:files', (data:DiffResult) => this.delete.showDeleteFilesDialog(data));
		this.msg.on('delete:left', (data:DiffResult) => this.delete.showDeleteFileDialog(data, 'left'));
		this.msg.on('delete:right', (data:DiffResult) => this.delete.showDeleteFileDialog(data, 'right'));
		
		this.delete.onDidCancel(() => this.msg.send('cancel'), null, this.disposables);
		
		this.delete.onDidDeleteFile((file:DiffFile) => this.output.log(`Deleted ${file.type} "${file.path}"`), null, this.disposables);
		
		this.delete.onDidDeleteFiles((data:DiffResult) => {
			
			this.msg.send('delete:files', data);
			
			DiffPanel.currentPanels.forEach((diffPanel) => {
					
				if (diffPanel !== this) diffPanel.msg.send('update:multi', data);
				
			});
			
		}, null, this.disposables);
		
	//	open
		
		this.msg.on('open:diff', async ({ diffs, openToSide }:DiffOpenMessage) => {
			
			openToSide = settings.get('openToSide', false) || openToSide;
			
			for (let i = 0; i < diffs.length; i++) await DiffOpen.open(diffs[i], i === 0 && openToSide);
			
		});
		
		this.msg.on('goto:file', async ({ files, openToSide }:DiffGoToMessage) => {
			
			openToSide = settings.get('openToSide', false) || openToSide;
			
			for (let i = 0; i < files.length; i++) await DiffOpen.openFile(files[i], i === 0 && openToSide);
			
		});
		
		this.msg.on('reveal:file', (fsPath:string) => files.reveal(fsPath));
		
		this.msg.on('dialog:file', async () => {
			
			const fsPath = await dialogs.openFile();
			
			this.msg.send('dialog:file', { fsPath });
			
		});
		
		this.msg.on('dialog:folder', async () => {
			
			const fsPath = await dialogs.openFolder();
			
			this.msg.send('dialog:folder', { fsPath });
			
		});
		
	//	menu
		
		this.msg.on('update:menu', () => {
			
			this.msg.send('update:menu', {
				history: DiffMenu.getHistory(context),
				workspaces: workspacePaths(vscode.workspace.workspaceFolders),
			});
			
		});
		
	//	favorites
		
		this.msg.on('save:favorite', (data) => DiffFavorites.addFavorite(context, data.pathA, data.pathB));
		
	//	panel state
		
		this.msg.on('save:panelstate', (data) => this.savePanelState(data));
		
	//	init
		
		this.msg.on('init:view', () => {
			
			this.msg.send('init:view', {
				panel: context.globalState.get(PANEL_STATE),
				uris: mapUris(uris),
				workspaces: workspacePaths(vscode.workspace.workspaceFolders),
				compare,
			});
			
			this.msg.removeMessageListener('init:view');
			this._onDidInit.fire(undefined);
			
		});
		
	//	context
		
		this.msg.on('context', ({ name, value }) => this.setContext(name, value));
		
		this.setContextFocus(true);
		
	}
	
	public dispose () :void {
		
		const currentPanels = DiffPanel.currentPanels;
		
		remove(currentPanels, this);
		
		this.panel.dispose();
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
		if (this === DiffPanel.currentPanel) {
			for (const name in this.contextStates) this.setContext(name, false);
		}
		
		DiffPanel.currentPanel = currentPanels[currentPanels.length - 1];
		
		for (const diffPanel of currentPanels) {
			if (diffPanel.panel.active) {
				DiffPanel.currentPanel = diffPanel;
				break;
			}
		}
		
		if (DiffPanel.currentPanel) {
			DiffPanel.currentPanel.status.activate();
			DiffPanel.currentPanel.output.activate();
			if (DiffPanel.currentPanel.panel.active) {
				this.setContextFocus(true);
				for (const name in this.contextStates) this.setContext(name, this.contextStates[name]);
			}
		} else this.setContextFocus(false);
		
	}
	
	private setTitle (pathA?:string, pathB?:string) {
		
		let title = 'Diff Folders';
		
		if (pathA && pathB) {
			const [label, desc] = formatNameAndDesc(pathA, pathB);
			title = desc ? `${label} (${desc})` : label;
		}
		
		this.panel.title = title;
		
	}
	
	private saveHistory (data:DiffInitMessage, pathA:string, pathB:string) {
		
		DiffMenu.saveRecentlyUsed(this.context, data.pathA, data.pathB);
		
		DiffHistory.saveComparison(this.context, pathA, pathB);
		DiffHistory.currentProvider?.refresh();
		
	}
	
	private savePanelState (data:any) :void {
		
		this.context.globalState.update(PANEL_STATE, data);
		
	}
	
	private setContext (name:string, value:boolean) {
		
		this.contextStates[name] = value;
		
		vscode.commands.executeCommand('setContext', name, value);
		
	}
	
	private setContextFocus (value:boolean) {
		
		vscode.commands.executeCommand('setContext', 'l13DiffFocus', value);
		
	}
	
	private getHTMLforDiff (webview:vscode.Webview) {
		
		const mediaPath = path.join(this.context.extensionPath, 'media');
		const scriptUri = vscode.Uri.file(path.join(mediaPath, 'main.js'));
		const styleUri = vscode.Uri.file(path.join(mediaPath, 'style.css'));
		
		const nonceToken = nonce();
		const csp = `default-src 'none'; img-src ${webview.cspSource} data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonceToken}';`;
		
		return `<!DOCTYPE html>
		<html lang="${language}">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="${csp}">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Diff Folders</title>
				<script nonce="${nonceToken}">
					window.l13TimeoutId = setTimeout(() => {
						
						acquireVsCodeApi().postMessage({
							command: 'error:init',
							data: { error: 'Failed to load resources!' },
						});
						
					}, 1000);
				</script>
				<link rel="stylesheet" nonce="${nonceToken}" href="${webview.asWebviewUri(styleUri)}">
				<script nonce="${nonceToken}" src="${webview.asWebviewUri(scriptUri)}"></script>
			</head>
			<body class="platform-${platform} language-${language}"></body>
		</html>`;
		
	}
	
	public static async create (context:vscode.ExtensionContext, uris:null|Uri[]|vscode.Uri[] = null, compare?:boolean, openToSide?:boolean) {
		
		const mediaPath = path.join(context.extensionPath, 'media');
		const iconsPath = path.join(mediaPath, 'icons');
		const panel = vscode.window.createWebviewPanel(DiffPanel.viewType, 'Diff Folders', {
			viewColumn: openToSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
		}, {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(mediaPath),
			],
			retainContextWhenHidden: true,
		});
		
		panel.iconPath = {
			dark: vscode.Uri.file(path.join(iconsPath, 'icon-dark.svg')),
			light: vscode.Uri.file(path.join(iconsPath, 'icon-light.svg')),
		};
		
		const diffPanel = new DiffPanel(panel, context, uris, compare);
		
		DiffPanel.currentPanel = diffPanel;
		DiffPanel.currentPanels.push(diffPanel);
		
		return new Promise((resolve, reject) => {
			
			diffPanel.onDidInit(() => resolve(), null, diffPanel.disposables);
			
			diffPanel.msg.on('error:init', async ({ error }) => {
				
				const tryAgain = await vscode.window.showErrorMessage(error, 'Try Again');
				
				diffPanel.dispose();
				
				resolve(tryAgain ? DiffPanel.create(context, uris, compare) : undefined);
				
			});
			
		});
		
	}
	
	public static createOrShow (context:vscode.ExtensionContext, uris:null|Uri[]|vscode.Uri[] = null, compare?:boolean) {
		
		if (DiffPanel.currentPanel) {
			DiffPanel.currentPanel.panel.reveal();
			if (uris) {
				DiffPanel.currentPanel.msg.send('update:paths', {
					uris: mapUris(uris),
					compare,
				});
			}
			return;
		}
		
		DiffPanel.create(context, uris, compare);
		
	}
	
	public static revive (panel:vscode.WebviewPanel, context:vscode.ExtensionContext) {
		
		const diffPanel = new DiffPanel(panel, context);
		
		DiffPanel.currentPanel = diffPanel;
		DiffPanel.currentPanels.push(diffPanel);
		
	}
	
	public static send (name:string, data:any = null) {
		
		DiffPanel.currentPanel?.msg.send(name, data);
		
	}
	
	public static sendAll (name:string, data:any) {
		
		DiffPanel.currentPanels.forEach((diffPanel) => diffPanel.msg.send(name, data));
		
	}
	
}

//	Functions __________________________________________________________________

function nonce () {
	
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const length = possible.length;
	let text = '';
	
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(floor(random() * length));
	}
	
	return text;
	
}

function mapUris (uris:null|Uri[]|vscode.Uri[]) :Uri[] {
	
	return (uris || []).map((uri) => ({ fsPath: uri.fsPath }));
	
}

function workspacePaths (workspaceFolders:readonly vscode.WorkspaceFolder[]|undefined) {
	
	return (workspaceFolders || []).map((item:vscode.WorkspaceFolder) => item.uri.fsPath);
	
}

function formatPath (diff:Diff) {
	
	const relativeA = diff.fileA.relative;
	const relativeB = diff.fileB.relative;
	
	return relativeA === relativeB ? relativeA : `${relativeA}" and "${relativeB}`;
	
}