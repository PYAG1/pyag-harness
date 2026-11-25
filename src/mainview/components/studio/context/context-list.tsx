import { Button } from "@/components/ui/button";
import { AgentTag } from "@/components/studio/agent-tag";
import { type AgentFilter, CONTEXT_ICON, visibleAgents, visibleGroups } from "@/components/studio/context/context-rows";
import type { ContextRow } from "@/lib/mock-studio";
import { cn } from "@/lib/utils";

function Row({ row, filter, launched }: { row: ContextRow; filter: AgentFilter; launched: boolean }) {
	const Icon = CONTEXT_ICON[row.icon];
	return (
		<li
			className={cn(
				"group/ctx grid grid-cols-[16px_1fr_auto_52px] items-center gap-2 rounded-sm px-1 py-[7px] text-small hover:bg-surface-hover",
				row.opaque && "text-ink-faint",
			)}
		>
			<Icon className="size-3.5 text-muted-foreground" aria-hidden />
			<span className="min-w-0 truncate">
				<span className={cn(row.icon === "file" || row.icon === "skill" ? "font-mono text-code-sm" : undefined)}>
					{row.name}
				</span>
				{row.note && <span className="text-ink-faint"> · {row.note}</span>}
			</span>
			<span className="flex gap-1">
				{visibleAgents(filter).map((a) => (
					<AgentTag key={a.tag} tag={a.tag} active={row.agents.includes(a.tag)} />
				))}
			</span>
			<span className="relative text-right font-mono text-caption text-ink-faint">
				<span className="group-hover/ctx:invisible">{row.tokens}</span>
				{!row.opaque && (
					<Button
						variant="ghost"
						size="sm"
						className="invisible absolute inset-y-0 right-0 my-auto group-hover/ctx:visible"
						aria-label={`${launched ? "View" : "Remove"} ${row.name}`}
					>
						{launched ? "View" : "Remove"}
					</Button>
				)}
			</span>
		</li>
	);
}

export function ContextList({ filter, launched = true }: { filter: AgentFilter; launched?: boolean }) {
	return (
		<div className="flex flex-col gap-3">
			{visibleGroups(filter).map((g) => (
				<section key={g.label || "runtime"} aria-label={g.label || "Runtime"}>
					{g.label && <h3 className="px-1 pb-1 text-caption text-ink-faint">{g.label}</h3>}
					<ul>
						{g.rows.map((r) => (
							<Row key={r.id} row={r} filter={filter} launched={launched} />
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
