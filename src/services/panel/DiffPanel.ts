//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import { remove } from '../../@l13/natvies/arrays';
import { Diff, Uri } from '../../types';
import { isMacOs, isWindows } from '../@l13/nodes/platforms';

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
		
		this.status = DiffStatus.createStatusBar(context);
		this.output = DiffOutput.createOutput();
		
		this.msg = new DiffMessage(panel, this.disposables);
		
		this.copy = new DiffCopy(this.msg);
		this.delete = new DiffDelete(this.msg);
		this.compare = new DiffCompare();
		
		this.disposables.push(this.compare);
		this.disposables.push(this.copy);
		this.disposables.push(this.delete);
		this.disposables.push(this.status);
		this.disposables.push(this.msg);
		this.disposables.push(this.output);
		
		this.panel.title = 'Diff';
		this.panel.webview.html = this.getHTMLforDiff(this.panel.webview);
		
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
		
		this.panel.onDidChangeViewState(({ webviewPanel }) => {
			
			this.setContextFocus(webviewPanel.active);
			if (webviewPanel.active) DiffPanel.currentPanel = this;
			
		});
		
		this.msg.on('create:diffs', (data) => this.compare.createDiffs(data));
		this.msg.on('update:diffs', (data) => this.compare.updateDiffs(data));
		
		this.compare.onDidNoCompare((diffResult:DiffResult) => {
			
			this.msg.send('create:diffs', { diffResult });
			
		});
		
		this.compare.onInitCompare(() => {
			
			this.status.update();
			this.output.clear();
			this.output.msg('LOG');
			this.output.msg();
			
		});
		
		this.compare.onDidUpdateDiff((diff:Diff) => {
			
			const status = diff.status;
			let statusInfo = ` Files are still '${status}'.`;
			
			if (status !== diff.status) statusInfo = ` Status has changed from '${status}' to '${diff.status}'.`;
			
			this.output.log(`Compared diff "${diff.id}".${statusInfo}`);
			
		});
		
		this.compare.onDidUpdateAllDiffs((diffResult:DiffResult) => {
			
			this.msg.send('update:diffs', { diffResult });
			
		});
		
		this.compare.onStartCompareFiles(({ data, pathA, pathB }) => {
			
			this.saveRecentlyUsed(data.pathA, data.pathB);
			this.saveHistory(pathA, pathB);
			this.output.log(`Comparing "${pathA}" ↔ "${pathB}"`);
			
		});
		
		this.compare.onStartCompareFolders(({ data, pathA, pathB }) => {
			
			this.saveRecentlyUsed(data.pathA, data.pathB);
			this.saveHistory(pathA, pathB);
			this.output.log(`Comparing "${pathA}" ↔ "${pathB}"`);
			
		});
		
		this.compare.onDidCompareFolders((diffResult:DiffResult) => {
			
			const diffStats = new DiffStats(diffResult);
			const total = diffStats.all.total;
			
			this.status.update(`Compared ${total} entr${total === 1 ? 'y' : 'ies'}`);
			
			this.output.msg();
			this.output.msg();
			this.output.msg(diffStats.report());
			
			if (!diffResult) this.status.update();
			
			this.msg.send('create:diffs', { diffResult });
			
		});
		
		this.delete.onDidDeleteFile((file) => this.output.log(`Deleted ${file.type} "${file.path}".`));
		
		this.copy.onDidCopyFile(({ from, to }) => {
			
			this.output.log(`Copied ${from.type} "${from.name}" from "${from.folder}" to "${to.folder}".`);
			
		});
		
		this.msg.on('open:diffToSide', (data) => DiffOpen.open(data, true));
		this.msg.on('open:diff', (data) => DiffOpen.open(data, DiffSettings.get('openToSide', false)));
		
		this.msg.on('reveal:file', (data) => DiffOpen.reveal(data));
		
		this.msg.on('update:menu', () => {
			
			this.msg.send('update:menu', {
				history: DiffMenu.getHistory(context),
				workspaces: workspacePaths(vscode.workspace.workspaceFolders),
			});
			
		});
		
		this.msg.on('open:dialog', async () => {
			
			const folder = await DiffDialog.open();
			
			this.msg.send('open:dialog', { folder });
			
		});
		
		this.msg.on('init:view', () => {
			
			this.msg.send('init:view', {
				panel: context.globalState.get(PANEL_STATE),
				uris: mapUris(uris),
				workspaces: workspacePaths(vscode.workspace.workspaceFolders),
				compare,
			});
			
		});
		
		this.msg.on('save:favorite', (data) => DiffFavorites.addFavorite(context, data.pathA, data.pathB));
		
		this.msg.on('save:panelstate', (data) => this.savePanelState(data));
		
		this.setContextFocus(true);
		
	}
	
	public dispose () :void {
		
		remove(DiffPanel.currentPanels, this);
		
		this.panel.dispose();
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
		DiffPanel.currentPanel = DiffPanel.currentPanels[DiffPanel.currentPanels.length - 1];
		
		DiffPanel.currentPanels.some((diffPanel) => {
			
			if (diffPanel.panel.active) {
				DiffPanel.currentPanel = diffPanel;
				return true;
			}
			
			return false;
			
		});
		
		if (!DiffPanel.currentPanel || !DiffPanel.currentPanel.panel.active) {
			this.setContextFocus(false);
		}
		
	}
	
	private saveRecentlyUsed (pathA:string, pathB:string) :void {
		
		DiffMenu.saveRecentlyUsed(this.context, pathA, pathB);
		
	}
	
	private saveHistory (pathA:string, pathB:string) {
		
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