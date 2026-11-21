import { debounce, Plugin, TFile, View } from 'obsidian';
import { BasesController, getBasesController, isViewMenuOpen, restoreViewStateOnSwitch } from './internals/bases';
import { ViewTabsForBasesSettingTab, ViewTabsForBasesSettings, DEFAULT_SETTINGS, parseTabPosition } from './settings';
import { CellDirection, canMoveCell, handleVimKey, moveCell } from './internals/table';
import { ViewConfigSection } from './view-config-section';
import { cycleView, ViewTabs } from './view-tabs';
import { text } from './i18n';

export default class ViewTabsForBasesPlugin extends Plugin {
	settings: ViewTabsForBasesSettings = DEFAULT_SETTINGS;
	private readonly tabs = new Map<View, ViewTabs>();
	/** The view-state workaround on each open base: the controller it's on and how to remove it. */
	private readonly restorers = new Map<View, { controller: BasesController; undo: () => void }>();
	private configSection: ViewConfigSection | null = null;
	private readonly requestSync = debounce(() => this.sync(), 50, true);

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new ViewTabsForBasesSettingTab(this.app, this));

		// No default hotkeys, so they don't clash with anyone's own; assign them in Settings → Hotkeys
		const t = text();
		this.addCommand({
			id: 'next-view',
			name: t.nextView,
			checkCallback: (checking) => this.cycleActive(1, checking),
		});
		this.addCommand({
			id: 'previous-view',
			name: t.previousView,
			checkCallback: (checking) => this.cycleActive(-1, checking),
		});
		const moves: [CellDirection, string][] = [
			['up', t.moveCellUp],
			['down', t.moveCellDown],
			['left', t.moveCellLeft],
			['right', t.moveCellRight],
		];
		for (const [direction, name] of moves) {
			this.addCommand({
				id: `move-cell-${direction}`,
				name,
				checkCallback: (checking) => this.moveActiveCell(direction, checking),
			});
		}

		// h j k l in tables: a plain key can't be a hotkey, so this listens for it directly, in every window
		const onKeydown = (evt: KeyboardEvent) => {
			if (this.settings.vimKeys) handleVimKey(evt);
		};
		this.registerDomEvent(window, 'keydown', onKeydown, true);
		this.registerEvent(
			this.app.workspace.on('window-open', (_win, win) => this.registerDomEvent(win, 'keydown', onKeydown, true)),
		);

		this.app.workspace.onLayoutReady(() => this.sync());
		this.registerEvent(this.app.workspace.on('layout-change', () => this.requestSync()));
		this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.requestSync()));
		// Adding, renaming or deleting a view arrives as a save of the .base file
		this.registerEvent(
			this.app.vault.on('modify', (file) => {
				if (file instanceof TFile && file.extension === 'base') this.requestRender();
			}),
		);
	}

	onunload(): void {
		this.clear();
	}

	async loadSettings(): Promise<void> {
		// showTabs: up to 0.3.0, turning the tabs off was a toggle of its own; now it's a tab position
		const data = (await this.loadData()) as (Partial<ViewTabsForBasesSettings> & { showTabs?: unknown }) | null;
		// Read known keys only, so settings removed in a later version don't linger in data.json
		this.settings = {
			showIcons: data?.showIcons ?? DEFAULT_SETTINGS.showIcons,
			tabPosition: data?.showTabs === false ? 'hidden' : parseTabPosition(data?.tabPosition),
			wrapTabs: data?.wrapTabs ?? DEFAULT_SETTINGS.wrapTabs,
			restoreViewState: data?.restoreViewState ?? DEFAULT_SETTINGS.restoreViewState,
			vimKeys: data?.vimKeys ?? DEFAULT_SETTINGS.vimKeys,
		};
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.clear();
		this.sync();
	}

	/**
	 * Switch the active base's view. Available whenever a base is the active view, even with
	 * the tabs turned off, so the hotkeys keep working for people who hide the tab strip.
	 */
	private cycleActive(step: 1 | -1, checking: boolean): boolean {
		const controller = getBasesController(this.app.workspace.getActiveViewOfType(View));
		if (!controller) return false;
		if (!checking) cycleView(controller, step);
		return true;
	}

	/**
	 * Move the selected cell of the active base's table, so the arrow keys' job can be given to
	 * other hotkeys. Not available while text is being edited, so those keys still type there.
	 */
	private moveActiveCell(direction: CellDirection, checking: boolean): boolean {
		const controller = getBasesController(this.app.workspace.getActiveViewOfType(View));
		if (!controller || !canMoveCell(controller)) return false;
		if (!checking) moveCell(controller, direction);
		return true;
	}

	/**
	 * Attach tabs and the view-state workaround to every open base, as the settings ask,
	 * and detach them from bases that were closed.
	 */
	private sync(): void {
		const open = new Map<View, BasesController>();
		for (const leaf of this.app.workspace.getLeavesOfType('bases')) {
			const controller = getBasesController(leaf.view);
			if (controller) open.set(leaf.view, controller);
		}

		// Detach first from bases that were closed, or whose view now has a different controller
		for (const [view, tabs] of this.tabs) {
			if (open.get(view) === tabs.controller) continue;
			tabs.destroy();
			this.tabs.delete(view);
		}
		for (const [view, restorer] of this.restorers) {
			if (open.get(view) === restorer.controller) continue;
			restorer.undo();
			this.restorers.delete(view);
		}

		const { tabPosition } = this.settings;
		if (tabPosition !== 'hidden') {
			this.configSection ??= new ViewConfigSection(
				() => this.findMenuOwner(),
				() => this.requestRender(),
			);
			const options = {
				showIcons: this.settings.showIcons,
				position: tabPosition,
				wrap: this.settings.wrapTabs,
			};
			for (const [view, controller] of open) {
				if (!this.tabs.has(view)) this.tabs.set(view, new ViewTabs(controller, options));
			}
		}
		if (this.settings.restoreViewState) {
			for (const [view, controller] of open) {
				if (this.restorers.has(view)) continue;
				const undo = restoreViewStateOnSwitch(controller);
				if (undo) this.restorers.set(view, { controller, undo });
			}
		}
	}

	/**
	 * The base whose view menu is open, i.e. the one that opened "Configure view". Only one
	 * view menu can be open at a time, so two bases with a view of the same name are never
	 * confused. Returns null when none is found, and then nothing is written.
	 */
	private findMenuOwner(): BasesController | null {
		for (const tabs of this.tabs.values()) {
			if (isViewMenuOpen(tabs.controller)) return tabs.controller;
		}
		return null;
	}

	/** Right after a save the controller still holds the old query, so redraw a little later. */
	private requestRender(): void {
		window.setTimeout(() => {
			for (const tabs of this.tabs.values()) tabs.render();
		}, 300);
	}

	private clear(): void {
		for (const tabs of this.tabs.values()) tabs.destroy();
		this.tabs.clear();
		this.configSection?.destroy();
		this.configSection = null;
		for (const { undo } of this.restorers.values()) undo();
		this.restorers.clear();
	}
}
