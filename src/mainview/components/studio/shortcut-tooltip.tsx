import type { ComponentProps, ReactElement } from "react";

import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SHORTCUTS, type ShortcutId } from "@/lib/shortcuts";

export function ShortcutTooltip({
	label,
	shortcut,
	side,
	children,
}: {
	label: string;
	shortcut?: ShortcutId;
	side?: ComponentProps<typeof TooltipContent>["side"];
	children: ReactElement;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent side={side}>
				{label}
				{shortcut && <Kbd>{SHORTCUTS[shortcut].label}</Kbd>}
			</TooltipContent>
		</Tooltip>
	);
}
