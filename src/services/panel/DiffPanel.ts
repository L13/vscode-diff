//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import type { ContextStates, DiffInitViewMessage, DiffPanelStateMessage, DiffUpdatePathsMessage, Uri } from '../../types';

import { remove } from '../../@l13/arrays';
import { formatName, formatNameAndDesc } from '../@l13/formats';
import { isMacOs, isWindows } from '../@l13/platforms';

import { DiffCompare } from '../actions/DiffCompare';
import { DiffCopy } from '../actions/DiffCopy';
import { DiffDelete } from '../actions/DiffDelete';

import { workspacePaths } from '../common/paths';
import * as settings from '../common/settings';

import { DiffOutput } from '../output/DiffOutput';
import { DiffStatusBar } from '../output/DiffStatusBar';

import * as events from './events';

import { DiffMessage } from './DiffMessage';

//	Variables __________________________________________________________________

const { floor, random } = Math;

const PANEL_STATE = 'panelState';

const platform = isMacOs ? 'mac' : isWindows ? 'win' : 'linux';
let language = vscode.env.language;

//	Initialize _________________________________________________________________

if (!/^[a-z]{2,3}(-[A-Z]{2,3})?$/.test(language)) language = 'en';

//	Exports ____________________________________________________________________

export class DiffPanel {
	
	public readonly msg: DiffMessage;
	public readonly compare: DiffCompare;
	public readonly copy: DiffCopy;
	public readonly delete: DiffDelete;
	
	public readonly status: DiffStatusBar;
	public readonly output: DiffOutput;
	
	public readonly panel: vscode.WebviewPanel;
	public readonly context: vscode.ExtensionContext;
	
	public readonly contextStates: ContextStates = {};
	
	public disposables: vscode.Disposable[] = [];
	
	private readonly _onDidInit: vscode.EventEmitter<undefined> = new vscode.EventEmitter<undefined>();
	public readonly onDidInit: vscode.Event<undefined> = this._onDidInit.event;
	
	public static currentPanel: DiffPanel | undefined;
	public static currentPanels: DiffPanel[] = [];
	
	public static readonly viewType = 'l13DiffPanel';
	
	private constructor (panel: vscode.WebviewPanel, context: vscode.ExtensionContext, uris: null | Uri[] | vscode.Uri[] = null, compare?: boolean) {
		
		this.panel = panel;
		this.context = context;
		
		this.msg = new DiffMessage(panel, this.disposables);
		
		this.status = new DiffStatusBar(context);
		this.output = new DiffOutput();
		
		this.copy = new DiffCopy();
		this.delete = new DiffDelete();
		this.compare = new DiffCompare();
		
		this.disposables.push(this.msg);
		this.disposables.push(this.output);
		this.disposables.push(this.status);
		
		events.compare.init(this);
		events.context.init(this);
		events.copy.init(this);
		events.deletes.init(this);
		events.dialogs.init(this);
		events.favorites.init(this);
		events.menu.init(this);
		events.open.init(this);
		events.panelstates.init(this);
		events.updates.init(this);
		
		this.msg.on('init:view', () => {
			
			this.msg.send<DiffInitViewMessage>('init:view', {
				panel: this.getPanelState(),
				uris: mapUris(uris),
				workspaces: workspacePaths(vscode.workspace.workspaceFolders),
				compare,
			});
			
			this.msg.removeMessageListener('init:view');
			
			this._onDidInit.fire(undefined);
			
		});
		
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
		
		this.panel.onDidChangeViewState(({ webviewPanel }) => {
			
			this.setContextFocus(webviewPanel.active);
			
			if (webviewPanel.active) {
				DiffPanel.currentPanel = this;
				this.status.activate();
				this.output.activate();
				for (const name in this.contextStates) this.setContext(name, this.contextStates[name]);
			} else {
				for (const name in this.contextStates) this.setContext(name, false);
			}
			
		}, null, this.disposables);
		
		this.panel.webview.html = getHTMLforDiffPanel(this.context, this.panel.webview);
		
		this.setTitle();
		this.setContextFocus(true);
		
	}
	
