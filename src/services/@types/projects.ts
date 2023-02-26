//	Imports ____________________________________________________________________

import type { TreeItem } from 'vscode';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type WorkspaceTypes = 'git' | 'subfolder' | 'vscode' | 'workspace';

export type ProjectTypes = 'folder' | 'folders' | WorkspaceTypes;

export type Project = {
	path: string,
	label: string,
	type: ProjectTypes,
	color?: number,
	deleted?: boolean,
};

export interface ProjectTreeItem extends TreeItem {
	
	command: {
		arguments: any[],
		command: string,
		title: string,
	};
	
	readonly project: Project;
	
}

//	Functions __________________________________________________________________

