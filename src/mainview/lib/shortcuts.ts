import { useEffect, useRef } from "react";

export const SHORTCUTS = {
	home: { key: "1", label: "⌘1" },
	tasks: { key: "2", label: "⌘2" },
	agents: { key: "3", label: "⌘3" },
	vault: { key: "4", label: "⌘4" },
	settings: { key: ",", label: "⌘," },
	newTask: { key: "n", label: "⌘N" },
	togglePanel: { key: "j", label: "⌘J" },
	toggleSidebar: { label: "⌘\\" },
	run: { label: "⌘↵" },
	requestChanges: { key: "enter", label: "⌘↵" },
	attach: { label: "@" },
} as const satisfies Record<string, { key?: string; label: string }>;

export type ShortcutId = keyof typeof SHORTCUTS;

const handlers = new Map<string, () => void>();

function onKeyDown(e: KeyboardEvent) {
	if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
	if (e.key === "Enter" && isTyping(e.target)) return;
	const handler = handlers.get(e.key.toLowerCase());
	if (!handler) return;
	e.preventDefault();
	handler();
}

const isTyping = (el: EventTarget | null) =>
	el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export function useKeys(bindings: Record<string, () => void>, enabled = true) {
	const latest = useRef(bindings);
	latest.current = bindings;

	useEffect(() => {
		if (!enabled) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
			const handler = latest.current[e.key];
			if (!handler) return;
			e.preventDefault();
			handler();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [enabled]);
}

export function useShortcut(id: ShortcutId, handler: () => void) {
	const latest = useRef(handler);
	latest.current = handler;

	useEffect(() => {
		const key = (SHORTCUTS[id] as { key?: string }).key;
		if (!key) return;
		if (handlers.size === 0) window.addEventListener("keydown", onKeyDown);
		handlers.set(key, () => latest.current());
		return () => {
			handlers.delete(key);
			if (handlers.size === 0) window.removeEventListener("keydown", onKeyDown);
		};
	}, [id]);
}
