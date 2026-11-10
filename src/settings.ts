import { App, PluginSettingTab, SettingDefinitionItem } from 'obsidian';
import { text } from './i18n';
import type ViewTabsForBasesPlugin from './main';
import type { TabPosition } from './view-tabs';

export interface ViewTabsForBasesSettings {
	showTabs: boolean;
	showIcons: boolean;
	tabPosition: TabPosition;
	wrapTabs: boolean;
	restoreViewState: boolean;
}

export const DEFAULT_SETTINGS: ViewTabsForBasesSettings = {
	showTabs: true,
	showIcons: true,
	tabPosition: 'inline',
	wrapTabs: false,
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
				name: t.showIcons,
				desc: t.showIconsDesc,
				control: { type: 'toggle', key: 'showIcons', defaultValue: DEFAULT_SETTINGS.showIcons },
			},
			{
				name: t.tabPosition,
				desc: t.tabPositionDesc,
				control: {
					type: 'dropdown',
					key: 'tabPosition',
					defaultValue: DEFAULT_SETTINGS.tabPosition,
					options: { inline: t.positionInline, below: t.positionBelow },
				},
			},
			{
				name: t.wrapTabs,
				desc: t.wrapTabsDesc,
				control: { type: 'toggle', key: 'wrapTabs', defaultValue: DEFAULT_SETTINGS.wrapTabs },
			},
			{
				name: t.restoreViewState,
				desc: t.restoreViewStateDesc,
				control: { type: 'toggle', key: 'restoreViewState', defaultValue: DEFAULT_SETTINGS.restoreViewState },
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (key === 'tabPosition') {
			this.plugin.settings.tabPosition = value === 'below' ? 'below' : 'inline';
		} else if (key === 'showTabs' || key === 'showIcons' || key === 'wrapTabs' || key === 'restoreViewState') {
			this.plugin.settings[key] = value === true;
		} else {
			return;
		}
		await this.plugin.saveSettings();
	}
}
