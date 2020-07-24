//	Imports ____________________________________________________________________

import * as fs from 'fs';
import * as path from 'path';

import { WalkTreeJob, WalkTreeOptions } from '../../types';
import { StatsMap } from '../@types/fse';

//	Variables __________________________________________________________________

const findRegExpChars:RegExp = /\*\*\/|\/\*\*|[\/\\\[\]\.\*\^\$\|\+\-\{\}\(\)\?\!\=\:\,]/g;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export async function copyFile (sourcePath:string, destPath:string) {
	
	destPath = path.resolve(sourcePath, destPath);
	
	const dirname = path.dirname(destPath);
	
	if (!fs.existsSync(dirname)) await createDirectory(dirname);
	
	return new Promise((resolve, reject) => {
		
		const source = fs.createReadStream(sourcePath);
		const dest = fs.createWriteStream(destPath);
		
		source.pipe(dest);
		
		source.on('error', (error:Error) => reject(error));
		source.on('end', () => resolve());
		
	});
	
}

export async function createDirectory (pathname:string) {
	
	return new Promise((resolve, reject) => {
		
		fs.mkdir(pathname, { recursive: true }, (error) => {
			
			if (error) reject(error);
			else resolve();
			
		});
		
	});
	
}

export async function copySymbolicLink (sourcePath:string, destPath:string) {
	
	destPath = path.resolve(sourcePath, destPath);
	
	const dirname = path.dirname(destPath);
	
	if (!fs.existsSync(dirname)) await createDirectory(dirname);
	
	return new Promise((resolve, reject) => {
		
		fs.symlink(fs.readlinkSync(sourcePath), destPath, (error:Error) => {
						
			if (error) reject(error);
			else resolve();
			
		});
		
	});
	
}

export function walkTree (cwd:string, options:WalkTreeOptions) :Promise<StatsMap> {
	
	return new Promise((resolve, reject) => {
		
		const job:WalkTreeJob = {
			error: null,
			ignore: Array.isArray(options.excludes) ? createFindGlob(options.excludes) : null,
			result: {},
			tasks: 1,
			done: (error?:Error) => {
				
				if (error) {
					job.error = error;
					reject(error);
				} else resolve(job.result);
				
			},
		};
		
		_walktree(job, cwd);
		
	});
	
}

export function walkUp (dirname:string, filename:string) :string {
	
	return dirname.split(path.sep).some(() => {
		
		if (fs.existsSync(path.join(dirname, filename))) return true;
		
		dirname = path.dirname(dirname);
		return false;
		
	}) ? path.join(dirname, filename) : null;
	
}

export function lstatSync (pathname:string) {
	
	try {
		return fs.lstatSync(pathname);
	} catch (error) {
		return null;
	}
	
}

export function lstat (pathname:string) :Promise<fs.Stats> {
	
	return new Promise((resolve) => {
		
		fs.lstat(pathname, (error, stat) => resolve(error ? null : stat));
		
	});
	
}

export function createFindGlob (ignore:string[]) {
	
	return new RegExp(`^(${ignore.map((pattern) => escapeGlobForRegExp(pattern)).join('|')})$`);
	
}

//	Functions __________________________________________________________________

function escapeGlobForRegExp (text:any) :string {
	
	return ('' + text).replace(findRegExpChars, (match) => {
		
		if (match === '/') return '[/\\\\]';
		if (match === '*') return '[^/\\\\]*';
		if (match === '?') return '?';
		if (match === '**/') return '(?:[^/\\\\]+[/\\\\])*';
		if (match === '/**') return '(?:[/\\\\][^/\\\\]+)*';
		
		return '\\' + match;
		
	});
	
}

function addFile (result:any, type:string, stat:fs.Stats, fsPath:string, root:string, relative:string, dirname:string, ignore:boolean) {
	
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
		extname: (type === 'file' ? path.extname(relative) : ''),
		type,
		ignore,
	};
	
}

function _walktree (job:WalkTreeJob, cwd:string, relative:string = '') {
	
	if (job.error) return; // If error no further actions
	
	const dirname = path.join(cwd, relative);
	
	fs.readdir(dirname, (dirError, names) => {
		
		if (job.error) return; // If error no further actions
		if (dirError) return job.done(dirError);
		
		job.tasks--; // directory read
		job.tasks += names.length;
		
		if (!job.tasks) return job.done();
		
		names.forEach((name) => {
			
			const pathname = path.join(dirname, name);
			
			fs.lstat(pathname, (statError, stat) => {
				
				if (job.error) return; // If error no further actions
				if (statError) return job.done(statError);
				
				const currentRelative = path.join(relative, name);
				let currentDirname = path.dirname(currentRelative);
				const ignore = job.ignore?.test(currentRelative);
				
				currentDirname = currentDirname === '.' ? '' : currentDirname + path.sep;
				
				if (stat.isDirectory()) {
					addFile(job.result, 'folder', stat, pathname, cwd, currentRelative, currentDirname, ignore);
					if (!ignore) return _walktree(job, cwd, currentRelative);
				}
				
				job.tasks--;
				
				if (stat.isFile()) addFile(job.result, 'file', stat, pathname, cwd, currentRelative, currentDirname, ignore);
				else if (stat.isSymbolicLink()) addFile(job.result, 'symlink', stat, pathname, cwd, currentRelative, currentDirname, ignore);
				
				if (!job.tasks) job.done();
				
			});
			
		});
		
	});
	
}