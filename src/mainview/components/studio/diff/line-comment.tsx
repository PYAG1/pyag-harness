import { Check } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AgentOrb } from "@/components/studio/agents/agent-orb";
import type { Comment, Thread } from "@/components/studio/diff/use-review";
import { agentById } from "@/lib/mock-task";

function CommentRow({ comment }: { comment: Comment }) {
	const agent = comment.author.kind === "agent" ? agentById(comment.author.agentId) : null;
	return (
		<li className="flex gap-2">
			{agent ? (
				<AgentOrb agentId={agent.id} family={agent.family} />
			) : (
				<Avatar className="size-5">
					<AvatarFallback className="text-micro">PA</AvatarFallback>
				</Avatar>
			)}
			<div className="flex min-w-0 flex-col">
				<span className="text-caption text-muted-foreground">{agent ? agent.name : "You"}</span>
				<p className="text-small">{comment.text}</p>
			</div>
		</li>
	);
}

export function LineComment({
	label,
	thread,
	onSubmit,
	onResolve,
	onCancel,
}: {
	label: string;
	thread?: Thread;
	onSubmit: (text: string) => void;
	onResolve?: () => void;
	onCancel?: () => void;
}) {
	const [text, setText] = useState("");
	const submit = () => {
		if (!text.trim()) return;
		onSubmit(text.trim());
		setText("");
	};

	if (thread?.resolved) {
		return (
			<div className="my-2 ml-16 flex items-center gap-1.5 font-sans text-caption text-ink-faint">
				<Check className="size-3.5 text-add" aria-hidden />
				Resolved · {label} · {thread.comments.length} comments
			</div>
		);
	}

	return (
		<div className="my-2 mr-3 ml-16 flex flex-col gap-3 rounded-md border border-border-strong bg-background p-3 font-sans whitespace-normal">
			<span className="text-caption text-ink-faint">{label}</span>
			{thread && (
				<ul className="flex flex-col gap-3">
					{thread.comments.map((c) => (
						<CommentRow key={c.id} comment={c} />
					))}
				</ul>
			)}
			<Textarea
				autoFocus={!thread}
				value={text}
				onChange={(e) => setText(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
					if (e.key === "Escape") onCancel?.();
				}}
				placeholder={thread ? "Reply" : "Comment on this line. Sent with Request changes."}
				className="min-h-14"
				aria-label={thread ? "Reply" : "Comment"}
			/>
			<div className="flex justify-end gap-1">
				{thread ? (
					<Button variant="ghost" size="sm" onClick={onResolve}>
						Resolve
					</Button>
				) : (
					<Button variant="ghost" size="sm" onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button variant="secondary" size="sm" onClick={submit} disabled={!text.trim()}>
					{thread ? "Reply" : "Comment"}
				</Button>
			</div>
		</div>
	);
}
