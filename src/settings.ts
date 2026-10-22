import { App, PluginSettingTab, SettingDefinitionItem } from 'obsidian';
import { text } from './i18n';
import type ViewTabsForBasesPlugin from './main';

export interface ViewTabsForBasesSettings {
	showTabs: boolean;
}

export const DEFAULT_SETTINGS: ViewTabsForBasesSettings = {
	showTabs: true,
};

export class ViewTabsForBasesSettingTab extends PluginSettingTab {
	constructor(app: App, private readonly plugin: ViewTabsForBasesPlugin) {
		super(app, plugin);
	}

	/**
	 * Declarative settings (Obsidian 1.13+): rendered by Obsidian and included in
	 * settings search. A single section, so no heading (plugin guidelines).
	 */
	getSettingDefinitions(): SettingDefinitionItem[] {
		const t = text();
		return [
			{
				name: t.showTabs,
				desc: t.showTabsDesc,
				control: { type: 'toggle', key: 'showTabs', defaultValue: DEFAULT_SETTINGS.showTabs },
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (key !== 'showTabs') return;
		this.plugin.settings.showTabs = value === true;
		await this.plugin.saveSettings();
	}
}
