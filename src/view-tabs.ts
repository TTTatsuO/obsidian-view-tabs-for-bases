import { EventRef, Menu } from 'obsidian';
import {
	DEFAULT_TAB_SETTINGS,
	moveItem,
	parseTabSettings,
	serializeTabSettings,
	TAB_COLORS,
	TAB_SETTINGS_KEY,
	TAB_SIZES,
	TabSettings,
} from './core/tabs';
import {
	BasesController,
	BasesViewConfig,
	findTabsAnchor,
	getCurrentViewName,
	getViewConfigs,
	getViewNames,
	readViewConfig,
	saveViewOrder,
	selectView,
	writeViewConfig,
} from './internals/bases';
import { text } from './i18n';

/** Drag data type. With text/plain, dropping a tab on a note would insert its name as text. */
const DRAG_TYPE = 'application/x-view-tabs-for-bases';

/** The tab strip of one open base. */
export class ViewTabs {
	private readonly containerEl: HTMLElement;
	private readonly viewChangedRef: EventRef;
	private readonly resizeObserver: ResizeObserver;
	private draggingName: string | null = null;

	constructor(readonly controller: BasesController) {
		this.containerEl = createDiv({ cls: 'view-tabs-for-bases' });
		this.viewChangedRef = controller.events.on('view-changed', () => this.render());

		// Scroll sideways when the tabs don't fit; turn vertical wheel movement into horizontal scrolling
		this.containerEl.addEventListener(
			'wheel',
			(evt) => {
				const el = this.containerEl;
				if (el.scrollWidth <= el.clientWidth || Math.abs(evt.deltaY) <= Math.abs(evt.deltaX)) return;
				evt.preventDefault();
				el.scrollLeft += evt.deltaY;
			},
			{ passive: false },
		);
		this.containerEl.addEventListener('scroll', () => this.updateOverflowHint());
		this.resizeObserver = new ResizeObserver(() => this.updateOverflowHint());
		this.resizeObserver.observe(this.containerEl);

		this.render();
	}

	render(): void {
		const anchor = findTabsAnchor(this.controller);
		if (!anchor) return;
		if (anchor.afterEl) anchor.afterEl.after(this.containerEl);
		else anchor.toolbarEl.prepend(this.containerEl);

		const scrollLeft = this.containerEl.scrollLeft;
		this.containerEl.empty();
		const current = getCurrentViewName(this.controller);
		const configs = getViewConfigs(this.controller);
		// If the view configs can't be read, show every view by name only (no hiding, color, size or reordering)
		const items: { name: string; config: BasesViewConfig | null; settings: TabSettings }[] = configs
			? configs
					.map((config) => ({
						name: config.name,
						config,
						settings: parseTabSettings(readViewConfig(config, TAB_SETTINGS_KEY)),
					}))
					.filter((item) => item.settings.show)
			: getViewNames(this.controller).map((name) => ({ name, config: null, settings: DEFAULT_TAB_SETTINGS }));

		let activeEl: HTMLElement | null = null;
		for (const { name, config, settings } of items) {
			const tabEl = this.containerEl.createEl('button', {
				cls: `view-tabs-for-bases-tab mod-${settings.size}`,
				text: name,
				attr: { type: 'button' },
			});
			if (settings.color) tabEl.dataset.color = settings.color;
			if (name === current) {
				tabEl.addClass('is-active');
				activeEl = tabEl;
			}
			tabEl.addEventListener('click', () => selectView(this.controller, name));
			if (configs) this.makeDraggable(tabEl, name, configs);
			if (config) {
				tabEl.addEventListener('contextmenu', (evt) => {
					evt.preventDefault();
					this.showTabMenu(evt, config, settings);
				});
			}
		}

		// Keep the scroll position across redraws, and bring the current view's tab into sight if it's hidden
		this.containerEl.scrollLeft = scrollLeft;
		if (activeEl) this.revealTab(activeEl);
		this.updateOverflowHint();
	}

