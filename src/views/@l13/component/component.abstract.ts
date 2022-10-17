//	Imports ____________________________________________________________________

import type { ComponentOptions, Dictionary } from '../../../types';

import { ViewModelService } from './view-model-service.abstract';
import type { ViewModel } from './view-model.abstract';

//	Variables __________________________________________________________________

const BINDINGS = Symbol.for('bindings');
const CLASSNAMES = Symbol.for('classnames');
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

export function L13Component (options: ComponentOptions) {
	
	return function (target: new () => any) {
		
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

export function L13Query (rule: string) {
	
	return function (prototype: any, name: string) {
		
		if (!prototype[QUERIES]) prototype[QUERIES] = new Map<string, string>();
		
		(<Map<string, string>>prototype[QUERIES]).set(name, rule);
		
	};
	
}

export function L13Class (classNames: Dictionary<string>) {
	
	return function (prototype: any, name: string) {
		
		if (!prototype[CLASSNAMES]) prototype[CLASSNAMES] = new Map<string, Dictionary<string>>();
		
		(<Map<string, Dictionary<string>>>prototype[CLASSNAMES]).set(name, classNames);
		
	};
	
}

export abstract class L13Element<T extends ViewModel> extends HTMLElement {
	
	private [BINDINGS]: Map<Element | Text, Map<string, string>> = new Map();
	
	private [CONDITIONALS]: Map<Element, { cmd: string, comment: Comment }> = new Map();
	
	private [CLASSNAMES]: Map<string, Dictionary<string>>;
	
	private [QUERIES]: Map<string, string>;
	
	private [SERVICE]: ViewModelService<T>;
	
	private [SHADOW_ROOT]: ShadowRoot;
	
	private [STYLES]: DocumentFragment;
	
	private [TEMPLATE]: HTMLTemplateElement;
	
	private [VIEWMODEL]: T;
	
	public get vmId (): string {
		
		return this.getAttribute('vmId');
		
	}
	
	public set vmId (id: string) {
		
		if (this[VIEWMODEL]) this[VIEWMODEL].dispose(this);
		
		const vm = this[SERVICE].model(id);
		
		vm.connect(this);
		vm.requestUpdate();
		
		this.setAttribute('vmId', vm.id);
		
		this[VIEWMODEL] = vm;
		
	}
	
	public get viewmodel () {
		
		return this[VIEWMODEL];
		
	}
	
	public set viewmodel (vm: T) {
		
		if (!(vm instanceof this[SERVICE].vmc)) {
			throw new TypeError('viewmodel is not for this component!');
		}
		
		if (this[VIEWMODEL]) this[VIEWMODEL].dispose(this);
		
		this.setAttribute('vmId', vm.id);
		
		vm.connect(this);
		vm.requestUpdate();
		
		this[VIEWMODEL] = vm;
		
	}
	
	public constructor () {
		
		super();
		
		const shadowRoot = this[SHADOW_ROOT] = this.attachShadow({ mode: 'closed' });
		
		if (this[STYLES]) shadowRoot.appendChild(this[STYLES].cloneNode(true));
		if (this[TEMPLATE]) {
			shadowRoot.appendChild(this[TEMPLATE].content.cloneNode(true));
			if (this[QUERIES]) {
				for (const [name, query] of this[QUERIES]) (<any> this)[name] = shadowRoot.querySelector(query);
			}
		}
		
		bindElements(this);
		
	}
	
	public connectedCallback () {
		
		if (!this[VIEWMODEL]) initViewModel(this);
		
	}
	
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public update (...args: any[]) {
		
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
		
		if (this[CLASSNAMES]) {
			for (const [name, classNames] of this[CLASSNAMES]) {
				const element: HTMLElement = (<any> this)[name];
				for (const [className, path] of Object.entries(classNames)) {
					if (get(viewmodel, path)) element.classList.add(className);
					else element.classList.remove(className);
				}
			}
		}
		
	}
	
	public dispatchCustomEvent (type: string, detail?: any) {
		
		this.dispatchEvent(new CustomEvent(type, { detail, bubbles: false }));
		
	}
	
}

//	Functions __________________________________________________________________

function hasParentClass (child: any, parent: any): boolean {
	
	do {
		const currentParent = Object.getPrototypeOf(child);
		if (currentParent === parent) return true;
		child = currentParent;
	} while (child);
	
	return false;
	
}

function getAttributes (element: Element) {
	
	if (!element.attributes.length) return null;
	
	const attributes = element.attributes;
	const length = attributes.length;
	const map: Dictionary<string> = {};
	let i = 0;
	let name;
	
	while (i < length && (name = attributes[i++].nodeName)) {
		map[name] = element.getAttribute(name);
	}
	
	return map;
	
}

function getAllTextNodes (root: Element | ShadowRoot) {
	
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
	const textNodes = [];
	let node;
	
	while ((node = walk.nextNode())) textNodes.push(node);
	
	return textNodes.length ? textNodes : null;
	
}

function initViewModel<T extends ViewModel> (component: L13Element<T>) {
	
	const vm = component[SERVICE].model(component.vmId);
	
	vm.connect(component);
	vm.requestUpdate();
	
	component[VIEWMODEL] = vm;
	
}

function registerBinding<T extends ViewModel> (component: L13Element<T>, element: Element | Text, name: string, cmd: string) {
	
	const bindings = component[BINDINGS];
	let elementBindings = bindings.get(element);
	
	if (!elementBindings) {
		elementBindings = new Map();
		bindings.set(element, elementBindings);
	}
	
	if (name === 'model') {
		if (element instanceof HTMLInputElement && element.getAttribute('type') === 'checkbox') name = 'checked';
		else name = 'value';
	}
	
	elementBindings.set(name, cmd);
	
}

function registerEvent<T extends ViewModel> (component: L13Element<T>, element: Element, name: string, cmd: string) {
	
	if (name === 'model') {
		if (element instanceof HTMLInputElement && element.getAttribute('type') === 'checkbox') {
			element.addEventListener('change', () => {
				
				const viewmodel = component[VIEWMODEL];
				
				set(viewmodel, cmd, element.checked);
				
				viewmodel.requestUpdate();
				
			});
		} else if (element instanceof HTMLInputElement && element.getAttribute('type') === 'text') {
			element.addEventListener('input', () => {
				
				const viewmodel = component[VIEWMODEL];
				
				set(viewmodel, cmd, (<HTMLInputElement | HTMLTextAreaElement>element).value);
				
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

function registerCondition<T extends ViewModel> (component: L13Element<T>, element: Element, cmd: string) {
	
	const comment = document.createComment(`[if]=${cmd}`);
	
	component[CONDITIONALS].set(element, { cmd, comment });
	
}

function bindElements<T extends ViewModel> (component: L13Element<T>) {
	
	const elements = component[SHADOW_ROOT].querySelectorAll('*');
	
	if (elements.length) {
		elements.forEach((element: Element) => {
			
			const attributes = getAttributes(element);
			
			if (!attributes) return;
			
			for (const [key, value] of Object.entries(attributes)) {
				const matches = findBinding.exec(key);
				
				if (!matches) continue;
				
				const [, bindon, bind, on] = matches;
				const name = bindon || bind || on;
				
				if (bindon || bind) {
					if (name === 'if') registerCondition(component, element, value);
					else registerBinding(component, element, name, value);
				}
				if (bindon || on) registerEvent(component, element, name, value);
			}
			
		});
	}
	
	const textNodes = getAllTextNodes(component[SHADOW_ROOT]);
	
	textNodes?.forEach((textNode) => {
		
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

function get (context: any, path: string): any {
	
	const names: string[] = path.split('.');
	let name: undefined | string = names.shift();
	
	while (name && context != null) {
		context = context[name];
		if (context == null && names.length) return;
		name = names.shift();
	}
	
	return name === '' ? undefined : context;
	
}

function set (context: any, path: string, value: any) {
	
	const names: string[] = path.split('.');
	let name: undefined | string = names.shift();
	
	while (name && context != null) {
		if (!names.length) {
			context[name] = value;
			return;
		}
		context = context[name];
		if (context == null) return;
		name = names.shift();
	}
	
}

function run (context: any, path: string) {
	
	const names: string[] = path.split('.');
	let name: undefined | string = names.shift();
	
	while (name && context != null) {
		if (!names.length) {
			name = name.replace(findParathensis, '');
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			if (typeof context[name] === 'function') context[name]();
			return;
		}
		context = context[name];
		if (context == null) return;
		name = names.shift();
	}
	
}

function createStyles (styles: string[]): DocumentFragment {
	
	const fragment = document.createDocumentFragment();
	
	styles.forEach((text: string) => {
		
		const style = document.createElement('STYLE');
		
		style.textContent = text;
		
		fragment.appendChild(style);
		
	});
	
	return fragment;
	
}

function createTemplate (template: string): HTMLTemplateElement {
	
	const templateElement = <HTMLTemplateElement>document.createElement('TEMPLATE');
	
	templateElement.innerHTML = template;
	
	return templateElement;
	
}