import type { EventRef, View } from 'obsidian';

// The only place that touches non-public parts of Obsidian. A Bases view (an open .base file)
// has a controller that lists the views and switches between them (checked on 1.14).
// Nothing here throws: when something is unavailable these functions return null, false or an
// empty value, and callers keep working with less.

/** One view's config. get/set are also public API (BasesViewConfig); keys are saved in that view in the .base file. */
export interface BasesViewConfig {
	name: string;
	/** The view type ("table", "cards", ... or a plugin's own). Not public API. */
	type?: unknown;
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
	/** The Bases core plugin, which knows each view type's icon. */
	plugin?: {
		getRegistration?(type: string): { icon?: unknown } | null;
	};
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

/** The icon of a view's type, as shown in the view menu, or null. */
export function getViewIcon(controller: BasesController, config: BasesViewConfig): string | null {
	try {
		if (typeof config.type !== 'string') return null;
		const icon = controller.plugin?.getRegistration?.(config.type)?.icon;
		return typeof icon === 'string' && icon !== '' ? icon : null;
	} catch {
		return null;
	}
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

/**
 * Where to insert the tabs: right after the result count, or below the toolbar's header row
 * (headerEl). null if the toolbar isn't found.
 */
export function findTabsAnchor(
	controller: BasesController,
): { toolbarEl: HTMLElement; afterEl: Element | null; headerEl: HTMLElement | null } | null {
	const toolbarEl = controller.viewHeaderEl.querySelector<HTMLElement>('.bases-toolbar');
	if (!toolbarEl) return null;
	return {
		toolbarEl,
		afterEl: toolbarEl.querySelector('.bases-toolbar-result-count'),
		headerEl: toolbarEl.closest<HTMLElement>('.bases-header'),
	};
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

/** The parts of a view that saving and restoring its state touch (table, cards and list all have them). */
interface StatefulView {
	setEphemeralState(state: unknown): void;
	onDataUpdated: (this: StatefulView) => void;
	updateVirtualDisplay?(): void;
	/** Table and cards: the scroll position that onDataUpdated draws with. */
	lastScroll?: unknown;
}

interface SwitchingController {
	selectView: (this: SwitchingController, name: string) => void;
	view?: unknown;
	viewName?: unknown;
	viewEstates?: Record<string, unknown>;
	viewHeaderEl?: HTMLElement;
}

function isStatefulView(view: unknown): view is StatefulView {
	const v = view as Partial<StatefulView> | null | undefined;
	return typeof v?.setEphemeralState === 'function' && typeof v.onDataUpdated === 'function';
}

/**
 * Works around Obsidian (checked on 1.15) sometimes losing the selected cell and scroll position
 * when you switch between two views of the same type and back. Obsidian reuses the view object
 * and applies the saved state while it still holds the previous view's rows, so a cell beyond
 * those rows is dropped, and the scroll position is then replaced by the previous view's.
 * Applying the saved state once more after the new rows arrive puts both back.
 * Returns a function that removes the workaround, or null when it can't be installed. After
 * removal nothing of it runs, even if another plugin wrapped selectView later and it can't be unwound.
 */
export function restoreViewStateOnSwitch(controller: BasesController): (() => void) | null {
	const target = controller as unknown as SwitchingController;
	const original = target.selectView;
	if (typeof original !== 'function') return null;
	const hadOwn = Object.prototype.hasOwnProperty.call(target, 'selectView');
	const active = { value: true };

	const patched = function (this: SwitchingController, name: string): void {
		const before = this.view;
		const beforeName = this.viewName;
		original.call(this, name);
		// Choosing the view already shown does nothing in Obsidian; its saved state is from an
		// earlier visit, so don't wait to apply it on some later, unrelated update
		if (!active.value || this.viewName === beforeName) return;
		try {
			reapplyAfterNextData(this, before, active);
		} catch {
			// Leave Obsidian's own behaviour as it is
		}
	};
	target.selectView = patched;

	return () => {
		active.value = false;
		if (target.selectView !== patched) return;
		if (hadOwn) target.selectView = original;
		else delete (target as Partial<SwitchingController>).selectView;
	};
}

/** After a switch that reused the view object, apply the saved state again once the new rows arrive. */
function reapplyAfterNextData(controller: SwitchingController, before: unknown, active: { value: boolean }): void {
	const { view, viewName } = controller;
	// A new view object starts without rows, so Obsidian's own restore works there
	if (view !== before || !isStatefulView(view) || typeof viewName !== 'string') return;
	const state = controller.viewEstates?.[viewName];
	if (!state || typeof state !== 'object') return;
	const { scroll } = state as { scroll?: unknown };

	const hadOwn = Object.prototype.hasOwnProperty.call(view, 'onDataUpdated');
	const original = view.onDataUpdated;
	view.onDataUpdated = function (this: StatefulView): void {
		// Runs once: take this wrapper off before anything else
		if (hadOwn) view.onDataUpdated = original;
		else delete (view as Partial<StatefulView>).onDataUpdated;
		// Skip if the workaround was removed or another view was chosen while the rows were loading
		const current = active.value && controller.view === view && controller.viewName === viewName;
		// Draw the new rows at the saved scroll position straight away, instead of at the
		// previous view's and then jumping
		if (current && scroll && typeof scroll === 'object' && 'lastScroll' in view) view.lastScroll = scroll;
		original.call(this);
		// The table takes focus when its cell is restored; don't pull it away from where the user went meanwhile
		if (!current || !focusStayedInBase(controller)) return;
		try {
			view.setEphemeralState(state);
			view.updateVirtualDisplay?.();
		} catch {
			// Leave Obsidian's own behaviour as it is
		}
	};
}

/**
 * Whether focus is still somewhere it was when the view was switched: nowhere in particular, or
 * in this base on something that isn't a text field (a tab, a toolbar button, the table itself).
 */
function focusStayedInBase(controller: SwitchingController): boolean {
	const rootEl = controller.viewHeaderEl?.parentElement;
	if (!rootEl) return false;
	const activeEl = rootEl.doc.activeElement;
	if (!activeEl || activeEl === rootEl.doc.body) return true;
	if (!rootEl.contains(activeEl)) return false;
	return !activeEl.matches('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
}
