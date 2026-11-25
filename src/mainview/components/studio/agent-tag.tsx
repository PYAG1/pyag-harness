import type { AgentTagId } from "@/lib/mock-studio";
import { cn } from "@/lib/utils";

export function AgentTag({ tag, active = true, className }: { tag: string; active?: boolean; className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex h-4 items-center rounded-sm border px-1 font-mono text-micro",
				active ? "border-border-control text-foreground" : "border-border-strong text-ink-faint",
				className,
			)}
		>
			{tag}
		</span>
	);
}

export type { AgentTagId };