	public dispose () {
		
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
		} else this.setContextFocus(false, false);
		
	}
	
	public setTitle (pathA?: string, pathB?: string) {
		
		const labelFormat = settings.get('labelFormat');
		let title = 'Diff Folders';
		
		if (pathA && pathB) {
			if (labelFormat !== 'filename') {
				const [label, desc] = formatNameAndDesc(pathA, pathB);
				title = desc && labelFormat === 'complete' ? `${label} (${desc})` : label;
			} else title = formatName(pathA, pathB);
		}
		
		this.panel.title = title;
		
	}
	
	public getPanelState (): DiffPanelStateMessage {
		
		return this.context.globalState.get(PANEL_STATE);
		
	}
	
	public savePanelState (data: DiffPanelStateMessage) {
		
		this.context.globalState.update(PANEL_STATE, data);
		
	}
	
	public setContext (name: string, value: boolean) {
		
		this.contextStates[name] = value;
		
		vscode.commands.executeCommand('setContext', name, value);
		
	}
	
	public setContextFocus (value: boolean, send = true) {
		
		vscode.commands.executeCommand('setContext', 'l13DiffFocus', value);
		
		if (send) this.msg.send<boolean>('focus', value);
		
	}
	
	public send <T> (name: string, data?: T) {
		
		this.msg.send<T>(name, data);
		
	}
	
	public sendAll <T> (name: string, data?: T) {
		
		DiffPanel.sendAll<T>(name, data);
		
	}
	
	public sendOthers <T> (name: string, data?: T) {
		
		DiffPanel.currentPanels.forEach((diffPanel) => {
				
			if (diffPanel !== this) diffPanel.send<T>(name, data);
			
		});
		
	}
	
	public static async create (context: vscode.ExtensionContext, uris: null | Uri[] | vscode.Uri[] = null, compare?: boolean, openToSide?: boolean) {
		
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
		
		return new Promise((resolve) => {
			
			diffPanel.onDidInit(() => resolve(undefined), null, diffPanel.disposables);
			
			diffPanel.msg.on('error:init', async ({ error }) => {
				
				const tryAgain = await vscode.window.showErrorMessage(error, 'Try Again');
				
				diffPanel.dispose();
				
				resolve(tryAgain ? DiffPanel.create(context, uris, compare) : undefined);
				
			});
			
		});
		
	}
	
	public static createOrShow (context: vscode.ExtensionContext, uris: null | Uri[] | vscode.Uri[] = null, compare?: boolean) {
		
		if (DiffPanel.currentPanel) {
			DiffPanel.currentPanel.panel.reveal();
			if (uris) {
				DiffPanel.currentPanel.send<DiffUpdatePathsMessage>('update:paths', {
					uris: mapUris(uris),
					compare,
				});
			}
			return;
		}
		
		DiffPanel.create(context, uris, compare);
		
	}
	
	public static revive (panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
		
		const diffPanel = new DiffPanel(panel, context);
		
		DiffPanel.currentPanel = diffPanel;
		DiffPanel.currentPanels.push(diffPanel);
		
	}
	
	public static send <T> (name: string, data?: T) {
		
		DiffPanel.currentPanel?.send<T>(name, data);
		
	}
	
	public static sendAll <T> (name: string, data?: T) {
		
		DiffPanel.currentPanels.forEach((diffPanel) => diffPanel.send<T>(name, data));
		
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

function getHTMLforDiffPanel (context: vscode.ExtensionContext, webview: vscode.Webview) {
		
	const mediaPath = path.join(context.extensionPath, 'media');
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
			window.l13Settings = {
				enablePreview: ${!!settings.get('enablePreview', false)},
			};
		</script>
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

function mapUris (uris: null | Uri[] | vscode.Uri[]): Uri[] {
	
	return (uris || []).map((uri) => ({ fsPath: uri.fsPath }));
	
}