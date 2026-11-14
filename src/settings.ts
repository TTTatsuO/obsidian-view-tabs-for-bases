import { App, PluginSettingTab, SettingDefinitionItem } from 'obsidian';
import { text } from './i18n';
import type ViewTabsForBasesPlugin from './main';

/** Where the tabs go: next to the result count, on a row of their own below the toolbar, or nowhere. */
export type TabPosition = 'inline' | 'below' | 'hidden';

/** A stored or chosen position; anything unknown is the default. */
export function parseTabPosition(value: unknown): TabPosition {
	return value === 'below' || value === 'hidden' ? value : 'inline';
}

export interface ViewTabsForBasesSettings {
	showIcons: boolean;
	tabPosition: TabPosition;
	wrapTabs: boolean;
	restoreViewState: boolean;
}

export const DEFAULT_SETTINGS: ViewTabsForBasesSettings = {
	showIcons: true,
	tabPosition: 'inline',
	wrapTabs: false,
	restoreViewState: true,
};

export class ViewTabsForBasesSettingTab extends PluginSettingTab {
	constructor(app: App, private readonly plugin: ViewTabsForBasesPlugin) {
		super(app, plugin);
	}

	/** Declarative settings (Obsidian 1.13+): rendered by Obsidian and included in settings search. */
	getSettingDefinitions(): SettingDefinitionItem[] {
		const t = text();
		// Settings that only matter in some cases stay visible but turn off, so people see they exist
		const tabsOff = () => this.plugin.settings.tabPosition === 'hidden';
		const notBelow = () => this.plugin.settings.tabPosition !== 'below';
		return [
			{
				type: 'group',
				heading: t.headingTabs,
				items: [
					{
						name: t.tabPosition,
						desc: t.tabPositionDesc,
						control: {
							type: 'dropdown',
							key: 'tabPosition',
							defaultValue: DEFAULT_SETTINGS.tabPosition,
							options: { inline: t.positionInline, below: t.positionBelow, hidden: t.positionHidden },
						},
					},
					{
						name: t.showIcons,
						desc: t.showIconsDesc,
						control: { type: 'toggle', key: 'showIcons', defaultValue: DEFAULT_SETTINGS.showIcons, disabled: tabsOff },
					},
					{
						name: t.wrapTabs,
						desc: t.wrapTabsDesc,
						control: { type: 'toggle', key: 'wrapTabs', defaultValue: DEFAULT_SETTINGS.wrapTabs, disabled: notBelow },
					},
				],
			},
			{
				type: 'group',
				heading: t.headingKeepPlace,
				items: [
					{
						name: t.restoreViewState,
						desc: t.restoreViewStateDesc,
						control: { type: 'toggle', key: 'restoreViewState', defaultValue: DEFAULT_SETTINGS.restoreViewState },
					},
				],
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (key === 'tabPosition') {
			this.plugin.settings.tabPosition = parseTabPosition(value);
		} else if (key === 'showIcons' || key === 'wrapTabs' || key === 'restoreViewState') {
			this.plugin.settings[key] = value === true;
		} else {
			return;
		}
		await this.plugin.saveSettings();
		// Re-evaluate which settings are turned off
		if (key === 'tabPosition') this.update();
	}
}
