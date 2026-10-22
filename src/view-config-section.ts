import { DropdownComponent, ToggleComponent } from 'obsidian';
import { parseTabSettings, serializeTabSettings, TAB_COLORS, TAB_SETTINGS_KEY, TAB_SIZES, TabColor, TabSettings, TabSize } from './core/tabs';
import {
	BasesController,
	BasesViewConfig,
	findOpenViewMenus,
	findViewConfigForms,
	getViewConfigFormName,
	getViewConfigs,
	isViewMenuEl,
	readViewConfig,
	writeViewConfig,
} from './internals/bases';
import { text } from './i18n';

const SECTION_CLASS = 'view-tabs-for-bases-config-section';

/**
 * Adds a "Tab settings" section at the end of Configure view.
 * Watching happens in two steps: notice a view menu opening directly under <body>, then watch
 * inside that menu only while it is open. Obsidian rebuilds Configure view each time it opens
 * or the layout changes, so the section is added again each time.
 */
export class ViewConfigSection {
	private readonly bodyObserver: MutationObserver;
	private readonly menuObservers = new Map<HTMLElement, MutationObserver>();

	constructor(
		/** The base whose view menu is open, or null if none is. */
		private readonly getMenuOwner: () => BasesController | null,
		private readonly onChange: () => void,
	) {
		this.bodyObserver = new MutationObserver(() => this.syncMenus());
		this.bodyObserver.observe(document.body, { childList: true });
		this.syncMenus();
	}

	destroy(): void {
		this.bodyObserver.disconnect();
		for (const observer of this.menuObservers.values()) observer.disconnect();
		this.menuObservers.clear();
		document.body.findAll(`.${SECTION_CLASS}`).forEach((el) => el.remove());
	}

	/** Watch the view menus that are open and stop watching the ones that closed. */
	private syncMenus(): void {
		const open = new Set(findOpenViewMenus(document.body));
		for (const [menuEl, observer] of this.menuObservers) {
			if (open.has(menuEl) && menuEl.isConnected) continue;
			observer.disconnect();
			this.menuObservers.delete(menuEl);
		}
		for (const menuEl of open) {
			if (this.menuObservers.has(menuEl) || !isViewMenuEl(menuEl)) continue;
			const observer = new MutationObserver(() => this.inject(menuEl));
			observer.observe(menuEl, { childList: true, subtree: true });
			this.menuObservers.set(menuEl, observer);
			this.inject(menuEl);
		}
	}

	private inject(menuEl: HTMLElement): void {
		for (const formEl of findViewConfigForms(menuEl)) {
			if (formEl.querySelector(`.${SECTION_CLASS}`)) continue;
			const controller = this.getMenuOwner();
			if (!controller) continue;
			const name = getViewConfigFormName(formEl);
			const config = getViewConfigs(controller)?.find((c) => c.name === name);
			// Skip a view that was just added and isn't saved yet
			if (!config) continue;
			this.render(formEl, config);
		}
	}

	private render(formEl: HTMLElement, config: BasesViewConfig): void {
		const t = text();
		// Values when the section opened; each change updates them and writes them under one key
		let settings = parseTabSettings(readViewConfig(config, TAB_SETTINGS_KEY));
		const save = (patch: Partial<TabSettings>): void => {
			settings = { ...settings, ...patch };
			if (writeViewConfig(config, TAB_SETTINGS_KEY, serializeTabSettings(settings))) this.onChange();
		};

		// Divider, heading and rows use the same elements as Bases' own option groups
		const sectionEl = formEl.createDiv(SECTION_CLASS);
		sectionEl.createDiv('input-group-divider');
		const groupEl = sectionEl.createDiv('input-group-container');
		groupEl.createDiv({ cls: 'input-group-header', text: t.configSection });
		const contentEl = groupEl.createDiv('input-group-content');

		new ToggleComponent(this.createRow(contentEl, t.showInTabsRow, 'mod-toggle'))
			.setValue(settings.show)
			.onChange((show) => save({ show }));

		const colorDropdown = new DropdownComponent(this.createRow(contentEl, t.colorRow)).addOption('', t.colors.default);
		for (const color of TAB_COLORS) colorDropdown.addOption(color, t.colors[color]);
		colorDropdown
			.setValue(settings.color ?? '')
			.onChange((value) => save({ color: value === '' ? null : (value as TabColor) }));

		const sizeDropdown = new DropdownComponent(this.createRow(contentEl, t.sizeRow));
		for (const size of TAB_SIZES) sizeDropdown.addOption(size, t.sizes[size]);
		sizeDropdown.setValue(settings.size).onChange((value) => save({ size: value as TabSize }));
	}

	private createRow(parentEl: HTMLElement, label: string, cls = ''): HTMLElement {
		const rowEl = parentEl.createDiv(`input-row ${cls}`.trim());
		rowEl.createDiv({ cls: 'input-row-label', text: label });
		return rowEl.createDiv('input-row-content');
	}
}
