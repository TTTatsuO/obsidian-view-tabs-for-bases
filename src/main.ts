import { debounce, Plugin, TFile, View } from 'obsidian';
import { BasesController, getBasesController, isViewMenuOpen } from './internals/bases';
import { ViewTabsForBasesSettingTab, ViewTabsForBasesSettings, DEFAULT_SETTINGS } from './settings';
import { ViewConfigSection } from './view-config-section';
import { ViewTabs } from './view-tabs';

export default class ViewTabsForBasesPlugin extends Plugin {
	settings: ViewTabsForBasesSettings = DEFAULT_SETTINGS;
	private readonly tabs = new Map<View, ViewTabs>();
	private configSection: ViewConfigSection | null = null;
	private readonly requestSync = debounce(() => this.sync(), 50, true);

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new ViewTabsForBasesSettingTab(this.app, this));

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
		const data = (await this.loadData()) as Partial<ViewTabsForBasesSettings> | null;
		// Read known keys only, so settings removed in a later version don't linger in data.json
		this.settings = { showTabs: data?.showTabs ?? DEFAULT_SETTINGS.showTabs };
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.clear();
		this.sync();
	}

	/** Attach tabs to every open base and detach them from bases that were closed. */
	private sync(): void {
		if (!this.settings.showTabs) {
			this.clear();
			return;
		}
		this.configSection ??= new ViewConfigSection(
			() => this.findMenuOwner(),
			() => this.requestRender(),
		);

		const open = new Set<View>();
		for (const leaf of this.app.workspace.getLeavesOfType('bases')) {
			const view = leaf.view;
			const controller = getBasesController(view);
			if (!controller) continue;
			open.add(view);
			if (!this.tabs.has(view)) this.tabs.set(view, new ViewTabs(controller));
		}
		for (const [view, tabs] of this.tabs) {
			if (open.has(view)) continue;
			tabs.destroy();
			this.tabs.delete(view);
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
	}
}
