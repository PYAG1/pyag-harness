import { Ban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AgentOrb } from "@/components/studio/agents/agent-orb";
import { StatusBadge } from "@/components/studio/status-dot";
import type { Agent, ThreadItem } from "@/lib/mock-task";
import type { OrbState } from "@/lib/orb-palette";
import { cn } from "@/lib/utils";

type Subagent = Extract<ThreadItem, { kind: "subagent" }>;

const STATES: Record<Subagent["state"], { orb: OrbState; badge?: string }> = {
	running: { orb: "running", badge: "Running" },
	returned: { orb: "done" },
	queued: { orb: "queued", badge: "Queued" },
	"not-started": { orb: "idle" },
};

function VerifyPill({ verified }: { verified: boolean }) {
	return (
		<Badge
			variant="pill"
			className={verified ? "border-add text-add" : "border-status-attention text-status-attention"}
		>
			{verified ? "Verified" : "Unverified"}
		</Badge>
	);
}

function HeaderStatus({ item }: { item: Subagent }) {
	if (item.state === "returned") return <VerifyPill verified={!!item.verified} />;
	if (item.state === "not-started")
		return (
			<Badge variant="status" className="text-remove">
				Not started
			</Badge>
		);
	const badge = STATES[item.state].badge!;
	return <StatusBadge state={item.state === "running" ? "running" : "idle"}>{badge}</StatusBadge>;
}

export function SubagentCard({ item, agent }: { item: Subagent; agent: Agent }) {
	const notStarted = item.state === "not-started";

	return (
		<Collapsible
			defaultOpen={notStarted}
			className={cn(
				"group/card rounded-lg border border-border bg-background",
				item.state === "queued" && "opacity-70",
				notStarted && "border-dashed",
			)}
		>
			<CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-small data-[state=open]:rounded-b-none data-[state=open]:border-b data-[state=open]:border-border">
				<CollapsibleChevron className="text-muted-foreground" />
				{notStarted ? (
					<Ban className="size-4 shrink-0 text-remove" aria-hidden />
				) : (
					<AgentOrb agentId={agent.id} family={agent.family} state={STATES[item.state].orb} />
				)}
				<span className="font-mono text-caption text-foreground">{item.type}</span>
				<span className="min-w-0 flex-1 truncate text-muted-foreground">{item.brief}</span>
				<HeaderStatus item={item} />
				<span className="shrink-0 font-mono text-caption text-ink-faint">{item.meta}</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="px-3 pt-2 pb-3">
				{notStarted ? (
					<p className="text-small text-muted-foreground">
						{item.reason} <Button variant="link">View rule</Button>
					</p>
				) : (
					<div className="flex flex-col gap-2">
						{item.steps ? (
							<ul className="ml-[7px] border-l border-border-strong pl-3 text-caption leading-[22px] text-muted-foreground">
								{item.steps.map((s) => (
									<li key={s}>{s}</li>
								))}
							</ul>
						) : (
							<p className="text-caption text-ink-faint">
								{item.state === "running" ? "Working…" : "Steps not reported by runtime."}
							</p>
						)}
						{item.report && (
							<div className="rounded-md bg-surface-raised px-3 py-2 text-small">
								<div className="mb-1 flex items-center gap-2">
									<span className="font-medium">Report</span>
									<VerifyPill verified={!!item.verified} />
									<span className="flex-1" />
									<Button variant="link" className="text-caption">
										Open full report
									</Button>
								</div>
								<p className="text-muted-foreground">{item.report}</p>
							</div>
						)}
					</div>
				)}
			</CollapsibleContent>
		</Collapsible>
	);
}
