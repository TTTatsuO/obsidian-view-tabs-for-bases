import { App, PluginSettingTab, SettingDefinitionItem } from 'obsidian';
import { text } from './i18n';
import type ViewTabsForBasesPlugin from './main';

export interface ViewTabsForBasesSettings {
	showTabs: boolean;
	restoreViewState: boolean;
}

export const DEFAULT_SETTINGS: ViewTabsForBasesSettings = {
	showTabs: true,
	restoreViewState: true,
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
			{
				name: t.restoreViewState,
				desc: t.restoreViewStateDesc,
				control: { type: 'toggle', key: 'restoreViewState', defaultValue: DEFAULT_SETTINGS.restoreViewState },
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (key !== 'showTabs' && key !== 'restoreViewState') return;
		this.plugin.settings[key] = value === true;
		await this.plugin.saveSettings();
	}
}
