//	Imports ____________________________________________________________________

import type {
	DeletedFilesMessage,
	Dictionary,
	Diff,
	DiffCopyMessage,
	DiffFile,
	DiffMultiCopyMessage,
	DiffOpenMessage,
	DiffPreviewMessage,
	DiffResultMessage,
	UpdatedFilesMessage,
} from '../../../types';

import { ViewModel } from '../../@l13/component/view-model.abstract';

import { msg } from '../../common';

import type { L13DiffListPipe } from './l13-diff-list.interface';

//	Variables __________________________________________________________________

const parse = JSON.parse;
const stringify = JSON.stringify;

const FILTERS = Symbol.for('filters');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class L13DiffListViewModel extends ViewModel {
	
	private [FILTERS]: Array<L13DiffListPipe<Diff>> = [];
	
	private map: Dictionary<Diff> = {};
	
	public items: Diff[] = [];
	public filteredItems: Diff[] = [];
	
	public diffResult: DiffResultMessage = {
		diffs: [],
		pathA: '',
		pathB: '',
		settings: null,
	};
	
	public disabled = false;
	
	public disable () {
		
		this.disabled = true;
		this.requestUpdate();
		
	}
	
	public enable () {
		
		this.disabled = false;
		this.requestUpdate();
		
	}
	
	public constructor () {
		
		super();
		
		msg.on('create:diffs', (data: DiffResultMessage) => this.createList(data));
		
		msg.on('copy:left', (data: DiffCopyMessage) => this.updateCopiedList(data));
		msg.on('copy:right', (data: DiffCopyMessage) => this.updateCopiedList(data));
		
		msg.on('delete:files', (data: DiffResultMessage) => this.updateDeletedList(data));
		msg.on('remove:files', (data: DeletedFilesMessage) => this.removeFiles(data.files));
		
		msg.on('update:files', (data: UpdatedFilesMessage) => this.detectChangedFiles(data.files));
		msg.on('update:diffs', (data: DiffResultMessage) => this.updateDiffList(data));
		msg.on('update:multi', (data: DiffCopyMessage | DiffResultMessage) => this.updateMultiList(data));
		
		msg.on('multi-copy:left', (data: DiffMultiCopyMessage) => this.multiCopyFiles('left', data));
		msg.on('multi-copy:right', (data: DiffMultiCopyMessage) => this.multiCopyFiles('right', data));
		
	}
	
	public getDiffById (id: string): null | Diff {
		
		return this.map[id] || null;
		
	}
	
	public pipe (pipe: L13DiffListPipe<Diff>) {
		
		this[FILTERS].push(pipe);
		
		pipe.vm.on('update', () => this.filter());
		
		return this;
		
	}
	
	public createList (diffResult: DiffResultMessage) {
		
		this.enable();
		
		this.diffResult = diffResult;
		this.map = {};
		
		this.diffResult.diffs.forEach((diff: Diff) => this.map[diff.id] = diff);
		this.items = this.diffResult.diffs;
		
		this.dispatchEvent('compared');
		
	}
	
	private updateItems (diffs: Diff[]) {
		
		const items = this.items = this.items.slice();
		const map = this.map;
		
		diffs.forEach((diff: Diff) => {
			
			const originalDiff = map[diff.id];
			
			items.splice(items.indexOf(originalDiff), 1, diff);
			map[diff.id] = diff;
			
		});
		
	}
	
	public updateCopiedList (diffResult: DiffCopyMessage) {
		
		const diffs = diffResult.diffs;
		
		this.updateItems(diffs);
		
		updateCopiedParentFolders(this.items, diffs);
		
		this.filter(true);
		this.dispatchEvent('copied');
		
	}
	
	private updateStatus (items: Diff[], diffs: Diff[]) {
		
		const map = this.map;
		
		diffs.forEach((diff: Diff) => {
			
			const originalDiff = map[diff.id];
			
			if (diff.fileA || diff.fileB) {
				if (originalDiff !== diff) {
					items.splice(items.indexOf(originalDiff), 1, diff);
					map[diff.id] = diff;
				}
				if (diff.status !== 'ignored') {
					if (!diff.fileA) diff.status = 'untracked';
					if (!diff.fileB) diff.status = 'deleted';
				}
			} else {
				items.splice(items.indexOf(originalDiff), 1);
				delete map[diff.id];
			}
			
		});
		
	}
	
	private removeFiles (files: string[]) {
		
		const items = this.items = this.items.slice();
		const diffs = items.filter((diff: Diff) => {
			
			if (files.includes(diff.fileA?.fsPath)) {
				diff.fileA = null;
				return true;
			}
			
			if (files.includes(diff.fileB?.fsPath)) {
				diff.fileB = null;
				return true;
			}
			
			return false;
			
		});
		
		this.updateStatus(items, diffs);
		
		updateDeletedSubfiles(items, diffs);
		
		this.filter(true);
		this.dispatchEvent('removed');
		
	}
	
	public updateDeletedList (diffResult: DiffResultMessage) {
		
		const items = this.items = this.items.slice();
		const diffs = diffResult.diffs;
		
		this.updateStatus(items, diffs);
		
		updateDeletedSubfiles(items, diffs);
		
		this.filter(true);
		this.dispatchEvent('deleted');
		
	}
	
	private detectChangedFiles (files: string[]) {
		
		const diffs = this.items.filter(({ fileA, fileB }) => {
			
			if (!fileA || !fileB) return false;
			
			return files.includes(fileA.path) || files.includes(fileB.path);
			
		});
		
		if (diffs.length) {
			msg.send<DiffResultMessage>('update:diffs', {
				diffs,
				pathA: this.diffResult.pathA,
				pathB: this.diffResult.pathB,
				settings: this.diffResult.settings,
			});
		}
		
	}
	
	public updateDiffList (diffResult: DiffResultMessage) {
		
		this.updateItems(diffResult.diffs);
		this.filter(true);
		this.dispatchEvent('updated');
		
	}
	
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public updateMultiList (data: DiffCopyMessage | DiffResultMessage) {
		
		//
		
	}
	
	public swapList () {
		
		const items = this.items = this.items.slice();
		const diffResult = this.diffResult;
		const pathA = diffResult.pathA;
		
		diffResult.pathA = diffResult.pathB;
		diffResult.pathB = pathA;
		
		items.forEach((diff: Diff) => {
			
			const fileA = diff.fileA;
			
			diff.fileA = diff.fileB;
			diff.fileB = fileA;
			
			if (diff.status === 'deleted') diff.status = 'untracked';
			else if (diff.status === 'untracked') diff.status = 'deleted';
			
		});
		
		this.filter(true);
		this.dispatchEvent('swapped');
		
	}
	
	public filter (keepPosition?: boolean) {
		
		let filteredItems = this.items;
		
		this[FILTERS].forEach((pipe) => filteredItems = pipe.transform(filteredItems));
		
		this.filteredItems = filteredItems;
		
		this.requestUpdate({ keepPosition });
		
		this.dispatchEvent('filtered');
		
	}
	
	public getCopyListByIds (ids: string[], from: 'left' | 'right'): DiffCopyMessage {
		
		const items = ids.map((id) => this.map[id]).filter((diff: Diff) => from === 'left' && diff.fileA || from === 'right' && diff.fileB);
		
		return {
			diffs: items,
			multi: false,
			pathA: this.diffResult.pathA,
			pathB: this.diffResult.pathB,
		};
		
	}
	
	public getGoToListByIds (ids: string[], side: 'left' | 'right') {
		
		const items = ids.map((id) => this.map[id]);
		const files: DiffFile[] = [];
		
		items.forEach((diff: Diff) => {
			
			const file = side === 'left' && diff.fileA || side === 'right' && diff.fileB;
			
			if (file) files.push(file);
			
		});
		
		return files;
		
	}
	
	private getDiffsByIds (ids: string[]): DiffResultMessage {
		
		const diffs = ids.map((id) => this.map[id]);
		
		return {
			diffs,
			pathA: this.diffResult.pathA,
			pathB: this.diffResult.pathB,
			settings: this.diffResult.settings,
		};
		
	}
	
	public open (ids: string[], openToSide: boolean) {
		
		const diffResult = this.getDiffsByIds(ids);
		
		if (diffResult.diffs.length) msg.send<DiffOpenMessage>('open:diff', { ...diffResult, openToSide });
		
	}
	
	public openPreview (id: string) {
		
		const diffResult = this.getDiffsByIds([id]);
		const diff = diffResult.diffs[0];
		
		if (diff) {
			msg.send<DiffPreviewMessage>('preview:diff', {
				diff,
				pathA: diffResult.pathA,
				pathB: diffResult.pathB,
			});
		}
		
	}
	
	public copy (ids: string[], from: 'left' | 'right') {
		
		const diffResult = this.getCopyListByIds(ids, from);
		
		if (diffResult.diffs.length) msg.send<DiffCopyMessage>(`copy:${from}`, diffResult);
		else this.dispatchEvent('cancel');
		
	}
	
	public multiCopy (ids: string[], from: 'left' | 'right') {
		
		if (ids.length && this.diffResult.pathA && this.diffResult.pathB) {
			msg.send<DiffMultiCopyMessage>(`multi-copy:${from}`, {
				ids,
				pathA: this.diffResult.pathA,
				pathB: this.diffResult.pathB,
			});
		} else this.dispatchEvent('cancel');
		
	}
	
	private multiCopyFiles (from: 'left' | 'right', data: DiffMultiCopyMessage) {
		
		if (from === 'left' && this.diffResult.pathA === data.pathA
		|| from === 'right' && this.diffResult.pathB === data.pathB) {
			const diffCopy: DiffCopyMessage = this.getCopyListByIds(data.ids, from);
			if (diffCopy.diffs.length) {
				diffCopy.multi = true;
				msg.send<DiffCopyMessage>(`copy:${from}`, diffCopy);
				this.dispatchEvent('multicopy');
			}
		}
		
	}
	
	public goto (ids: string[], side: 'left' | 'right', openToSide: boolean) {
		
		const files = this.getGoToListByIds(ids, side);
		
		if (files.length) msg.send('goto:file', { files, openToSide });
		
	}
	
	public delete (ids: string[], side: 'left' | 'right' | 'both' = 'both') {
		
		const diffResult = this.getDiffsByIds(ids);
		
		if (diffResult.diffs.length) msg.send<DiffResultMessage>(`delete:${side}`, diffResult);
		else this.dispatchEvent('cancel');
		
	}
	
}

