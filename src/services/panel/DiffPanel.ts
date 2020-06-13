//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import { remove } from '../../@l13/natvies/arrays';
import { Diff, DiffCopyMessage, DiffFile, DiffInitMessage, DiffMultiCopyMessage, StatsMap, Uri } from '../../types';
import { isMacOs, isWindows } from '../@l13/nodes/platforms';
import { formatNameAndDesc } from '../@l13/utils/formats';

import { DiffCompare } from '../actions/DiffCompare';
import { DiffCopy } from '../actions/DiffCopy';
import { DiffDelete } from '../actions/DiffDelete';
import { DiffOpen } from '../actions/DiffOpen';
import { DiffDialog } from '../common/DiffDialog';
import { DiffSettings } from '../common/DiffSettings';
import { DiffOutput } from '../output/DiffOutput';
import { DiffResult } from '../output/DiffResult';
import { DiffStats } from '../output/DiffStats';
import { DiffStatus } from '../output/DiffStatus';
import { DiffFavorites } from '../sidebar/DiffFavorites';
import { DiffHistory } from '../sidebar/DiffHistory';
import { DiffMenu } from './DiffMenu';
import { DiffMessage } from './DiffMessage';

const { floor, random } = Math;

//	Variables __________________________________________________________________

const platform = isMacOs ? 'mac' : isWindows ? 'win' : 'linux';

