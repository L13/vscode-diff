//	Imports ____________________________________________________________________

import { Options } from './types';
import { ViewModelService } from './view-model-service.abstract';
import { ViewModel } from './view-model.abstract';

//	Variables __________________________________________________________________

const BINDINGS = Symbol.for('bindings');
const CONDITIONALS = Symbol.for('conditionals');
const QUERIES = Symbol.for('queries');
const SERVICE = Symbol.for('service');
const SHADOW_ROOT = Symbol.for('shadowRoot');
const STYLES = Symbol.for('styles');
const TEMPLATE = Symbol.for('template');
const VIEWMODEL = Symbol.for('viewmodel');

const findBinding = /^\[\((.+)\)\]$|^\[(.+)\]$|^\((.+)\)$/;
const findParathensis = /\s*\(\s*\)\s*$/;
const findScope = /\{\{\s*(.+?)\s*\}\}/;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function L13Component (options:Options) {
	
// tslint:disable-next-line: only-arrow-functions
	return function (target:new () => any) {
		
		if (!hasParentClass(target, L13Element)) {
			throw new TypeError(`Class for '${options.name}' is not a child class of 'L13Element'!`);
		}
		
		if (!hasParentClass(options.service, ViewModelService)) {
			throw new TypeError(`Service for '${options.name}' is not a child class of 'ViewModelService'!`);
		}
		
		target.prototype[SERVICE] = new options.service();
		
		if (options.styles) target.prototype[STYLES] = createStyles(options.styles);
		if (options.template) target.prototype[TEMPLATE] = createTemplate(options.template);
		
		customElements.define(options.name, target);
		
	};
	
}

export function L13Query (rule:string) {
	
	// tslint:disable-next-line: only-arrow-functions tslint:disable-next-line: ban-types
	return function (prototype:any, name:string) {
		
		if (!prototype[QUERIES]) prototype[QUERIES] = new Map();
		
		prototype[QUERIES].set(name, rule);
		
	};
	
}

export abstract class L13Element<T extends ViewModel> extends HTMLElement {
	
	private [BINDINGS]:Map<Element, Map<string, string>> = new Map();
			
	private [CONDITIONALS]:Map<Element, { cmd:string, comment:Comment }> = new Map();
	
	private [QUERIES]:Map<string, string>;
	
	private [SERVICE]:ViewModelService<T>;
	
	private [SHADOW_ROOT]:ShadowRoot;
	
	private [STYLES]:DocumentFragment;
	
	private [TEMPLATE]:HTMLTemplateElement;
	
	private [VIEWMODEL]:T;
	
	public get vmId () :null|string {
		
		return this.getAttribute('vmId');
		
	}
	
	public set vmId (value:null|string) {
		
		if (this[VIEWMODEL]) this[VIEWMODEL].dispose(this);
		
		if (value) this.setAttribute('vmId', value);
		else this.removeAttribute('vmId');
		
		this[VIEWMODEL] = this[SERVICE].model(value || this);
		this[VIEWMODEL].connect(this);
		this[VIEWMODEL].requestUpdate();
		
	}
	
	public get viewmodel () {
		
		return this[VIEWMODEL];
		
	}
	
	public set viewmodel (vm:T) {
		
		if (!(vm instanceof this[SERVICE].vmc)) {
			throw new TypeError('viewmodel is not for this component!');
		}
		
		if (this[VIEWMODEL]) this[VIEWMODEL].dispose(this);
		
		if (typeof vm.vmId === 'string') this.setAttribute('vmId', vm.vmId);
		
		this[VIEWMODEL] = vm;
		this[VIEWMODEL].connect(this);
		this[VIEWMODEL].requestUpdate();
		
	}
	
	public constructor () {
		
		super();
		
		const shadowRoot = this[SHADOW_ROOT] = this.attachShadow({ mode: 'closed' });
		
		if (this[STYLES]) shadowRoot.appendChild(this[STYLES].cloneNode(true));
		if (this[TEMPLATE]) {
			shadowRoot.appendChild(this[TEMPLATE].content.cloneNode(true));
			if (this[QUERIES]) {
				for (const [name, query] of this[QUERIES]) (<any>this)[name] = shadowRoot.querySelector(query);
			}
		}
		
		bindElements(this);
		
	}
	
	public connectedCallback () {
		
		if (!this[VIEWMODEL]) initViewModel(this);
		
	}
	
	public update () :void {
		
		const viewmodel = this[VIEWMODEL];
	
		for (const [element, { cmd, comment }] of this[CONDITIONALS]) {
			const value = !!get(viewmodel, cmd);
			if (value) {
				if (!element.parentNode) comment.parentNode.replaceChild(element, comment);
			} else if (!comment.parentNode) element.parentNode.replaceChild(comment, element);
		}
		
		for (const [element, bindings] of this[BINDINGS]) {
			for (const [name, cmd] of bindings) {
				const value = get(viewmodel, cmd);
				if (value !== undefined) (<any>element)[name] = value;
			}
		}
		
	}
	
}

//	Functions __________________________________________________________________

function hasParentClass (child:any, parent:any) :boolean {
	
	do {
		const currentParent = Object.getPrototypeOf(child);
		if (currentParent === parent) return true;
		child = currentParent;
	} while (child);
	
	return false;
	
}

function getAttributes (element:Element) {

	if (!element.attributes.length) return null;
	
	const attributes = element.attributes;
	const length = attributes.length;
	const map:{ [name:string]:string } = {};
	let i = 0;
	let name;
	
	while (i < length && (name = attributes[i++].nodeName)) {
		map[name] = <string>element.getAttribute(name);
	}
	
	return map;
	
}

