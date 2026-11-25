import { PanelRightOpen } from "lucide-react";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { AgentSwitcher } from "@/components/studio/agents/agent-switcher";
import { Composer } from "@/components/studio/composer";
import { ShortcutTooltip } from "@/components/studio/shortcut-tooltip";
import { TaskHeader, withGate } from "@/components/studio/task-header";
import { TaskViewToggle } from "@/components/studio/task-view-toggle";
import { type PanelTab, TaskPanel } from "@/components/studio/task-panel";
import { AgentMessage, UserMessage } from "@/components/studio/thread/message";
import { SkillMarker } from "@/components/studio/thread/skill-marker";
import { SubagentCard } from "@/components/studio/thread/subagent-card";
import { LimitHandoff } from "@/components/studio/thread/limit-handoff";
import { ToolStep } from "@/components/studio/thread/tool-step";
import { NARROW, useMediaQuery } from "@/hooks/use-media-query";
import { TASKS } from "@/lib/mock-data";
import { AGENTS, ROOT_AGENT, STAGES, THREAD, type ThreadItem, agentById } from "@/lib/mock-task";
import { useShortcut } from "@/lib/shortcuts";
import { NotFound } from "@/screens/Placeholder";

const visibleFor = (item: ThreadItem, agent: string) =>
	agent === ROOT_AGENT.id || ("agentId" in item && item.agentId === agent);

function ThreadItemView({ item, onOpenTab }: { item: ThreadItem; onOpenTab: (t: PanelTab) => void }) {
	switch (item.kind) {
		case "user":
			return <UserMessage text={item.text} />;
		case "agent":
			return <AgentMessage agent={agentById(item.agentId)} time={item.time} text={item.text} />;
		case "tool":
			return <ToolStep {...item} />;
		case "skill":
			return (
				<SkillMarker
					skill={item.skill}
					reason={item.reason}
					pickedByAgent={item.pickedByAgent}
					onView={() => onOpenTab("context")}
				/>
			);
		case "subagent":
			return <SubagentCard item={item} agent={agentById(item.agentId)} />;
	}
}

export function TaskBuild() {
	const { id } = useParams();
	const task = TASKS.find((t) => t.id === id);
	const narrow = useMediaQuery(NARROW);
	const [docked, setDocked] = useState(true);
	const [sheet, setSheet] = useState(false);
	const panelOpen = narrow ? sheet : docked;
	const setPanelOpen = narrow ? setSheet : setDocked;
	const [params] = useSearchParams();
	const [tab, setTab] = useState<PanelTab>(() => {
		const panel = params.get("panel");
		return panel === "context" || panel === "session" || panel === "checks" ? panel : "changes";
	});
	const [agent, setAgent] = useState(ROOT_AGENT.id);

	useShortcut("togglePanel", () => setPanelOpen(!panelOpen));

	if (!task) return <NotFound />;
	const failed = task.status === "failed";

	const openTab = (t: PanelTab) => {
		setTab(t);
		setPanelOpen(true);
	};

	const main = (
		<main aria-label={task.title} className="flex h-full min-w-0 flex-col">
			<TaskHeader
				title={task.title}
				status={failed ? { state: "failed", label: "Stopped · usage limit" } : { state: "running", label: "Running · 4m" }}
				branch="studio/t-31"
				stages={failed ? withGate(STAGES, "Build") : STAGES}
				onOpenStage={() => openTab("session")}
				view={!failed && <TaskViewToggle taskId={task.id} value="thread" />}
			>
				{!failed && AGENTS.length > 1 && <AgentSwitcher agents={AGENTS} value={agent} onChange={setAgent} />}
				{!panelOpen && (
					<ShortcutTooltip label="Open panel" shortcut="togglePanel">
						<Button variant="ghost" size="icon" aria-label="Open panel" onClick={() => setPanelOpen(true)}>
							<PanelRightOpen />
						</Button>
					</ShortcutTooltip>
				)}
			</TaskHeader>
			<div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
				<div className="mx-auto flex max-w-[760px] flex-col gap-5 px-5 py-6">
					{failed ? (
						<>
							<UserMessage text={task.title} />
							<AgentMessage
								agent={ROOT_AGENT}
								time="13:12"
								text="Registered the passkey routes and the WebAuthn challenge store. Moving the session store next."
							/>
							<LimitHandoff onContinue={(o) => toast(o === "wait" ? "Waiting for reset at 14:00" : "Continuing in Codex")} />
						</>
					) : (
						THREAD.filter((item) => visibleFor(item, agent)).map((item) => (
							<ThreadItemView key={item.id} item={item} onOpenTab={openTab} />
						))
					)}
				</div>
			</div>
			<div className="flex shrink-0 justify-center px-5 pb-4">
				<Composer running={!failed} />
			</div>
		</main>
	);

	const panel = <TaskPanel tab={tab} onTabChange={setTab} onCollapse={() => setPanelOpen(false)} />;

	if (narrow) {
		return (
			<>
				{main}
				<Sheet open={sheet} onOpenChange={setSheet}>
					<SheetContent side="right" className="w-[min(560px,90vw)] p-0 sm:max-w-none [&>button]:hidden">
						<SheetTitle className="sr-only">Task panel</SheetTitle>
						<SheetDescription className="sr-only">Changes, context, session and checks.</SheetDescription>
						{panel}
					</SheetContent>
				</Sheet>
			</>
		);
	}

	return (
		<ResizablePanelGroup orientation="horizontal" className="h-full">
			<ResizablePanel id="thread" minSize="50%">
				{main}
			</ResizablePanel>
			{panelOpen && (
				<>
					<ResizableHandle />
					<ResizablePanel id="panel" defaultSize="40%" minSize="32%" maxSize="50%">
						{panel}
					</ResizablePanel>
				</>
			)}
		</ResizablePanelGroup>
	);
}
