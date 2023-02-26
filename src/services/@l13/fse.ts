//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';

import type { DiffFileTypes, StatsMap, WalkTreeJob, WalkTreeOptions } from '../../types';

import { isWindows } from './platforms';

//	Variables __________________________________________________________________

// eslint-disable-next-line no-useless-escape
const findRegExpChars = /\\[*?]|\*\*\/|\/\*\*|[\/\\\[\]\.\*\^\$\|\+\-\{\}\(\)\?\!\=\:\,]/g;

// eslint-disable-next-line no-control-regex, no-useless-escape
const findIllegalAndControlChars = /[\x00-\x1f"\*<>\?\|\x80-\x9f]/g;
const findColon = /:/g;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function createDirectory (pathname: string) {
	
	fs.mkdirSync(pathname, { recursive: true });
	
}

export function copyFile (sourcePath: string, destPath: string): Promise<undefined | Error> {
	
	destPath = path.resolve(sourcePath, destPath);
	
	const dirname = path.dirname(destPath);
	
	if (!fs.existsSync(dirname)) createDirectory(dirname);
	
	return new Promise((resolve, reject) => {
		
		const source = fs.createReadStream(sourcePath);
		const dest = fs.createWriteStream(destPath);
		
		source.pipe(dest);
		
		source.on('error', (error: Error) => reject(error));
		source.on('end', () => resolve(undefined));
		
	});
	
}

export function copySymbolicLink (sourcePath: string, destPath: string): Promise<undefined | Error> {
	
	destPath = path.resolve(sourcePath, destPath);
	
	const dirname = path.dirname(destPath);
	
	if (!fs.existsSync(dirname)) createDirectory(dirname);
	
	return new Promise((resolve, reject) => {
		
		fs.symlink(fs.readlinkSync(sourcePath), destPath, (error: Error) => {
						
			if (error) reject(error);
			else resolve(undefined);
			
		});
		
	});
	
}

export function walkTree (cwd: string, options: WalkTreeOptions): Promise<StatsMap> {
	
	return new Promise((resolve, reject) => {
		
		const job: WalkTreeJob = {
			error: null,
			ignore: Array.isArray(options.excludes) ? createFindGlob(options.excludes, options.useCaseSensitive) : null,
			result: {},
			tasks: 1,
			maxSize: options.maxFileSize || 0,
			abort: options.abortOnError ?? true,
			done: (error?: Error) => {
				
				if (error) {
					job.error = error;
					reject(error);
				} else resolve(job.result);
				
			},
		};
		
		_walktree(job, cwd);
		
	});
	
}

export function walkUp (dirname: string, filename: string): string {
	
	return dirname.split(path.sep).some(() => {
		
		if (fs.existsSync(path.join(dirname, filename))) return true;
		
		dirname = path.dirname(dirname);
		return false;
		
	}) ? path.join(dirname, filename) : null;
	
}

export function lstatSync (pathname: string) {
	
	try {
		return fs.lstatSync(pathname);
	} catch (error) {
		return null;
	}
	
}

export function lstat (pathname: string): Promise<fs.Stats> {
	
	return new Promise((resolve) => {
		
		fs.lstat(pathname, (error, stat) => resolve(stat || null));
		
	});
	
}

export function createFindGlob (ignore: string[], useCaseSensitive: boolean) {
	
	return new RegExp(`^(${ignore.map((pattern) => escapeGlobForRegExp(pattern)).join('|')})$`, useCaseSensitive ? '' : 'i');
	
}

export function sanitize (pathname: string) {
	
	let name = `${pathname}`.replace(findIllegalAndControlChars, '');
	
	if (!isWindows) name = name.replace(findColon, '');
	
	return name;
	
}

//	Functions __________________________________________________________________

function escapeGlobForRegExp (text: any): string {
	
	return `${text}`.replace(findRegExpChars, (match) => {
		
		if (match === '\\*' || match === '\\?') return match;
		
		if (match === '/') return '[/\\\\]';
		if (match === '*') return '[^/\\\\]*';
		if (match === '?') return '.';
		if (match === '**/') return '(?:[^/\\\\]+[/\\\\])*';
		if (match === '/**') return '(?:[/\\\\][^/\\\\]+)*';
		
		return `\\${match}`;
		
	});
	
}

function addFile (result: StatsMap, type: DiffFileTypes, stat: fs.Stats, fsPath: string, root: string, relative: string, dirname: string, ignore: boolean) {
	
	const sep = type === 'folder' ? path.sep : '';
	
	result[fsPath] = {
		root,
		relative,
		fsPath,
		stat,
		
		path: fsPath + sep,
		name: relative + sep,
		basename: path.basename(relative) + sep,
		dirname,
		extname: type === 'file' ? path.extname(relative) : '',
		type,
		ignore,
	};
	
}

function _walktree (job: WalkTreeJob, cwd: string, relative = '') {
	
	if (job.abort && job.error) return; // If error no further actions
	
	const dirname = path.join(cwd, relative);
	
	fs.readdir(dirname, (dirError, names) => {
		
		if (job.abort) {
			if (job.error) return;
			if (dirError) return job.done(dirError);
		}
		
		job.tasks--; // directory read
		
		if (dirError) return !job.tasks ? job.done() : undefined;
		
		job.tasks += names.length;
		
		if (!job.tasks) return job.done();
		
		names.forEach((name) => {
			
			const pathname = path.join(dirname, name);
			
			fs.lstat(pathname, (statError, stat) => {
				
				if (job.abort) {
					if (job.error) return;
					if (statError) return job.done(statError);
				}
				
				const currentRelative = path.join(relative, name);
				let currentDirname = path.dirname(currentRelative);
				let ignore = job.ignore?.test(currentRelative);
				
				currentDirname = currentDirname === '.' ? '' : currentDirname + path.sep;
				
				if (statError) {
					addFile(job.result, 'error', null, pathname, cwd, currentRelative, currentDirname, true);
				} else if (stat.isDirectory()) {
					addFile(job.result, 'folder', stat, pathname, cwd, currentRelative, currentDirname, ignore);
					if (!ignore) return _walktree(job, cwd, currentRelative);
				} else if (stat.isFile()) {
					const maxSize = job.maxSize;
					if (maxSize && stat.size > maxSize) ignore = true;
					addFile(job.result, 'file', stat, pathname, cwd, currentRelative, currentDirname, ignore);
				} else if (stat.isSymbolicLink()) {
					addFile(job.result, 'symlink', stat, pathname, cwd, currentRelative, currentDirname, ignore);
				} else {
					addFile(job.result, 'unknown', stat, pathname, cwd, currentRelative, currentDirname, true);
				}
				
				job.tasks--;
				
				if (!job.tasks) job.done();
				
			});
			
		});
		
	});
	
}