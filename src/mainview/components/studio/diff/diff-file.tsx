import { Check, MessageSquare, X } from "lucide-react";
import { Fragment, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AgentOrb } from "@/components/studio/agents/agent-orb";
import { DiffStat } from "@/components/studio/diff/diff-stat";
import { LineComment } from "@/components/studio/diff/line-comment";
import type { Decision, Review } from "@/components/studio/diff/use-review";
import { type DiffFile as DiffFileData, type DiffHunk, type DiffLine, agentById } from "@/lib/mock-task";
import { cn } from "@/lib/utils";

type CodeLine = Exclude<DiffLine, { type: "fold" }>;

const LINE = {
	ctx: { sign: " ", className: "", sr: "" },
	add: { sign: "+", className: "diff-line--add", sr: "Added: " },
	del: { sign: "−", className: "diff-line--del", sr: "Removed: " },
} as const;

const lineNo = (line: CodeLine) => (line.type === "del" ? line.old : line.new);

function Line({ line, onComment }: { line: CodeLine; onComment: (shift: boolean) => void }) {
	const { sign, className, sr } = LINE[line.type];
	const n = lineNo(line);
	return (
		<div className={cn("diff-line", className)}>
			<button
				type="button"
				className="diff-line__ln hover:text-foreground"
				aria-label={`Comment on line ${n}`}
				onClick={(e) => onComment(e.shiftKey)}
			>
				{n}
			</button>
			<span className="diff-line__sign" aria-hidden>
				{sign}
			</span>
			<span className="pr-3">
				<span className="sr-only">{sr}</span>
				{line.text}
			</span>
		</div>
	);
}

function HunkFooter({ decision, onDecide }: { decision?: Decision; onDecide: (d: Decision) => void }) {
	return (
		<div className="flex items-center justify-end gap-1 border-t border-border px-2 py-1 font-sans">
			{decision ? (
				<span className="flex items-center gap-1 text-caption text-muted-foreground">
					{decision === "accepted" ? (
						<Check className="size-3.5 text-add" aria-hidden />
					) : (
						<X className="size-3.5 text-remove" aria-hidden />
					)}
					{decision === "accepted" ? "Accepted" : "Rejected"}
				</span>
			) : (
				<>
					<Button variant="ghost" size="sm" onClick={() => onDecide("rejected")}>
						Reject
					</Button>
					<Button variant="secondary" size="sm" onClick={() => onDecide("accepted")}>
						Accept
					</Button>
				</>
			)}
		</div>
	);
}

function Hunk({ hunk, path, review }: { hunk: DiffHunk; path: string; review: Review }) {
	const anchor = useRef<number | null>(null);
	const decision = review.decisions[hunk.id];

	const comment = (index: number, shift: boolean) => {
		const start = shift && anchor.current !== null ? Math.min(anchor.current, index) : index;
		const end = shift && anchor.current !== null ? Math.max(anchor.current, index) : index;
		anchor.current = index;
		const first = lineNo(hunk.lines[start] as CodeLine);
		const last = lineNo(hunk.lines[end] as CodeLine);
		const label = start === end ? `Line ${first}` : `Lines ${first}–${last}`;
		review.startComment(`${hunk.id}:${end}`, path, label);
	};

	return (
		<div className={cn("min-w-fit", decision && "opacity-60")}>
			{hunk.lines.map((line, i) => {
				const key = `${hunk.id}:${i}`;
				const thread = review.threads[key];
				const draft = review.draft?.key === key ? review.draft : null;
				return (
					<Fragment key={i}>
						{line.type === "fold" ? (
							<button
								type="button"
								className="block w-full bg-sidebar px-3 py-1 text-left font-sans text-caption text-ink-faint hover:text-muted-foreground"
							>
								{line.count} unchanged lines
							</button>
						) : (
							<Line line={line} onComment={(shift) => comment(i, shift)} />
						)}
						{(thread || draft) && (
							<LineComment
								label={(thread ?? draft)!.label}
								thread={thread}
								onSubmit={(text) => review.addComment(key, text)}
								onResolve={() => review.resolve(key)}
								onCancel={review.cancelDraft}
							/>
						)}
					</Fragment>
				);
			})}
			<HunkFooter decision={decision} onDecide={(d) => review.decide(hunk.id, d)} />
		</div>
	);
}

export function DiffFile({ file, review }: { file: DiffFileData; review: Review }) {
	const editor = agentById(file.editorId);

	return (
		<Collapsible
			defaultOpen
			id={`file-${file.path}`}
			className="group/file scroll-mt-4 overflow-hidden rounded-lg border border-border bg-background"
		>
			<div className="flex items-center gap-2 border-b border-border bg-sidebar px-3 py-1.5 text-small group-data-[state=closed]/file:border-b-0">
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="icon-sm" aria-label={`Collapse ${file.path}`}>
						<CollapsibleChevron />
					</Button>
				</CollapsibleTrigger>
				{review.fileAccepted(file) && <Check className="size-3.5 text-add" aria-label="Accepted" />}
				<span className="min-w-0 flex-1 truncate font-mono text-code-sm">{file.path}</span>
				<AgentOrb agentId={editor.id} family={editor.family} label={`Changed by ${editor.name}`} />
				<DiffStat add={file.add} del={file.del} />
				{file.isNew && <Badge variant="outline">new</Badge>}
				<Button variant="ghost" size="sm" onClick={() => review.startComment(`${file.hunks[0].id}:0`, file.path, "File")}>
					<MessageSquare />
					Comment
				</Button>
			</div>
			<CollapsibleContent className="overflow-x-auto">
				{file.hunks.map((h) => (
					<Hunk key={h.id} hunk={h} path={file.path} review={review} />
				))}
			</CollapsibleContent>
		</Collapsible>
	);
}
