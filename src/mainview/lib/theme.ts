import { useSyncExternalStore } from "react";

export type ThemeSetting = "system" | "dark" | "light";
type Theme = { setting: ThemeSetting; resolved: "dark" | "light" };

const KEY = "agent-studio.theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set<() => void>();

function read(): ThemeSetting {
	try {
		const v = localStorage.getItem(KEY);
		if (v === "system" || v === "dark" || v === "light") return v;
	} catch {}
	return "dark";
}

function compute(setting: ThemeSetting): Theme {
	return { setting, resolved: setting === "system" ? (media.matches ? "dark" : "light") : setting };
}

let theme = compute(read());

export function applyTheme() {
	document.documentElement.classList.toggle("dark", theme.resolved === "dark");
	for (const l of listeners) l();
}

export function setTheme(setting: ThemeSetting) {
	try {
		localStorage.setItem(KEY, setting);
	} catch {}
	theme = compute(setting);
	applyTheme();
}

media.addEventListener("change", () => {
	if (theme.setting !== "system") return;
	theme = compute("system");
	applyTheme();
});

const subscribe = (cb: () => void) => {
	listeners.add(cb);
	return () => listeners.delete(cb);
};

export function useTheme() {
	return { ...useSyncExternalStore(subscribe, () => theme), setTheme };
}