//	Functions __________________________________________________________________

function copyDiffFile (diff: Diff, copiedDiff: Diff, from: 'A', to: 'B'): boolean;
function copyDiffFile (diff: Diff, copiedDiff: Diff, from: 'B', to: 'A'): boolean;
function copyDiffFile (diff: Diff, copiedDiff: Diff, from: 'A' | 'B', to: 'A' | 'B'): boolean {
	
	const fileFrom = `file${from}`;
	const file: DiffFile = (<any>diff)[fileFrom];
	
	if (file && (<DiffFile>(<any>copiedDiff)[fileFrom]).path.startsWith(file.path)) {
		const clone: DiffFile = parse(stringify(file));
		const fileTo = `file${to}`;
		clone.root = (<any>copiedDiff)[fileTo].root;
		clone.path = clone.root + clone.path.slice(file.root.length);
		(<any>diff)[fileTo] = clone;
		diff.status = 'unchanged';
		return true;
	}
	
	return false;
	
}

function updateCopiedParentFolders (diffs: Diff[], copiedDiffs: Diff[]) {
	
	diffs.forEach((diff) => {
		
		if (diff.type === 'folder' && (!diff.fileA || !diff.fileB)) {
			copiedDiffs.some((copiedDiff: Diff) => {
				
				if (diff.id !== copiedDiff.id && (copiedDiff.status === 'unchanged' || copiedDiff.status === 'ignored')) {
					if (copyDiffFile(diff, copiedDiff, 'A', 'B')) return true;
					if (copyDiffFile(diff, copiedDiff, 'B', 'A')) return true;
				}
				
				return false;
				
			});
		}
		
	});
	
}

function updateDeletedSubfiles (diffs: Diff[], deletedDiffs: Diff[]) {
	
	const deletedFolders = deletedDiffs.filter((diff) => diff.type === 'folder');
	
	for (const diff of diffs.slice()) {
		loop:for (const deletedDiff of deletedFolders) {
			if (diff.id.startsWith(deletedDiff.id)) {
				if (!deletedDiff.fileA) diff.fileA = null;
				if (!deletedDiff.fileB) diff.fileB = null;
				if (!diff.fileA && !diff.fileB) diffs.splice(diffs.indexOf(diff), 1);
				else if (diff.status !== 'ignored') {
					if (!diff.fileA) diff.status = 'untracked';
					else if (!diff.fileB) diff.status = 'deleted';
				}
				break loop;
			}
		}
	}
	
}