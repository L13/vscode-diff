//	Imports ____________________________________________________________________

import { DiffResult } from '../../../services/DiffResult';
import { Diff, File } from '../../../types';
import { ViewModel } from '../../@l13/component/view-model.abstract';
import { L13DiffListPipe } from './l13-diff-list.interface';

import { msg } from '../common';

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
	
	public diffResult:DiffResult = {
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
		
		msg.on('create:diffs', (data) => this.createList(data.diffResult));
		msg.on('copy:left', (data) => this.updateCopiedList(data.diffResult));
		msg.on('copy:right', (data) => this.updateCopiedList(data.diffResult));
		msg.on('delete', (data) => this.updateDeletedList(data.diffResult));
		
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
		
		this.diffResult = diffResult;
		this.map = {};
		
		this.diffResult.diffs.forEach((diff:Diff) => this.map[diff.id] = diff);
		this.items = this.diffResult.diffs;
		
		this.dispatchEvent('compared');
		
	}
	
	public updateCopiedList (diffResult:DiffResult) {
		
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
	
	public updateDeletedList (diffResult:DiffResult) {
		
		const diffs = diffResult.diffs;
		
		diffs.forEach((diff:Diff) => { // Update original diff with new diff
			
			const originalDiff = this.map[diff.id];
			
			if (diff.fileA || diff.fileB) {
				this.items.splice(this.items.indexOf(originalDiff), 1, diff);
				this.map[diff.id] = diff;
				if (!diff.fileA) diff.status = 'untracked';
				if (!diff.fileB) diff.status = 'deleted';
			} else {
				this.items.splice(this.items.indexOf(originalDiff), 1);
				delete this.map[diff.id];
			}
			
		});
		
		updateDeletedSubfiles(this.items, diffs);
		
		this.items = this.items.slice(); // Refreshs the view
		
		this.dispatchEvent('deleted');
		
	}
	
	public swapList () {
		
		const diffResult = this.diffResult;
		const pathA = diffResult.pathA;
		
		diffResult.pathA = diffResult.pathB;
		diffResult.pathB = pathA;
		
		this.items.forEach((diff:Diff) => {
			
			const fileA = diff.fileA;
			
			diff.fileA = diff.fileB;
			diff.fileB = fileA;
			
			if (diff.status === 'deleted') diff.status = 'untracked';
			else if (diff.status === 'untracked') diff.status = 'deleted';
			
		});
		
		this.items = this.items.slice(); // Refreshs the view
		
		this.filter();
		
	}
	
	public filter () :void {
		
		let items = this.items;
		
		this[FILTERS].forEach((pipe) => items = pipe.transform(items));
		
		this.filteredItems = items;
		
		this.requestUpdate();
		
		this.dispatchEvent('filtered');
		
	}
	
	public getCopyListByIds (ids:string[], from:'left'|'right') :DiffResult {
		
		const items = ids.map((id) => this.map[id]).filter((diff:Diff) => from === 'left' && diff.fileA || from === 'right' && diff.fileB);
		
		return {
			pathA: this.diffResult.pathA,
			pathB: this.diffResult.pathB,
			diffs: items,
		};
		
	}
	
	public copy (from:'left'|'right', ids:string[]) :void {
		
		const diffResult = this.getCopyListByIds(ids, from);
		
		if (diffResult.diffs.length) msg.send(`copy:${from}`, { diffResult });
		
	}
	
	private getDiffsByIds (ids:string[]) {
		
		const items = ids.map((id) => this.map[id]);
		
		return {
			pathA: this.diffResult.pathA,
			pathB: this.diffResult.pathB,
			diffs: items,
		};
		
	}
	
	public delete (onlyOneSide:boolean = false, ids:string[]) :void {
		
		const diffResult = this.getDiffsByIds(ids);
		
		if (diffResult.diffs.length) msg.send(`delete:${onlyOneSide ? 'only' : 'all'}`, { diffResult });
		
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
		clone.path = clone.folder + clone.path.slice(file.folder.length);
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

function updateDeletedSubfiles (diffs:Diff[], deletedDiffs:Diff[]) {
	
	const deletedFolders = deletedDiffs.filter((diff) => diff.type === 'folder');
	
	for (const diff of diffs.slice()) {
		loop:for (const deletedDiff of deletedFolders) {
			if (diff.id.indexOf(deletedDiff.id) === 0) {
				if (!deletedDiff.fileA) diff.fileA = null;
				if (!deletedDiff.fileB) diff.fileB = null;
				if (!diff.fileA && !diff.fileB) diffs.splice(diffs.indexOf(diff), 1);
				else if (!diff.fileA) diff.status = 'untracked';
				else if (!diff.fileB) diff.status = 'deleted';
				break loop;
			}
		}
	}
	
}