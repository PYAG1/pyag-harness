import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { DotState } from "@/lib/status";
import { cn } from "@/lib/utils";

export type { DotState };

const DOT: Record<DotState, string> = {
	idle: "bg-ink-faint",
	running: "bg-status-running animate-[status-pulse_1.4s_ease-in-out_infinite]",
	attention: "bg-status-attention",
	ready: "bg-status-ready",
	failed: "bg-status-failed",
};

const TEXT: Partial<Record<DotState, string>> = {
	attention: "text-status-attention",
	failed: "text-remove",
};

export function StatusDot({ state }: { state: DotState }) {
	return <span aria-hidden className={cn("inline-block size-2 shrink-0 rounded-full", DOT[state])} />;
}

export function StatusBadge({
	state,
	children,
	className,
}: {
	state: DotState;
	children: ReactNode;
	className?: string;
}) {
	return (
		<Badge variant="status" className={cn(TEXT[state], className)}>
			<StatusDot state={state} />
			{children}
		</Badge>
	);
}
