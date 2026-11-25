import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ShortcutTooltip } from "@/components/studio/shortcut-tooltip";
import { AgentOrb } from "@/components/studio/agents/agent-orb";
import type { Agent } from "@/lib/mock-task";

const agentLabel = (a: Agent) => (a.role ? `${a.name} · ${a.role}` : a.name);

export function AgentSwitcher({
	agents,
	value,
	onChange,
}: {
	agents: Agent[];
	value: string;
	onChange: (id: string) => void;
}) {
	const live = agents.filter((a) => a.state !== "done");
	const done = agents.length - live.length;
	const selected = agents.find((a) => a.id === value);

	return (
		<div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-raised py-1 pr-2.5 pl-1.5 whitespace-nowrap">
			<ToggleGroup
				type="single"
				value={value}
				onValueChange={(v) => v && onChange(v)}
				aria-label="Show agent"
				className="gap-1.5 bg-transparent p-0"
			>
				{live.map((a) => (
					<ShortcutTooltip key={a.id} label={agentLabel(a)}>
						<ToggleGroupItem value={a.id} aria-label={agentLabel(a)} className="size-7 p-0 data-[state=on]:bg-transparent">
							<AgentOrb agentId={a.id} family={a.family} size="switcher" state={a.state} selected={a.id === value} />
						</ToggleGroupItem>
					</ShortcutTooltip>
				))}
			</ToggleGroup>
			{done > 0 && <span className="pl-1 text-caption text-ink-faint">+{done} done</span>}
			{selected && <span className="pl-1 text-small font-medium">{selected.name}</span>}
		</div>
	);
}
