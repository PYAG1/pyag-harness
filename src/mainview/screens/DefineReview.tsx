import { CircleAlert, CircleCheck, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionBar } from "@/components/studio/session/session-files";
import { TaskHeader, withGate } from "@/components/studio/task-header";
import { TASKS } from "@/lib/mock-data";
import { DEFINE_CHECKS, DEFINE_SECTIONS, SESSION_FILES, type Unknown } from "@/lib/mock-studio";
import { STAGES } from "@/lib/mock-task";
import { cn } from "@/lib/utils";
import { NotFound } from "@/screens/Placeholder";

const STAGES_AT_DEFINE = withGate(STAGES, "Define");
const TASK_MD = SESSION_FILES.find((f) => f.name === "task.md");

function UnknownRow({ unknown }: { unknown: Unknown }) {
	const [answer, setAnswer] = useState("");
	return (
		<li className="flex flex-col gap-2 border-b border-border py-2.5 last:border-b-0">
			<div className="flex items-start gap-2">
				<span className="flex-1 text-small">{unknown.text}</span>
				<Badge
					variant="pill"
					className={cn(unknown.action === "ask" && "border-status-attention text-status-attention")}
				>
					{unknown.label}
				</Badge>
			</div>
			{unknown.action === "ask" && (
				<Input
					value={answer}
					onChange={(e) => setAnswer(e.target.value)}
					placeholder="Answer"
					aria-label={`Answer: ${unknown.text}`}
				/>
			)}
		</li>
	);
}

export function DefineReview() {
	const { id } = useParams();
	const navigate = useNavigate();
	const task = TASKS.find((t) => t.id === id);
	if (!task) return <NotFound />;

	return (
		<main aria-label={`Define ${task.title}`} className="flex h-full min-w-0 flex-col">
			<TaskHeader
				title={task.title}
				status={{ state: "attention", label: "Define · needs you" }}
				branch={`studio/${task.id}`}
				stages={STAGES_AT_DEFINE}
				onOpenStage={(s) => s.name === "Plan" && navigate(`/task/${task.id}/plan`)}
			/>
			<div className="flex min-h-0 flex-1">
				<article aria-label="task.md" className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
					<ol className="flex max-w-[680px] flex-col gap-5">
						{DEFINE_SECTIONS.map((s, i) => (
							<li key={s.id} className="grid grid-cols-[28px_1fr] gap-1">
								<span className="pt-px font-mono text-code-sm text-ink-faint">{i + 1}</span>
								<div className="flex flex-col gap-1">
									<h3 className="text-body font-semibold">{s.title}</h3>
									{s.body && <p className="text-muted-foreground">{s.body}</p>}
									{s.unknowns && (
										<ul className="flex flex-col">
											{s.unknowns.map((u) => (
												<UnknownRow key={u.id} unknown={u} />
											))}
										</ul>
									)}
								</div>
							</li>
						))}
					</ol>
				</article>
				<aside aria-label="Before planning" className="flex w-[300px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-border px-5 py-5">
					{TASK_MD?.sections && (
						<section className="flex flex-col gap-2">
							<h3 className="text-caption text-ink-faint">task.md · {TASK_MD.meta}</h3>
							<SectionBar sections={TASK_MD.sections} />
						</section>
					)}
					<section className="flex flex-col gap-2">
						<h3 className="text-caption text-ink-faint">Before planning</h3>
						<ul className="flex flex-col gap-1.5">
							{DEFINE_CHECKS.map((c) => (
								<li key={c.text} className="flex items-center gap-2 text-small">
									{c.ok ? (
										<CircleCheck className="size-4 text-add" aria-label="Done" />
									) : (
										<CircleAlert className="size-4 text-status-attention" aria-label="Needs you" />
									)}
									{c.text}
								</li>
							))}
						</ul>
					</section>
					<section className="flex flex-col gap-2">
						<h3 className="text-caption text-ink-faint">Plan next with</h3>
						<Button variant="chip" className="w-fit border-border-strong">
							<Zap />
							<b className="font-medium text-foreground">Codex</b> GPT · High
						</Button>
					</section>
				</aside>
			</div>
			<footer className="flex shrink-0 items-center gap-2 border-t border-border px-6 py-3">
				<span className="text-small text-muted-foreground">Answer 1 unknown before planning, or approve to let Codex assume.</span>
				<span className="flex-1" />
				<Button variant="secondary" onClick={() => toast("Changes requested on task.md")}>
					Request changes
				</Button>
				<Button
					onClick={() => {
						toast("Task approved");
						navigate(`/task/${task.id}/plan`);
					}}
				>
					Approve and plan
				</Button>
			</footer>
		</main>
	);
}
