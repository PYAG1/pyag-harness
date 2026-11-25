import { Pencil, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RuntimeSelect } from "@/components/studio/runtime-select";
import { SettingRow } from "@/components/studio/settings/setting-row";
import { SortableList } from "@/components/studio/sortable-list";
import { TaskHeader, withGate } from "@/components/studio/task-header";
import { TASKS } from "@/lib/mock-data";
import { LIKELY_SKILLS, PLAN_STAGES, PLAN_STEPS } from "@/lib/mock-studio";
import { STAGES } from "@/lib/mock-task";
import { NotFound } from "@/screens/Placeholder";

const STAGES_AT_PLAN = withGate(STAGES, "Plan");

export function PlanReview() {
	const { id } = useParams();
	const navigate = useNavigate();
	const task = TASKS.find((t) => t.id === id);
	const [steps, setSteps] = useState(PLAN_STEPS);
	const [runtimes, setRuntimes] = useState(() => Object.fromEntries(PLAN_STAGES.map((s) => [s.stage, s.runtime])));

	if (!task) return <NotFound />;

	return (
		<main aria-label={`Plan for ${task.title}`} className="flex h-full min-w-0 flex-col">
			<TaskHeader
				title={task.title}
				status={{ state: "attention", label: "Plan · needs you" }}
				branch={`studio/${task.id}`}
				stages={STAGES_AT_PLAN}
				onOpenStage={(s) => s.name === "Define" && navigate(`/task/${task.id}/define`)}
			/>
			<div className="flex min-h-0 flex-1">
				<section aria-label="Plan" className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
					<h2 className="pb-3 text-title">Plan · {steps.length} steps</h2>
					<SortableList
						label="Plan steps"
						items={steps}
						onReorder={setSteps}
						itemLabel={(s) => s.title}
						rowClassName="grid grid-cols-[20px_24px_1fr_auto] items-start gap-2 border-b border-border py-3"
						renderItem={(s, i) => (
							<>
								<span className="pt-px font-mono text-code-sm text-ink-faint">{i + 1}</span>
								<div className="flex min-w-0 flex-col gap-0.5">
									<span className="font-medium">{s.title}</span>
									<span className="text-caption text-ink-faint">
										<code className="font-mono">{s.path}</code> · {s.check}
									</span>
								</div>
								<div className="flex items-center gap-1">
									{s.tag && <Badge variant="pill">{s.tag}</Badge>}
									<Button variant="ghost" size="icon-sm" aria-label={`Edit ${s.title}`}>
										<Pencil />
									</Button>
								</div>
							</>
						)}
					/>
				</section>
				<aside aria-label="Plan settings" className="flex w-[320px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-border px-5 py-5">
					<section className="flex flex-col">
						<h3 className="text-caption text-ink-faint">Who runs each stage</h3>
						{PLAN_STAGES.map((s) => (
							<SettingRow key={s.stage} label={s.stage} htmlFor={`stage-${s.stage}`}>
								<RuntimeSelect
									id={`stage-${s.stage}`}
									label={`${s.stage} runtime`}
									value={runtimes[s.stage]}
									onChange={(v) => setRuntimes((r) => ({ ...r, [s.stage]: v }))}
								/>
							</SettingRow>
						))}
					</section>
					<section className="flex flex-col gap-2">
						<h3 className="text-caption text-ink-faint">Skills likely to load</h3>
						<ul className="flex flex-col gap-2">
							{LIKELY_SKILLS.map((k) => (
								<li key={k.name} className="flex flex-col gap-0.5 text-small">
									<span className="flex items-center gap-1.5 font-mono text-code-sm">
										<Zap className="size-3.5 text-muted-foreground" aria-hidden />
										{k.name}
									</span>
									<span className="pl-5 text-caption text-ink-faint">{k.reason}</span>
								</li>
							))}
						</ul>
					</section>
				</aside>
			</div>
			<footer className="flex shrink-0 items-center gap-2 border-t border-border px-6 py-3">
				<span className="text-small text-muted-foreground">
					About 25 min · worktree <span className="font-mono text-code-sm">studio/{task.id}</span>
				</span>
				<span className="flex-1" />
				<Button variant="secondary" onClick={() => toast("Changes requested on plan")}>
					Request changes
				</Button>
				<Button
					onClick={() => {
						toast("Plan approved");
						navigate(`/task/${task.id}`);
					}}
				>
					Approve and build
				</Button>
			</footer>
		</main>
	);
}
