import { Fragment } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type AgentFilter, CONTEXT_ICON, visibleAgents, visibleGroups } from "@/components/studio/context/context-rows";
import { type AgentTagId, COMPACTED_BEFORE, type ContextRow, HEAT_STEPS } from "@/lib/mock-studio";
import { cn } from "@/lib/utils";

const TOKENS_PER_LEVEL = ["0", "300", "700", "1.2k", "2k"];

function Cells({
	row,
	tag,
	name,
	onSelectStep,
}: {
	row: ContextRow;
	tag: AgentTagId;
	name: string;
	onSelectStep?: (tag: AgentTagId, step: number) => void;
}) {
	const levels = row.heat[tag] ?? [];
	return (
		<div className="flex gap-[3px]">
			{Array.from({ length: HEAT_STEPS[tag] }, (_, i) => {
				const level = levels[i] ?? 0;
				return (
					<Fragment key={i}>
						{COMPACTED_BEFORE[tag] === i && <span className="hm-compact" aria-hidden />}
						{row.opaque ? (
							<span className="hm-cell hm-cell--opaque" aria-hidden />
						) : (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										className="hm-cell"
										data-l={level || undefined}
										aria-label={`${name} · step ${i + 1} · ${TOKENS_PER_LEVEL[level]} tokens`}
										onClick={() => onSelectStep?.(tag, i + 1)}
									>
										{level > 0 && <i />}
									</button>
								</TooltipTrigger>
								<TooltipContent>
									{name} · step {i + 1} · {TOKENS_PER_LEVEL[level]} tokens
								</TooltipContent>
							</Tooltip>
						)}
					</Fragment>
				);
			})}
		</div>
	);
}

function Legend() {
	return (
		<div className="flex flex-wrap items-center gap-4 pt-2 text-caption text-ink-faint">
			<span className="flex items-center gap-[3px]">
				Less
				{[1, 2, 3, 4].map((l) => (
					<span key={l} className="hm-cell" data-l={l}>
						<i />
					</span>
				))}
				More
			</span>
			<span className="flex items-center gap-1.5">
				<span className="hm-compact m-0 h-3.5" aria-hidden />
				Compacted
			</span>
			<span className="flex items-center gap-1.5">
				<span className="hm-cell hm-cell--opaque" aria-hidden />
				Not visible
			</span>
		</div>
	);
}

export function ContextHeatmap({
	filter,
	onSelectStep,
}: {
	filter: AgentFilter;
	onSelectStep?: (tag: AgentTagId, step: number) => void;
}) {
	const agents = visibleAgents(filter);
	const groups = visibleGroups(filter);

	return (
		<div className="flex flex-col gap-1 overflow-x-auto">
			<div className="grid grid-cols-[16px_minmax(120px,200px)_auto] items-end gap-2 px-1 pb-1">
				<span />
				<span />
				<div className="flex gap-2.5">
					{agents.map((a) => (
						<span
							key={a.tag}
							className="truncate text-caption text-muted-foreground"
							style={{ width: HEAT_STEPS[a.tag] * 17 - 3 }}
						>
							{a.name}
						</span>
					))}
				</div>
			</div>
			{groups.map((g) => (
				<section key={g.label || "runtime"} aria-label={g.label || "Runtime"}>
					{g.label && <h3 className="px-1 pt-2 pb-1 text-caption text-ink-faint">{g.label}</h3>}
					<ul>
						{g.rows.map((row) => {
							const Icon = CONTEXT_ICON[row.icon];
							return (
								<li
									key={row.id}
									className="grid grid-cols-[16px_minmax(120px,200px)_auto] items-center gap-2 rounded-sm px-1 py-[5px] text-small"
								>
									<Icon className="size-3.5 text-muted-foreground" aria-hidden />
									<span className={cn("truncate", row.opaque && "text-ink-faint")}>{row.name}</span>
									<div className="flex gap-2.5">
										{agents.map((a) => (
											<Cells key={a.tag} row={row} tag={a.tag} name={a.name} onSelectStep={onSelectStep} />
										))}
									</div>
								</li>
							);
						})}
					</ul>
				</section>
			))}
			<Legend />
		</div>
	);
}
