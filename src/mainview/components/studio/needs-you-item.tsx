import { useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { AgentOrb } from "@/components/studio/agents/agent-orb";
import type { InboxItem } from "@/lib/mock-studio";
import { cn } from "@/lib/utils";

function Actions({ item, onResolve }: { item: InboxItem; onResolve: (verb: string) => void }) {
	const [answer, setAnswer] = useState("");
	switch (item.kind) {
		case "approval":
			return (
				<div className="flex gap-1">
					<Button variant="destructive" onClick={() => onResolve("Denied")}>
						Deny <Kbd>n</Kbd>
					</Button>
					<Button variant="secondary" onClick={() => onResolve("Allowed once")}>
						Allow once <Kbd>y</Kbd>
					</Button>
					<Button variant="ghost" onClick={() => onResolve("Always allowed")}>
						Always in brixport
					</Button>
				</div>
			);
		case "gate":
			return (
				<Button asChild>
					<Link to={`/task/${item.taskId}/plan`}>Review</Link>
				</Button>
			);
		case "failure":
			return (
				<div className="flex gap-1">
					<Button variant="ghost" onClick={() => onResolve("Discarded")}>
						Discard
					</Button>
					<Button variant="secondary" asChild>
						<Link to={`/task/${item.taskId}`}>Open task</Link>
					</Button>
				</div>
			);
		case "question":
			return (
				<form
					className="flex w-full max-w-[420px] gap-1"
					onSubmit={(e) => {
						e.preventDefault();
						if (answer.trim()) onResolve("Answered");
					}}
				>
					<Input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer" aria-label={`Answer: ${item.content}`} />
					<Button type="submit" variant="secondary" disabled={!answer.trim()}>
						Send
					</Button>
				</form>
			);
	}
}

export function NeedsYouItem({
	item,
	active,
	onFocus,
	onResolve,
}: {
	item: InboxItem;
	active: boolean;
	onFocus: () => void;
	onResolve: (verb: string) => void;
}) {
	return (
		<li
			aria-current={active ? "true" : undefined}
			onFocus={onFocus}
			onMouseDown={onFocus}
			className={cn(
				"grid grid-cols-[20px_1fr_auto] items-start gap-3 border-b border-border px-3 py-3.5",
				item.kind === "question" && "grid-cols-[20px_1fr]",
				active && "bg-surface-hover",
			)}
		>
			<AgentOrb agentId={item.agent.id} family={item.agent.family} state={item.agent.state === "done" ? "idle" : item.agent.state} />
			<div className="flex min-w-0 flex-col gap-1">
				<p className="text-caption text-ink-faint">
					<b className="font-medium text-muted-foreground">
						{item.via ? `${item.via} › ${item.agent.name}` : item.agent.name}
					</b>{" "}
					· <Link to={`/task/${item.taskId}`} className="text-ink-faint hover:text-muted-foreground">{item.task}</Link> · {item.kindLabel}
				</p>
				<p className="text-body">
					{item.content}
					{item.command && (
						<>
							{" "}
							<code className="rounded-sm bg-surface-raised px-1.5 font-mono text-code">{item.command}</code>
						</>
					)}
				</p>
				{item.note && <p className="text-caption text-ink-faint">{item.note}</p>}
				{item.kind === "question" && (
					<div className="pt-1">
						<Actions item={item} onResolve={onResolve} />
					</div>
				)}
			</div>
			{item.kind !== "question" && <Actions item={item} onResolve={onResolve} />}
		</li>
	);
}
