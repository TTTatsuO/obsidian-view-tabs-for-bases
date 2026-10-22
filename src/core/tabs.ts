// Pure logic, no Obsidian dependency.

/**
 * The key saved in each view config. To avoid clashing with other keys, all of this plugin's
 * values live under this one key, and only values that differ from the defaults are written.
 *   viewTabsForBases:
 *     show: false
 *     color: red
 *     size: large
 */
export const TAB_SETTINGS_KEY = 'viewTabsForBases';

export const TAB_COLORS = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'] as const;
export type TabColor = (typeof TAB_COLORS)[number];

export const TAB_SIZES = ['small', 'medium', 'large'] as const;
export type TabSize = (typeof TAB_SIZES)[number];
export const DEFAULT_TAB_SIZE: TabSize = 'medium';

export interface TabSettings {
	show: boolean;
	color: TabColor | null;
	size: TabSize;
}

export const DEFAULT_TAB_SETTINGS: TabSettings = { show: true, color: null, size: DEFAULT_TAB_SIZE };

function toTabColor(value: unknown): TabColor | null {
	return (TAB_COLORS as readonly unknown[]).includes(value) ? (value as TabColor) : null;
}

function toTabSize(value: unknown): TabSize {
	return (TAB_SIZES as readonly unknown[]).includes(value) ? (value as TabSize) : DEFAULT_TAB_SIZE;
}

/** Read saved settings. Unknown or broken values fall back to the defaults. */
export function parseTabSettings(raw: unknown): TabSettings {
	if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ...DEFAULT_TAB_SETTINGS };
	const record = raw as Record<string, unknown>;
	return {
		show: record.show !== false,
		color: toTabColor(record.color),
		size: toTabSize(record.size),
	};
}

/** Build the value to save, or null (remove the key) when everything is default. */
export function serializeTabSettings(settings: TabSettings): Record<string, unknown> | null {
	const result: Record<string, unknown> = {};
	if (!settings.show) result.show = false;
	if (settings.color) result.color = settings.color;
	if (settings.size !== DEFAULT_TAB_SIZE) result.size = settings.size;
	return Object.keys(result).length > 0 ? result : null;
}

/** A new array with the item at `from` moved to `to`. Unchanged if either index is out of range. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
	if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items.slice();
	const result = items.slice();
	const [moved] = result.splice(from, 1);
	result.splice(to, 0, moved as T);
	return result;
}
