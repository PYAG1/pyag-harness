import type { CSSProperties } from "react";

import { type AgentFamily, type OrbState, pickPalette } from "@/lib/orb-palette";
import { cn } from "@/lib/utils";

type Props = {
	agentId: string;
	family: AgentFamily;
	size?: "avatar" | "switcher";
	state?: OrbState;
	selected?: boolean;
	label?: string;
	className?: string;
};

export function AgentOrb({
	agentId,
	family,
	size = "avatar",
	state = "idle",
	selected,
	label,
	className,
}: Props) {
	const [o1, o2, o3, o4] = pickPalette(family, agentId);
	const style = { "--o1": o1, "--o2": o2, "--o3": o3, "--o4": o4 } as CSSProperties;

	return (
		<span
			className={cn(
				"orb",
				size === "avatar" ? "orb--xxs" : "orb--2xs",
				state === "running" && "orb--running",
				state === "done" && "orb--done",
				state === "queued" && "orb--queued",
				selected && "orb--selected",
				className,
			)}
			style={style}
			{...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
		>
			<span className="orb__fill">
				<i />
				<i />
				<i />
			</span>
			{(state === "attention" || state === "failed") && (
				<span className={cn("orb__dot", `orb__dot--${state}`)} />
			)}
		</span>
	);
}
