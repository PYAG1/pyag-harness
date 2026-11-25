import { House, ListTodo, Network, Settings, Zap, type LucideIcon } from "lucide-react";
import { NavLink, useMatch } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { ShortcutTooltip } from "@/components/studio/shortcut-tooltip";
import type { ShortcutId } from "@/lib/shortcuts";

type RailItem = { to: string; label: string; icon: LucideIcon; shortcut: ShortcutId; end?: boolean };

export const RAIL_ITEMS: RailItem[] = [
	{ to: "/", label: "Home", icon: House, shortcut: "home", end: true },
	{ to: "/inbox", label: "Tasks", icon: ListTodo, shortcut: "tasks" },
	{ to: "/agents", label: "Agents", icon: Network, shortcut: "agents" },
	{ to: "/vault", label: "Vault", icon: Zap, shortcut: "vault" },
];

const SETTINGS_ITEM: RailItem = { to: "/settings", label: "Settings", icon: Settings, shortcut: "settings" };

function RailButton({ item: { to, label, icon: Icon, shortcut, end } }: { item: RailItem }) {
	const isActive = !!useMatch({ path: to, end: !!end });
	return (
		<ShortcutTooltip label={label} shortcut={shortcut} side="right">
			<NavLink
				to={to}
				end={end}
				aria-label={label}
				className={buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "icon", className: "app-no-drag" })}
			>
				<Icon />
			</NavLink>
		</ShortcutTooltip>
	);
}

export function Rail() {
	return (
		<nav
			aria-label="Main"
			className="relative z-20 flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar pb-3"
		>
			<div className="app-drag h-7 w-full shrink-0" />
			{RAIL_ITEMS.map((item) => (
				<RailButton key={item.to} item={item} />
			))}
			<div className="flex-1" />
			<RailButton item={SETTINGS_ITEM} />
			<Avatar className="mt-1 size-7" role="img" aria-label="Signed in as PA">
				<AvatarFallback aria-hidden>PA</AvatarFallback>
			</Avatar>
		</nav>
	);
}
