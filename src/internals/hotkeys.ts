import type { App } from 'obsidian';

// Opening Settings → Hotkeys has no public API. This does what Obsidian's own plugin list does
// for its hotkeys button: open the "hotkeys" tab and search for the plugin id (checked on 1.15).

interface SettingModal {
	openTabById(id: string): unknown;
}

interface HotkeysTab {
	setQuery(query: string): void;
}

/** Show Settings → Hotkeys filtered to a plugin's commands. Call while the settings are open. Returns false if that fails. */
export function openHotkeysFor(app: App, pluginId: string): boolean {
	try {
		const setting = (app as unknown as { setting?: Partial<SettingModal> }).setting;
		if (typeof setting?.openTabById !== 'function') return false;
		const tab = setting.openTabById('hotkeys') as Partial<HotkeysTab> | null | undefined;
		if (typeof tab?.setQuery === 'function') tab.setQuery(pluginId);
		return true;
	} catch {
		return false;
	}
}
