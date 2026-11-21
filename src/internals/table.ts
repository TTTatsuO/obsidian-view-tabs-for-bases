import type { BasesController } from './bases';

// Moving the selected cell of a table view. The table handles the arrow keys in a keydown
// listener on its container and has no method for it, so the commands send that listener the
// arrow key itself (checked on 1.15). Nothing here throws.

export type CellDirection = 'up' | 'down' | 'left' | 'right';

const ARROW_KEYS: Record<CellDirection, string> = {
	up: 'ArrowUp',
	down: 'ArrowDown',
	left: 'ArrowLeft',
	right: 'ArrowRight',
};

/** The container of the table being shown, or null when the view isn't a table. */
function getTableContainer(controller: BasesController): HTMLElement | null {
	try {
		const view = (controller as unknown as { view?: { type?: unknown; containerEl?: unknown } | null }).view;
		if (view?.type !== 'table') return null;
		// instanceOf also works for elements in pop-out windows
		const el = view.containerEl as Node | undefined;
		return el?.instanceOf?.(HTMLElement) ? el : null;
	} catch {
		return null;
	}
}

/** Whether focus is in a text field, where the keys belong to the text rather than the table. */
function isTyping(el: HTMLElement): boolean {
	const active = el.doc.activeElement;
	if (!active?.instanceOf(HTMLElement)) return false;
	return active.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName);
}

/** Whether a cell can be moved now: a table is shown and no text is being edited. */
export function canMoveCell(controller: BasesController): boolean {
	const el = getTableContainer(controller);
	return el !== null && !isTyping(el);
}

/** Move the selected cell one step, as the arrow key would. Returns false if that isn't possible. */
export function moveCell(controller: BasesController, direction: CellDirection): boolean {
	const el = getTableContainer(controller);
	if (!el || isTyping(el)) return false;
	try {
		// Keep focus on the table so the selection shows and the real arrow keys carry on from here
		if (!el.contains(el.doc.activeElement)) el.focus({ preventScroll: true });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: ARROW_KEYS[direction], bubbles: true, cancelable: true }));
		return true;
	} catch {
		return false;
	}
}
