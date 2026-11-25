import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Lane, LaneBar } from "@/lib/mock-studio";
import { cn } from "@/lib/utils";

const BAR: Record<LaneBar["state"], string> = {
	done: "lane-bar",
	running: "lane-bar lane-bar--running",
	failed: "lane-bar lane-bar--failed",
	waiting: "lane-bar lane-bar--waiting",
};

const STATE_LABEL: Record<LaneBar["state"], string> = {
	done: "Done",
	running: "Running",
	failed: "Failed",
	waiting: "Waiting at gate",
};

const fmt = (min: number) => {
	const m = Math.floor(min);
	const s = Math.round((min - m) * 60);
	return m ? `${m}m${s ? ` ${s}s` : ""}` : `${s}s`;
};

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

function LaneLabel({ lane }: { lane: Lane }) {
	if (!lane.child) return <span className="truncate text-foreground">{lane.label}</span>;
	return (
		<span className="truncate pl-4 text-muted-foreground">
			└ <span className="font-mono text-foreground">{lane.type}</span> {lane.label}
		</span>
	);
}

export function AgentLanes({
	lanes,
	minutes,
	now,
	onSelect,
	compact = false,
}: {
	lanes: Lane[];
	minutes: number;
	now?: number;
	onSelect?: (laneId: string) => void;
	compact?: boolean;
}) {
	const ticks = Array.from({ length: Math.floor(minutes / 2) + 1 }, (_, i) => i * 2);

	return (
		<figure className="flex flex-col" aria-label="Agent timeline">
			{lanes.map((lane) => (
				<div key={lane.id} className={cn("grid h-7 items-center text-caption", compact ? "grid-cols-[120px_1fr]" : "grid-cols-[170px_1fr]")}>
					<LaneLabel lane={lane} />
					<div className="lane-track">
						{lane.spawnAt !== undefined && <span className="lane-spawn" style={{ left: pct(lane.spawnAt, minutes) }} />}
						{lane.bars.map((bar, i) => (
							<Tooltip key={i}>
								<TooltipTrigger asChild>
									<button
										type="button"
										className={BAR[bar.state]}
										style={{ left: pct(bar.start, minutes), width: pct(bar.end - bar.start, minutes) }}
										aria-label={`${lane.type ?? ""} ${lane.label}: ${STATE_LABEL[bar.state]}, ${fmt(bar.end - bar.start)}`}
										onClick={() => onSelect?.(lane.id)}
									/>
								</TooltipTrigger>
								<TooltipContent>
									{lane.type ? `${lane.type} · ${lane.label}` : lane.label} · {STATE_LABEL[bar.state].toLowerCase()} ·{" "}
									{fmt(bar.end - bar.start)}
								</TooltipContent>
							</Tooltip>
						))}
						{now !== undefined && <span className="lane-now" style={{ left: pct(now, minutes) }} aria-hidden />}
					</div>
				</div>
			))}
			{!compact && (
				<>
					<div className="grid grid-cols-[170px_1fr] pt-1">
						<span />
						<div className="relative h-4 font-mono text-micro text-ink-faint">
							{ticks.map((t) => (
								<span key={t} className="absolute -translate-x-1/2 first:translate-x-0" style={{ left: pct(t, minutes) }}>
									{t}m
								</span>
							))}
						</div>
					</div>
					<figcaption className="flex flex-wrap items-center gap-4 pt-3 text-caption text-ink-faint">
						<span className="flex items-center gap-1.5">
							<span className="h-2.5 w-4 rounded-[3px] bg-muted-foreground" /> Done
						</span>
						<span className="flex items-center gap-1.5">
							<span className="h-2.5 w-4 rounded-[3px] bg-status-running" /> Running
						</span>
						<span className="flex items-center gap-1.5">
							<span className="h-2.5 w-4 rounded-[3px] bg-status-failed" /> Failed
						</span>
						<span className="flex items-center gap-1.5">
							<span className="h-2.5 w-4 rounded-[3px] border border-status-attention" /> Waiting at gate
						</span>
						<span className="flex items-center gap-1.5">
							<span className="h-3 border-l border-dashed border-border-control" /> Spawned
						</span>
						<span className="flex items-center gap-1.5">
							<span className="h-3 border-l-[1.5px] border-ring" /> Now
						</span>
					</figcaption>
				</>
			)}
		</figure>
	);
}
