import { CircleAlert, FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AgentLanes } from "@/components/studio/agents/agent-lanes";
import { RadioCards } from "@/components/studio/radio-cards";
import { HANDOFF } from "@/lib/mock-studio";

export function LimitHandoff({ onContinue }: { onContinue: (option: string) => void }) {
	const [option, setOption] = useState(HANDOFF.options[0].value);
	const chosen = HANDOFF.options.find((o) => o.value === option)!;

	return (
		<>
			<div role="note" className="marker">
				<span>
					<b className="font-medium text-foreground">Claude Code</b> stopped · Max usage limit reached
				</span>
			</div>
			<section aria-label="Usage limit handoff" className="flex flex-col gap-4 rounded-lg border border-border-strong p-5">
				<div className="flex flex-col gap-0.5">
					<h2 className="text-title">Claude Code hit its usage limit</h2>
					<p className="text-small text-muted-foreground">Resets at {HANDOFF.resetAt}. Work so far is saved in the session files.</p>
				</div>

				<AgentLanes lanes={HANDOFF.lanes} minutes={10} now={7} compact />

				<RadioCards label="How to continue" options={HANDOFF.options} value={option} onChange={setOption} />

				{option === "codex" && (
					<div className="flex flex-col gap-1.5">
						<h3 className="text-caption text-ink-faint">Codex will receive</h3>
						<ul>
							{HANDOFF.files.map((f) => (
								<li key={f.name} className="flex items-center gap-2 py-1 text-small">
									<FileText className="size-3.5 text-muted-foreground" aria-hidden />
									<span className="font-mono text-code-sm">{f.name}</span>
									<span className="text-ink-faint">· {f.meta}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				<p className="flex items-start gap-2 text-small text-muted-foreground">
					<CircleAlert className="mt-0.5 size-4 shrink-0 text-status-attention" aria-hidden />
					{HANDOFF.stopped}
				</p>

				<div className="flex items-center gap-1">
					<Button variant="ghost">Edit handoff</Button>
					<span className="flex-1" />
					<Button variant="secondary">Not now</Button>
					<Button onClick={() => onContinue(option)}>{chosen.value === "wait" ? "Wait for reset" : chosen.label}</Button>
				</div>
			</section>
		</>
	);
}
