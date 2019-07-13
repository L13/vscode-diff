//	Imports ____________________________________________________________________

import { DiffResult } from '../../../services/DiffResult';
import { Diff, File } from '../../../types';
import { ViewModel } from '../../@l13/component/view-model.abstract';
import { L13DiffListPipe } from './l13-diff-list.interface';

import { vscode } from '../common';

//	Variables __________________________________________________________________

const parse = JSON.parse;
const stringify = JSON.stringify;

const FILTERS = Symbol.for('filters');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffListViewModel extends ViewModel {
	
	private [FILTERS]:Array<L13DiffListPipe<Diff>> = [];
	
	private map:{ [name:string]:Diff } = {};
	
	public items:Diff[] = [];
	public filteredItems:Diff[] = [];
	
	public data:DiffResult = {
		pathA: '',
		pathB: '',
		diffs: [],
	};
	
	public disabled:boolean = false;
	
	public disable () :void {
		
		this.disabled = true;
		this.requestUpdate();
		
	}
	
	public enable () :void {
		
		this.disabled = false;
		this.requestUpdate();
		
	}
	
	public constructor () {
		
		super();
		
		window.addEventListener('message', (event) => {
			
			const message = event.data;
			
			switch (message.command) {
				case 'create:diffs':
					this.createList(message.diffResult);
					break;
				case 'copy:left':
				case 'copy:right':
					this.updateList(message.diffResult);
					break;
			}
			
		});
		
	}
	
	public getCopyListByIds (ids:string[]) :DiffResult {
		
		const items = ids.map((id) => this.map[id]);
		
		return {
			pathA: this.data.pathA,
			pathB: this.data.pathB,
			diffs: items,
		};
		
	}
	
	public getDiffById (id:string) :null|Diff {
		
		return this.map[id] || null;
		
	}
	
	public pipe (pipe:L13DiffListPipe<Diff>) {
		
		this[FILTERS].push(pipe);
		
		pipe.vm.on('update', () => this.filter());
		
		return this;
		
	}
	
	public createList (diffResult:DiffResult) {
		
		this.enable();
		
		this.data = diffResult;
		this.map = {};
		
		this.data.diffs.forEach((diff:Diff) => this.map[diff.id] = diff);
		this.items = this.data.diffs;
		
		this.filter();
		
		this.dispatchEvent('compared');
		
	}
	
	public updateList (diffResult:DiffResult) {
		
		this.enable();
		
		const diffs = diffResult.diffs;
		
		diffs.forEach((diff:Diff) => { // Update original diff with new diff
			
			const originalDiff = this.map[diff.id];
			
			this.items.splice(this.items.indexOf(originalDiff), 1, diff);
			this.map[diff.id] = diff;
			
		});
		
		updateCopiedParentFolders(this.items, diffs);
		
		this.items = this.items.slice(); // Refreshs the view
		
		this.dispatchEvent('copied');
		
	}
	
	public filter () :void {
		
		let items = this.items;
		
		this[FILTERS].forEach((pipe) => items = pipe.transform(items));
		
		this.filteredItems = items;
		
		this.requestUpdate();
		
		this.dispatchEvent('filtered');
		
	}
	
	public compare () :void {
		
		if (this.disabled) return;
		
		this.disable();
		
		this.items = [];
		this.requestUpdate();
		
		this.dispatchEvent('compare');
		
	}
	
	public copy (from:'left'|'right', ids:string[]) :void {
		
		vscode.postMessage({
			command: `copy:${from}`,
			diffResult: this.getCopyListByIds(ids),
		});
		
	}
	
}

//	Functions __________________________________________________________________

function copyDiffFile (diff:Diff, copiedDiff:Diff, from:'A'|'B', to:'A'|'B') :boolean {
	
	const fileFrom = `file${from}`;
	const file:File = (<any>diff)[fileFrom];
	
	if (file && (<any>copiedDiff)[fileFrom].path.startsWith(file.path)) {
		const clone:File = parse(stringify(file));
		const fileTo = `file${to}`;
		clone.folder = (<any>copiedDiff)[fileTo].folder;
		clone.path = clone.folder + clone.path.slice(0, file.folder.length);
		(<any>diff)[fileTo] = clone;
		diff.status = 'unchanged';
		return true;
	}
	
	return false;
	
}

function updateCopiedParentFolders (diffs:Diff[], copiedDiffs:Diff[]) {
	
	diffs.forEach((diff) => {
		
		if (diff.type === 'folder' && (!diff.fileA || !diff.fileB)) {
			
			copiedDiffs.some((copiedDiff:Diff) => {
				
				if (diff.id !== copiedDiff.id && copiedDiff.status === 'unchanged') {
					if (copyDiffFile(diff, copiedDiff, 'A', 'B')) return true;
					if (copyDiffFile(diff, copiedDiff, 'B', 'A')) return true;
				}
				
				return false;
				
			});
		}
		
	});
	
}