const PANEL_STATE = 'panelState';

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class DiffPanel {
	
	public static currentPanel:DiffPanel|undefined;
	public static currentPanels:DiffPanel[] = [];
	
	public static readonly viewType = 'l13Diff';
	
	private readonly panel:vscode.WebviewPanel;
	private readonly context:vscode.ExtensionContext;
	
	private readonly status:DiffStatus;
	private readonly output:DiffOutput;
	
	private readonly msg:DiffMessage;
	private readonly compare:DiffCompare;
	private readonly copy:DiffCopy;
	private readonly delete:DiffDelete;
	
	private disposables:vscode.Disposable[] = [];
	
	private constructor (panel:vscode.WebviewPanel, context:vscode.ExtensionContext, uris:null|Uri[]|vscode.Uri[] = null, compare?:boolean) {
		
		this.panel = panel;
		this.context = context;
		
		this.msg = new DiffMessage(panel, this.disposables);
		
		this.status = new DiffStatus(context);
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
				this.status.activate();
				this.output.activate();
			}
			
		}, null, this.disposables);
		
	//	compare
		
		this.msg.on('create:diffs', (data:DiffResult) => this.compare.initCompare(data));
		
		this.compare.onInitCompare(() => {
			
			this.status.update();
			this.output.clear();
			this.output.msg('LOG\n');
			
		}, null, this.disposables);
		
		this.compare.onDidNotCompare((data:DiffResult) => {
			
			this.msg.send('create:diffs', data);
			
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
			
			this.output.log(`Found ${total} entr${total === 1 ? 'y' : 'ies'}`);
			
		}, null, this.disposables);
		
		this.compare.onDidCompareFolders((data:DiffResult) => {
			
			const diffStats = new DiffStats(data);
			const total = diffStats.all.total;
			const text = `Compared ${total} entr${total === 1 ? 'y' : 'ies'}`;
			
			this.status.update(text);
			this.output.log(`${text}\n\n`);
			this.output.msg(diffStats.report());
			
			if (!total) vscode.window.showInformationMessage('No files or folders to compare!');
			
			this.msg.send('create:diffs', data);
			
		}, null, this.disposables);
		
	//	compare multi
		
		this.msg.on('compare:multi', () => {
			
			DiffPanel.currentPanels.forEach((diffPanel) => diffPanel.msg.send('compare:multi'));
			
		});
		
	//	update diffs
		
		this.msg.on('update:diffs', (data:DiffResult) => this.compare.updateDiffs(data));
		
		this.compare.onDidUpdateDiff((diff:Diff) => {
			
			this.output.log(`Compared "${diff.id}" again. Status is now '${diff.status}'.`);
			
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
			
			this.output.log(`Copied ${from.type} "${from.name}" from "${from.folder}" to "${to.folder}".`);
			
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
		
		this.delete.onDidDeleteFile((file:DiffFile) => this.output.log(`Deleted ${file.type} "${file.path}".`), null, this.disposables);
		
		this.delete.onDidDeleteFiles((data:DiffResult) => {
			
			this.msg.send('delete:files', data);
			
			DiffPanel.currentPanels.forEach((diffPanel) => {
					
				if (diffPanel !== this) diffPanel.msg.send('update:multi', data);
				
			});
			
		}, null, this.disposables);
		
	//	open
		
		this.msg.on('open:diffToSide', (diff:Diff) => DiffOpen.open(diff, true));
		this.msg.on('open:diff', (diff:Diff) => DiffOpen.open(diff, DiffSettings.get('openToSide', false)));
		
		this.msg.on('reveal:file', (pathname:string) => DiffOpen.reveal(pathname));
		
		this.msg.on('open:dialog', async () => {
			
			const folder = await DiffDialog.open();
			
			this.msg.send('open:dialog', { folder });
			
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
			
		});
		
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
		
		DiffPanel.currentPanel = currentPanels[currentPanels.length - 1];
		
		for (const diffPanel of currentPanels) {
			if (diffPanel.panel.active) {
				DiffPanel.currentPanel = diffPanel;
				break;
			}
		}
		
		if (!DiffPanel.currentPanel || !DiffPanel.currentPanel.panel.active) {
			this.setContextFocus(false);
		}
		
	}
	
	private setTitle (pathA?:string, pathB?:string) {
		
		let title = 'Diff';
		
		if (pathA && pathB) {
			const [label, desc] = formatNameAndDesc(pathA, pathB);
			title = `${label} (${desc})`;
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
	
	private setContextFocus (value:boolean) {
		
		vscode.commands.executeCommand('setContext', 'l13DiffFocus', value);
		
	}
	
	private getHTMLforDiff (webview:vscode.Webview) {
		
		const scriptUri = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'main.js'));
		const styleUri = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'style.css'));
		
		const nonceToken = nonce();
		const csp = `default-src 'none'; img-src ${webview.cspSource} data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonceToken}';`;
		
		return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="${csp}">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>L13 Diff</title>
				<link rel="stylesheet" nonce="${nonceToken}" href="${webview.asWebviewUri(styleUri)}">
				<script nonce="${nonceToken}" src="${webview.asWebviewUri(scriptUri)}"></script>
			</head>
			<body class="platform-${platform}"></body>
		</html>`;
		
	}
	
	public static create (context:vscode.ExtensionContext, uris:null|Uri[]|vscode.Uri[] = null, compare?:boolean) {
		
		const panel = vscode.window.createWebviewPanel(DiffPanel.viewType, 'Diff', {
			viewColumn: vscode.ViewColumn.Active,
		}, {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(context.extensionPath, 'media')),
			],
			retainContextWhenHidden: true,
		});
		
		panel.iconPath = {
			dark: vscode.Uri.file(path.join(context.extensionPath, 'media', 'icons', 'icon-dark.svg')),
			light: vscode.Uri.file(path.join(context.extensionPath, 'media', 'icons', 'icon-light.svg')),
		};
		
		const diffPanel = new DiffPanel(panel, context, uris, compare);;
		
		DiffPanel.currentPanel = diffPanel;
		DiffPanel.currentPanels.push(diffPanel);
		
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
	
	public static addToFavorites () {
		
		if (DiffPanel.currentPanel) DiffPanel.currentPanel.msg.send('save:favorite');
		
	}
	
	public static send (name:string, data:any) {
		
		if (DiffPanel.currentPanel) DiffPanel.currentPanel.msg.send(name, data);
		
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