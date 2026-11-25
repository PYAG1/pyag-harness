import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { AgentLanes } from "@/components/studio/agents/agent-lanes";
import { AgentOrb } from "@/components/studio/agents/agent-orb";
import { Meter } from "@/components/studio/meter";
import { StatusBadge } from "@/components/studio/status-dot";
import { TaskHeader } from "@/components/studio/task-header";
import { TaskViewToggle } from "@/components/studio/task-view-toggle";
import { SubagentCard } from "@/components/studio/thread/subagent-card";
import { TASKS } from "@/lib/mock-data";
import { CLAUDE, CODEX, LANE_MINUTES, LANE_NOW, LANES } from "@/lib/mock-studio";
import { STAGES, THREAD, type ThreadItem, agentById } from "@/lib/mock-task";
import { NotFound } from "@/screens/Placeholder";

const SUMMARY = [
	{ agent: CODEX, runtime: "Codex · GPT · High", status: { state: "idle" as const, label: "Done" }, usage: "3m 30s · 18 tools", context: 42 },
	{ agent: CLAUDE, runtime: "Claude Code · Opus · High", status: { state: "running" as const, label: "Running" }, usage: "5m 18s · 31 tools", context: 81 },
];

const SUBAGENTS = THREAD.filter((t): t is Extract<ThreadItem, { kind: "subagent" }> => t.kind === "subagent");

export function TaskAgents() {
	const { id } = useParams();
	const navigate = useNavigate();
	const task = TASKS.find((t) => t.id === id);
	const [focus, setFocus] = useState<string | null>(null);
	if (!task) return <NotFound />;

	return (
		<main aria-label={`Agents on ${task.title}`} className="flex h-full min-w-0 flex-col">
			<TaskHeader
				title={task.title}
				status={{ state: "running", label: "Running · 4m" }}
				branch="studio/t-31"
				stages={STAGES}
				onOpenStage={() => navigate(`/task/${task.id}?panel=session`)}
				view={<TaskViewToggle taskId={task.id} value="agents" />}
			/>
			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="mx-auto flex max-w-[960px] flex-col gap-8 px-6 py-6">
					<section aria-label="Agents" className="grid gap-3 sm:grid-cols-2">
						{SUMMARY.map((s) => (
							<div key={s.agent.id} className="flex flex-col gap-3 rounded-lg border border-border bg-sidebar p-4">
								<div className="flex items-center gap-2">
									<AgentOrb agentId={s.agent.id} family={s.agent.family} size="switcher" state={s.agent.state} />
									<div className="flex min-w-0 flex-1 flex-col">
										<span className="font-medium">
											{s.agent.name} <span className="font-normal text-muted-foreground">{s.agent.role}</span>
										</span>
										<span className="truncate text-caption text-ink-faint">{s.runtime}</span>
									</div>
									<StatusBadge state={s.status.state}>{s.status.label}</StatusBadge>
								</div>
								<span className="font-mono text-code-sm text-muted-foreground">{s.usage}</span>
								<Meter label="Context" pct={s.context} />
							</div>
						))}
					</section>

					<section aria-label="Timeline" className="flex flex-col gap-2">
						<h2 className="text-title">Timeline</h2>
						<AgentLanes lanes={LANES} minutes={LANE_MINUTES} now={LANE_NOW} onSelect={(laneId) => {
							setFocus(laneId);
							document.getElementById(`sub-${laneId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
						}} />
					</section>

					<section aria-label="Subagents" className="flex flex-col gap-2">
						<div className="flex items-baseline gap-2">
							<h2 className="text-title">Subagents · {SUBAGENTS.length}</h2>
							<span className="text-caption text-ink-faint">1 editor at a time · 3 run in parallel</span>
						</div>
						<div className="flex flex-col gap-2">
							{SUBAGENTS.map((s) => (
								<div key={s.id} id={`sub-${s.id}`} className={focus === s.id ? "rounded-lg ring-2 ring-ring" : undefined}>
									<SubagentCard item={s} agent={agentById(s.agentId)} />
								</div>
							))}
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}
