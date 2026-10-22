import type { EventRef, View } from 'obsidian';

// The only place that touches non-public parts of Obsidian. A Bases view (an open .base file)
// has a controller that lists the views and switches between them (checked on 1.14).
// Nothing here throws: when something is unavailable these functions return null, false or an
// empty value, and callers keep working with less.

/** One view's config. get/set are also public API (BasesViewConfig); keys are saved in that view in the .base file. */
export interface BasesViewConfig {
	name: string;
	get(key: string): unknown;
	set(key: string, value: unknown): void;
}

export interface BasesController {
	viewName: string;
	viewHeaderEl: HTMLElement;
	query: {
		views: BasesViewConfig[];
		save(): void;
	} | null;
	getQueryViewNames(): string[];
	selectView(name: string): void;
	events: {
		on(name: 'view-changed', callback: () => void): EventRef;
		offref(ref: EventRef): void;
	};
}

/** The controller of a Bases view, or null. */
export function getBasesController(view: View | null | undefined): BasesController | null {
	try {
		if (!view || view.getViewType() !== 'bases') return null;
		const controller = (view as unknown as { controller?: Partial<BasesController> }).controller;
		if (
			!controller ||
			typeof controller.getQueryViewNames !== 'function' ||
			typeof controller.selectView !== 'function' ||
			// instanceOf also works for elements in pop-out windows
			!controller.viewHeaderEl?.instanceOf?.(HTMLElement) ||
			typeof controller.events?.on !== 'function' ||
			typeof controller.events?.offref !== 'function'
		) {
			return null;
		}
		return controller as BasesController;
	} catch {
		return null;
	}
}

/** The view names, or an empty list. */
export function getViewNames(controller: BasesController): string[] {
	try {
		const names = controller.getQueryViewNames();
		return Array.isArray(names) ? names.filter((n): n is string => typeof n === 'string') : [];
	} catch {
		return [];
	}
}

/** The name of the view being shown, or null. */
export function getCurrentViewName(controller: BasesController): string | null {
	return typeof controller.viewName === 'string' ? controller.viewName : null;
}

/** Switch to a view. Returns false if that fails. */
export function selectView(controller: BasesController, name: string): boolean {
	try {
		controller.selectView(name);
		return true;
	} catch {
		return false;
	}
}

/** The view configs, or null when get/set aren't available. */
export function getViewConfigs(controller: BasesController): BasesViewConfig[] | null {
	const views = controller.query?.views;
	if (!Array.isArray(views)) return null;
	if (!views.every((v) => typeof v.name === 'string' && typeof v.get === 'function' && typeof v.set === 'function')) {
		return null;
	}
	return views;
}

/** Read a value from a view config, or undefined. */
export function readViewConfig(config: BasesViewConfig, key: string): unknown {
	try {
		return config.get(key);
	} catch {
		return undefined;
	}
}

/** Write a value to a view config and save. null removes the key. Returns false if that fails. */
export function writeViewConfig(config: BasesViewConfig, key: string, value: unknown): boolean {
	try {
		config.set(key, value);
		return true;
	} catch {
		return false;
	}
}

/** Save a new order of the views. Returns false (and restores the order) if that fails. */
export function saveViewOrder(controller: BasesController, ordered: BasesViewConfig[]): boolean {
	const query = controller.query;
	if (!query || !Array.isArray(query.views) || typeof query.save !== 'function') return false;
	const original = query.views.slice();
	try {
		query.views.splice(0, query.views.length, ...ordered);
		query.save();
		return true;
	} catch {
		try {
			query.views.splice(0, query.views.length, ...original);
		} catch {
			// Even if this fails, the next load restores the order from the file
		}
		return false;
	}
}

/** Where to insert the tabs: right after the result count. null if the toolbar isn't found. */
export function findTabsAnchor(controller: BasesController): { toolbarEl: HTMLElement; afterEl: Element | null } | null {
	const toolbarEl = controller.viewHeaderEl.querySelector<HTMLElement>('.bases-toolbar');
	if (!toolbarEl) return null;
	return { toolbarEl, afterEl: toolbarEl.querySelector('.bases-toolbar-result-count') };
}

/** The button that opens the built-in view menu. */
function findViewMenuButton(controller: BasesController): HTMLElement | null {
	return controller.viewHeaderEl.querySelector<HTMLElement>('.bases-toolbar-views-menu .text-icon-button');
}

/** Whether this base's view menu is open; its button has has-active-menu while open. */
export function isViewMenuOpen(controller: BasesController): boolean {
	return findViewMenuButton(controller)?.hasClass('has-active-menu') ?? false;
}

/** Whether the node is a view menu, which sits directly under <body> while open. */
export function isViewMenuEl(node: Node): node is HTMLElement {
	return node.instanceOf(HTMLElement) && node.hasClass('bases-toolbar-menu') && node.hasClass('bases-toolbar-views-menu');
}

/** The view menus currently open directly under <body>. */
export function findOpenViewMenus(bodyEl: HTMLElement): HTMLElement[] {
	return Array.from(bodyEl.children).filter(isViewMenuEl);
}

/** The Configure view forms under rootEl, or an empty list. */
export function findViewConfigForms(rootEl: HTMLElement): HTMLElement[] {
	return Array.from(rootEl.querySelectorAll<HTMLElement>('.bases-toolbar-menu-form.view-config-menu'));
}

/** The value of the view name field at the top of Configure view. */
export function getViewConfigFormName(formEl: HTMLElement): string | null {
	const inputEl = formEl.querySelector<HTMLInputElement>('.input-row input');
	return inputEl ? inputEl.value : null;
}
