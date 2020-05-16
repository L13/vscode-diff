//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import { Uri } from '../types';
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
import { DiffStatus } from './DiffStatus';

const floor = Math.floor;
const random = Math.random;

//	Variables __________________________________________________________________

let platform = 'other';

//	Initialize _________________________________________________________________

if (process.platform === 'darwin') platform = 'mac';
if (process.platform === 'win32') platform = 'win';

//	Exports ____________________________________________________________________

export class DiffPanel {
	
	public static currentPanel:DiffPanel|undefined;
	public static readonly viewType = 'l13Diff';
	
	private readonly panel:vscode.WebviewPanel;
	private readonly context:vscode.ExtensionContext;
	
	private readonly status:DiffStatus;
	private readonly output:DiffOutput;
	
	private readonly dialog:DiffDialog;
	private readonly msg:DiffMessage;
	private readonly open:DiffOpen;
	private readonly menu:DiffMenu;
	private readonly list:DiffCompare;
	private readonly copy:DiffCopy;
	private readonly delete:DiffDelete;
	
	private disposables:vscode.Disposable[] = [];
	
	public static createOrShow (context:vscode.ExtensionContext, uris:null|Uri[]|vscode.Uri[] = null, compare?:boolean) {
		
		const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
		
		if (DiffPanel.currentPanel) {
			DiffPanel.currentPanel.panel.reveal(column);
			if (uris) {
				DiffPanel.currentPanel.msg.send('update:paths', {
					uris: mapUris(uris),
					compare,
				});
			}
			return;
		}
		
		const panel = vscode.window.createWebviewPanel(DiffPanel.viewType, 'Diff', {
			viewColumn: column || vscode.ViewColumn.Active,
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
		
		DiffPanel.currentPanel = new DiffPanel(panel, context, uris, compare);
		
	}
	
	public static revive (panel:vscode.WebviewPanel, context:vscode.ExtensionContext) {
		
		DiffPanel.currentPanel = new DiffPanel(panel, context);
		
	}
	
	public static addToFavorites () {
		
		DiffPanel.currentPanel.msg.send('save:favorite');
		
	}
	
	private constructor (panel:vscode.WebviewPanel, context:vscode.ExtensionContext, uris:null|Uri[]|vscode.Uri[] = null, compare?:boolean) {
		
		this.panel = panel;
		this.context = context;
		
		this.status = DiffStatus.createStatusBar(context);
		this.output = DiffOutput.createOutput();
		this.msg = new DiffMessage(panel, this.disposables);
		this.dialog = new DiffDialog(this.msg);
		this.open = new DiffOpen(this.msg);
		this.menu = new DiffMenu(this.msg, context);
		this.copy = new DiffCopy(this.msg);
		this.delete = new DiffDelete(this.msg);
		this.list = new DiffCompare(this.msg, context);
		
		this.disposables.push(this.status);
		this.disposables.push(this.output);
		this.disposables.push(this.msg);
		this.disposables.push(this.dialog);
		this.disposables.push(this.open);
		this.disposables.push(this.menu);
		this.disposables.push(this.copy);
		this.disposables.push(this.delete);
		this.disposables.push(this.list);
		
		this.panel.title = 'Diff';
		this.panel.webview.html = this.getHTMLforDiff(this.panel.webview);
		
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
		
		this.panel.onDidChangeViewState(({ webviewPanel }) => {
			
			this.setContextForFocus(webviewPanel.active);
			
		});
		
		this.msg.on('init:paths', () => {
			
			this.msg.send('init:paths', {
				uris: mapUris(uris),
				workspaces: workspacePaths(vscode.workspace.workspaceFolders),
				compare,
			});
			
		});
		
		this.msg.on('save:favorite', (data) => DiffFavorites.addFavorite(this.context, data.pathA, data.pathB));
		
		this.setContextForFocus(true);
		
	}
	
	public dispose () :void {
		
		DiffPanel.currentPanel = undefined;
		
		this.panel.dispose();
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
		this.setContextForFocus(false);
		
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