function getAllTextNodes (root:Element|ShadowRoot) {
	
	const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
	const textNodes = [];
	let node;
		
	while (node = walk.nextNode()) textNodes.push(node);
		
	return textNodes.length ? textNodes : null;
		
}
	
function initViewModel<T extends ViewModel> (component:L13Element<T>) {
		
	component[VIEWMODEL] = component[SERVICE].model(component.vmId || component);
	component[VIEWMODEL].connect(component);
	component[VIEWMODEL].requestUpdate();
	
}

function registerBinding (component:any, element:Element|Text, name:string, cmd:string) {
	
	const bindings = component[BINDINGS];
	let elementBindings = bindings.get(element);
	
	if (!elementBindings) bindings.set(element, (elementBindings = new Map()));
	
	if (name === 'model') {
		if (element instanceof HTMLInputElement && element.getAttribute('type') === 'checkbox') name = 'checked';
		else name = 'value';
	}
	
	elementBindings.set(name, cmd);
	
}

function registerEvent (component:any, element:Element, name:string, cmd:string) {
	
	if (name === 'model') {
		if (element instanceof HTMLInputElement && element.getAttribute('type') === 'checkbox') {
			element.addEventListener('change', () => {
				
				const viewmodel = component[VIEWMODEL];
				
				set(viewmodel, cmd, (<HTMLInputElement>element).checked);
				
				viewmodel.requestUpdate();
				
			});
		} else if (element instanceof HTMLInputElement && element.getAttribute('type') === 'text') {
			element.addEventListener('input', () => {
				
				const viewmodel = component[VIEWMODEL];
				
				set(viewmodel, cmd, (<HTMLInputElement|HTMLTextAreaElement>element).value);
				
				viewmodel.requestUpdate();
				
			});
		}
	} else {
		element.addEventListener(name, () => {
			
			const viewmodel = component[VIEWMODEL];
			
			run(viewmodel, cmd);
			
			viewmodel.requestUpdate();
			
		});
	}
	
}

function registerCondition (component:any, element:Element, cmd:string) {
	
	const comment = document.createComment(`[if]=${cmd}`);
	
	component[CONDITIONALS].set(element, { cmd, comment });
	
}

function bindElements<T extends ViewModel> (component:L13Element<T>) :void {
	
	const elements = component[SHADOW_ROOT].querySelectorAll('*');
	
	if (elements) {
		elements.forEach((element:Element) => {
			
			if (element.nodeName === 'STYLE' || element.nodeName === 'SCRIPT') return;
			
			const attributes = getAttributes(element);
			
			if (!attributes) return;
			
			for (const [key, value] of Object.entries(attributes)) {
				const matches = findBinding.exec(key);
				
				if (!matches) continue;
				
				const [match, bindon, bind, on] = matches;
				const name = bindon || bind || on;
				
				if (bindon || bind) {
					if (name === 'if') registerCondition(component, element, value);
					else registerBinding(component, element, name, value);
				}
				if (bindon || on) registerEvent(component, element, name, value);
			}
			
		});
	}
	
	const textNodes = getAllTextNodes(component[SHADOW_ROOT]);
	
	if (textNodes) {
		
		textNodes.forEach((textNode) => {
			
			if (!textNode.parentNode || textNode.parentNode.nodeName === 'STYLE' || textNode.parentNode.nodeName === 'SCRIPT') return;
			
			let text = textNode.nodeValue;
			
			if (!text) return;
			
			let match = findScope.exec(text);
			
			if (!match) return;
			
			const fragment = document.createDocumentFragment();
			
			do {
				fragment.appendChild(document.createTextNode(text.slice(0, match.index)));
				const scope = document.createTextNode('');
				registerBinding(component, scope, 'nodeValue', match[1]);
				fragment.appendChild(scope);
				text = text.slice(match.index + match[0].length);
			} while ((match = findScope.exec(text)));
			
			if (text) fragment.appendChild(document.createTextNode(text));
			
			textNode.parentNode.replaceChild(fragment, textNode);
			
		});
	}
	
}

function get (context:any, path:string) :any {
	
	const names:string[] = path.split('.');
	let name:undefined|string = names.shift();
	
	while (name && context != null) {
		context = context[name];
		if (context == null && names.length) return;
		name = names.shift();
	}
	
	return name === '' ? undefined : context;
	
}

function set (context:any, path:string, value:any) :void {
	
	const names:string[] = path.split('.');
	let name:undefined|string = names.shift();
	
	while (name && context != null) {
		if (!names.length) {
			context[name] = value;
			return;
		} else {
			context = context[name];
			if (context == null) return;
			name = names.shift();
		}
	}
	
}

function run (context:any, path:string) :void {
	
	const names:string[] = path.split('.');
	let name:undefined|string = names.shift();
	
	while (name && context != null) {
		if (!names.length) {
			name = name.replace(findParathensis, '');
			if (typeof context[name] === 'function') context[name]();
			return;
		} else {
			context = context[name];
			if (context == null) return;
			name = names.shift();
		}
	}
	
}

function createStyles (styles:string[]) :DocumentFragment {
	
	const fragment = document.createDocumentFragment();
	
	styles.forEach((text:string) => {
		
		const style = document.createElement('STYLE');
		
		style.textContent = text;
		
		fragment.appendChild(style);
		
	});
	
	return fragment;
	
}

function createTemplate (template:string, useSlot:boolean = true) :HTMLTemplateElement {
		
	const templateElement = <HTMLTemplateElement>document.createElement('TEMPLATE');
	
	templateElement.innerHTML = template + (useSlot ? '<slot></slot>' : '');
	
	return templateElement;
	
}