	/** Scroll only the tab strip so the tab is visible (unlike scrollIntoView, outer panes don't move). */
	private revealTab(tabEl: HTMLElement): void {
		const el = this.containerEl;
		const left = tabEl.offsetLeft;
		const right = left + tabEl.offsetWidth;
		if (left < el.scrollLeft) el.scrollLeft = left;
		else if (right > el.scrollLeft + el.clientWidth) el.scrollLeft = right - el.clientWidth;
	}

	destroy(): void {
		this.controller.events.offref(this.viewChangedRef);
		this.resizeObserver.disconnect();
		this.containerEl.remove();
	}

	/** Fade the edge on each side that has hidden tabs. */
	private updateOverflowHint(): void {
		const el = this.containerEl;
		el.toggleClass('has-more-start', el.scrollLeft > 0);
		el.toggleClass('has-more-end', el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
	}

	/** Save the tab settings; when all are defaults the key is removed. */
	private saveSettings(config: BasesViewConfig, settings: TabSettings): void {
		if (writeViewConfig(config, TAB_SETTINGS_KEY, serializeTabSettings(settings))) this.render();
	}

	/** Context menu: color, size and remove from tabs. Writes the same values as "Tab settings" in Configure view. */
	private showTabMenu(evt: MouseEvent, config: BasesViewConfig, settings: TabSettings): void {
		const t = text();
		const menu = new Menu();

		menu.addItem((item) => item.setTitle(t.colorRow).setIsLabel(true).setSection('color'));
		for (const color of [null, ...TAB_COLORS]) {
			menu.addItem((item) =>
				item
					.setTitle(color ? t.colors[color] : t.colors.default)
					.setSection('color')
					.setChecked(settings.color === color)
					.onClick(() => this.saveSettings(config, { ...settings, color })),
			);
		}

		menu.addItem((item) => item.setTitle(t.sizeRow).setIsLabel(true).setSection('size'));
		for (const size of TAB_SIZES) {
			menu.addItem((item) =>
				item
					.setTitle(t.sizes[size])
					.setSection('size')
					.setChecked(settings.size === size)
					.onClick(() => this.saveSettings(config, { ...settings, size })),
			);
		}

		menu.addItem((item) =>
			item
				.setTitle(t.removeFromTabs)
				.setIcon('lucide-eye-off')
				.setSection('danger')
				.setWarning(true)
				.onClick(() => this.saveSettings(config, { ...settings, show: false })),
		);
		menu.showAtMouseEvent(evt);
	}

	private makeDraggable(tabEl: HTMLElement, name: string, configs: BasesViewConfig[]): void {
		tabEl.draggable = true;
		tabEl.addEventListener('dragstart', (evt) => {
			this.draggingName = name;
			evt.dataTransfer?.setData(DRAG_TYPE, name);
			if (evt.dataTransfer) evt.dataTransfer.effectAllowed = 'move';
			tabEl.addClass('is-dragging');
		});
		tabEl.addEventListener('dragend', () => {
			this.draggingName = null;
			tabEl.removeClass('is-dragging');
			this.containerEl.findAll('.is-drop-target').forEach((el) => el.removeClass('is-drop-target'));
		});
		tabEl.addEventListener('dragover', (evt) => {
			if (this.draggingName === null || this.draggingName === name) return;
			evt.preventDefault();
			if (evt.dataTransfer) evt.dataTransfer.dropEffect = 'move';
			tabEl.addClass('is-drop-target');
		});
		tabEl.addEventListener('dragleave', () => tabEl.removeClass('is-drop-target'));
		tabEl.addEventListener('drop', (evt) => {
			evt.preventDefault();
			tabEl.removeClass('is-drop-target');
			const from = configs.findIndex((c) => c.name === this.draggingName);
			const to = configs.findIndex((c) => c.name === name);
			this.draggingName = null;
			if (from < 0 || to < 0) return;
			// Reorder the views themselves, so the built-in view menu shows the same order
			if (saveViewOrder(this.controller, moveItem(configs, from, to))) this.render();
		});
	}
}
