//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import { remove } from '../@l13/natvies/arrays';
import { Uri } from '../types';
import { isMacOs, isWindows } from './@l13/nodes/platforms';
import { workspacePaths } from './common';

import { DiffCompare } from './DiffCompare';
import { DiffCopy } from './DiffCopy';
import { DiffDelete } from './DiffDelete';
import { DiffDialog } from './DiffDialog';
import { DiffFavorites } from './DiffFavorites';
import { DiffMenu } from './DiffMenu';
import { DiffMessage } from './DiffMessage';
import { DiffOpen } from './DiffOpen';
import { DiffOutput } from './DiffOutput';
import { DiffSettings } from './DiffSettings';
import { DiffStatus } from './DiffStatus';

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
	
	private readonly dialog:DiffDialog;
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
		
		this.dialog = new DiffDialog(this.msg);
		this.copy = new DiffCopy(this.msg);
		this.delete = new DiffDelete(this.msg);
		this.compare = new DiffCompare(this.msg, context);
		
		this.disposables.push(this.status);
		this.disposables.push(this.output);
		this.disposables.push(this.msg);
		this.disposables.push(this.dialog);
		this.disposables.push(this.copy);
		this.disposables.push(this.delete);
		this.disposables.push(this.compare);
		
		this.panel.title = 'Diff';
		this.panel.webview.html = this.getHTMLforDiff(this.panel.webview);
		
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
		
		this.panel.onDidChangeViewState(({ webviewPanel }) => {
			
			this.setContextForFocus(webviewPanel.active);
			if (webviewPanel.active) DiffPanel.currentPanel = this;
			
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
		
		this.setContextForFocus(true);
		
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
			this.setContextForFocus(false);
		}
		
	}
	
	private savePanelState (data:any) :void {
		
		this.context.globalState.update(PANEL_STATE, data);
		
	}
	
	private setContextForFocus (value:boolean) {
		
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