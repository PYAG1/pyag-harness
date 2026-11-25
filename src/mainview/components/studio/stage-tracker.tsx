import { Check } from "lucide-react";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/studio/status-dot";
import type { Stage } from "@/lib/mock-task";
import { cn } from "@/lib/utils";

const PILL: Record<Stage["state"], string> = {
	upcoming: "text-ink-faint",
	done: "text-muted-foreground",
	current: "bg-surface-raised text-foreground hover:bg-surface-raised",
	gate: "border border-status-attention text-status-attention hover:text-status-attention",
};

export function StageTracker({
	stages,
	onOpenStage,
}: {
	stages: Stage[];
	onOpenStage: (stage: Stage) => void;
}) {
	return (
		<nav aria-label="Workflow stages">
			<ol className="flex items-center">
				{stages.map((stage, i) => (
					<Fragment key={stage.name}>
						{i > 0 && (
							<li
								aria-hidden
								className={cn(
									"h-px w-3.5",
									stages[i - 1].state === "done" ? "bg-ink-faint" : "bg-border-strong",
								)}
							/>
						)}
						<li>
							<Button
								variant="chip"
								aria-current={stage.state === "current" || stage.state === "gate" ? "step" : undefined}
								onClick={() => onOpenStage(stage)}
								className={PILL[stage.state]}
							>
								{stage.state === "done" && <Check />}
								{stage.state === "current" && <StatusDot state="running" />}
								{stage.name}
								{stage.state === "current" && stage.progress && (
									<span className="text-muted-foreground">· {stage.progress}</span>
								)}
								{stage.state === "gate" && <span>· needs you</span>}
							</Button>
						</li>
					</Fragment>
				))}
			</ol>
		</nav>
	);
}
