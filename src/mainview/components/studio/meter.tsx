import { cn } from "@/lib/utils";

export function Meter({ label, pct, warnAt = 75 }: { label: string; pct: number; warnAt?: number }) {
	const warn = pct > warnAt;
	return (
		<div className="grid grid-cols-[96px_1fr_40px] items-center gap-3 text-small">
			<span className="truncate text-muted-foreground">{label}</span>
			<div
				role="meter"
				aria-label={label}
				aria-valuenow={pct}
				aria-valuemin={0}
				aria-valuemax={100}
				className="h-[3px] overflow-hidden rounded-sm bg-surface-raised"
			>
				<div className={cn("h-full rounded-sm", warn ? "bg-status-attention" : "bg-foreground")} style={{ width: `${pct}%` }} />
			</div>
			<span className={cn("text-right font-mono text-code-sm", warn ? "text-status-attention" : "text-muted-foreground")}>
				{pct}%
			</span>
		</div>
	);
}
