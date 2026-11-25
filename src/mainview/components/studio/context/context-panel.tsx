import { useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ContextHeatmap } from "@/components/studio/context/context-heatmap";
import { ContextList } from "@/components/studio/context/context-list";
import type { AgentFilter } from "@/components/studio/context/context-rows";
import { Meter } from "@/components/studio/meter";
import { AGENT_TAGS, METERS } from "@/lib/mock-studio";

export function ContextPanel() {
	const [filter, setFilter] = useState<AgentFilter>("all");
	const [view, setView] = useState<"list" | "graph">("list");

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex flex-wrap items-center gap-2">
				<h2 className="text-title">Context</h2>
				<span className="flex-1" />
				<ToggleGroup
					type="single"
					value={filter}
					onValueChange={(v) => v && setFilter(v as AgentFilter)}
					aria-label="Filter by agent"
				>
					<ToggleGroupItem value="all">All</ToggleGroupItem>
					{AGENT_TAGS.map((a) => (
						<ToggleGroupItem key={a.tag} value={a.tag}>
							{a.name}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				<ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as "list" | "graph")} aria-label="View">
					<ToggleGroupItem value="list">List</ToggleGroupItem>
					<ToggleGroupItem value="graph">Graph</ToggleGroupItem>
				</ToggleGroup>
			</div>
			<div className="flex flex-col gap-1.5">
				{METERS.filter((m) => filter === "all" || m.tag === filter).map((m) => (
					<Meter key={m.tag} label={m.name} pct={m.pct} />
				))}
			</div>
			{view === "list" ? <ContextList filter={filter} /> : <ContextHeatmap filter={filter} />}
		</div>
	);
}
