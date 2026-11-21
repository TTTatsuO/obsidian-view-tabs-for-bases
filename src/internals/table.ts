// Moving the selected cell of a table view with h j k l. The table handles the arrow keys in a
// keydown listener on its container and has no method for it, so this sends that listener the
// arrow key itself (checked on 1.15). Nothing here throws.

const VIM_KEYS: Record<string, string> = { h: 'ArrowLeft', j: 'ArrowDown', k: 'ArrowUp', l: 'ArrowRight' };

/**
 * For a keydown listener: when h, j, k or l is pressed while a table's cells have focus, move the
 * cell instead and return true. With Shift it extends the selection, as Shift with an arrow key
 * does. The table gives these letters no job of its own; while a cell's text is being edited,
 * focus is in the editor, so typing is left alone.
 */
export function handleVimKey(evt: KeyboardEvent): boolean {
	if (evt.defaultPrevented || evt.isComposing || evt.ctrlKey || evt.metaKey || evt.altKey) return false;
	// With Shift (or Caps Lock) the key is upper case
	const arrow = VIM_KEYS[evt.key.toLowerCase()];
	if (!arrow) return false;
	try {
		// The table's cells have focus when its container itself does (checked on 1.15)
		const target = evt.target as Node | null;
		if (!target?.instanceOf?.(HTMLElement) || !target.classList.contains('bases-table-container')) return false;
		evt.preventDefault();
		target.dispatchEvent(new KeyboardEvent('keydown', { key: arrow, shiftKey: evt.shiftKey, bubbles: true, cancelable: true }));
		return true;
	} catch {
		return false;
	}
}
