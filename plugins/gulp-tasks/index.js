//	Imports ____________________________________________________________________

const path = require('node:path');

const glob = require('glob');

//	Variables __________________________________________________________________

const WATCH_MODE = Symbol('watchMode');
const WATCH_TASKS = Symbol('watchTasks');

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

exports.GulpTasks = class GulpTasks {
	
	constructor ({ gulp, paths } = {}) {
		
		this.gulp = gulp || require('gulp');
		
		this[WATCH_MODE] = false;
		this[WATCH_TASKS] = [];
		
		if (paths) this.load(paths);
		
	}
	
	get watchMode () {
		
		return this[WATCH_MODE];
		
	}
	
	load (paths) {
	
		if (!paths || typeof paths !== 'string' && !Array.isArray(paths)) {
			throw new TypeError('Path must be a string or an array with strings.');
		}
		
		loadTasks.call(this, typeof paths === 'string' ? [paths] : paths);
		
	}
	
	group (groupName, tasks) {
	
		if (!groupName || typeof groupName !== 'string') {
			throw new Error('Missing group name.');
		}
		
		this.gulp.task(groupName, createTasks.call(this, groupName, tasks));
		
	}
	
	build (tasks) {
		
		const gulp = this.gulp;
		
		gulp.task('build', gulp.series(tasks));
		gulp.task('watch', gulp.parallel(this[WATCH_TASKS]));
		gulp.task('build & watch', gulp.series('build', 'watch'));
		
	}
	
}

//	Functions __________________________________________________________________

function buildTaskFn (taskName, task) {
	
	if (typeof task === 'function') return task;
	
	const gulp = this.gulp;
	
	if (task.task) {
		
		if (typeof task.task !== 'function') {
			throw new Error(`Task for '${taskName}' is not a function.`);
		}
		
		if (task.src) {
			return () => {
				
				const stream = task.task(gulp.src(task.src));
				
				return task.dest ? stream.pipe(gulp.dest(task.dest)) : stream;
				
			};
		}
		
		return task.task;
	}
	
	if (task.src && task.dest) {
		return () => {
	
			return gulp.src(task.src).pipe(gulp.dest(task.dest));
			
		};
	};
	
	throw new Error(`'${taskName}' is not a valid task.`);
	
}

function createTask (groupName, name, task) {
	
	if (!name || typeof name !== 'string') {
		throw new Error(`Missing task name in group '${groupName}'.`);
	}
	
	const taskName = `${groupName}:${name}`;
	const gulp = this.gulp;
	
	if (task.watch) {
		const watchName = `watch ${taskName}`;
		const watchPath = task.watch === true ? task.src : task.watch;
		gulp.task(watchName, () => {
			
			this[WATCH_MODE] = true;
			
			return gulp.watch(watchPath, gulp.series(taskName));
			
		});
		this[WATCH_TASKS].push(watchName);
	}
	
	gulp.task(taskName, buildTaskFn.call(this, taskName, task));
	
	return taskName;
	
}

function createTasks (groupName, tasks) {
	
	const names = [];
	
	if (Array.isArray(tasks)) {
		for (const task of tasks) {
			names.push(createTask.call(this, groupName, task.name, task));
		}
		return this.gulp.series(names);
	}
	
	for (const [name, task] of Object.entries(tasks)) {
		names.push(createTask.call(this, groupName, name, task));
	}
	
	return this.gulp.parallel(names);
	
}

function loadTasks (paths) {
	
	paths.forEach((pattern) => {
		
		glob.sync(pattern).forEach((filename) => {
			
			const result = require(path.join(process.cwd(), filename));
			const name = path.basename(filename, path.extname(filename));
			
			this.group(name, result);
			
		});
		
	});
	
}