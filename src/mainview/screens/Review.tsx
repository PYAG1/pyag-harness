import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DiffFile } from "@/components/studio/diff/diff-file";
import { FileTree } from "@/components/studio/diff/file-tree";
import { type Thread, useReview } from "@/components/studio/diff/use-review";
import { ChecksStrip } from "@/components/studio/review/checks";
import { ShipDialog } from "@/components/studio/review/ship-dialog";
import { TaskHeader, withGate } from "@/components/studio/task-header";
import { TASKS } from "@/lib/mock-data";
import { DIFF_FILES, STAGES } from "@/lib/mock-task";
import { SHORTCUTS, useKeys, useShortcut } from "@/lib/shortcuts";
import { NotFound } from "@/screens/Placeholder";

const SEED: Thread[] = [
	{
		key: "h2:3",
		path: "src/payments/retry.ts",
		label: "Line 52",
		resolved: false,
		comments: [
			{ id: "s1", author: { kind: "you" }, text: "Could clock default to systemClock so call sites don't change?" },
			{
				id: "s2",
				author: { kind: "agent", agentId: "cc-builder" },
				text: "Yes. I'll default it in the constructor and drop the adapter edits.",
			},
		],
	},
];

const STAGES_AT_REVIEW = withGate(STAGES, "Review");

export function Review() {
	const { id } = useParams();
	const navigate = useNavigate();
	const task = TASKS.find((t) => t.id === id);
	const review = useReview(DIFF_FILES, SEED);
	const [selected, setSelected] = useState(DIFF_FILES[0].path);
	const [shipping, setShipping] = useState(false);

	const select = (path: string) => {
		setSelected(path);
		document.getElementById(`file-${path}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
	};
	const step = (dir: 1 | -1) => {
		const i = DIFF_FILES.findIndex((f) => f.path === selected);
		const next = DIFF_FILES[Math.min(DIFF_FILES.length - 1, Math.max(0, i + dir))];
		select(next.path);
	};
	const currentHunk = () => DIFF_FILES.find((f) => f.path === selected)?.hunks.find((h) => !review.decisions[h.id]);
	const requestChanges = () => toast(`Changes requested${review.pendingComments ? ` with ${review.pendingComments} comments` : ""}`);

	useShortcut("requestChanges", requestChanges);

	useKeys({
		n: () => step(1),
		p: () => step(-1),
		a: () => {
			const h = currentHunk();
			if (h) review.decide(h.id, "accepted");
		},
		x: () => {
			const h = currentHunk();
			if (h) review.decide(h.id, "rejected");
		},
		c: () => {
			const f = DIFF_FILES.find((d) => d.path === selected);
			if (f) review.startComment(`${f.hunks[0].id}:0`, f.path, "File");
		},
	});

	if (!task) return <NotFound />;

	return (
		<main aria-label={`Review ${task.title}`} className="flex h-full min-w-0 flex-col">
			<TaskHeader
				title={task.title}
				status={{ state: "attention", label: "Review · needs you" }}
				branch="studio/t-31"
				stages={STAGES_AT_REVIEW}
				onOpenStage={() => navigate(`/task/${task.id}?panel=session`)}
			/>
			<ChecksStrip onOpenCheck={() => navigate(`/task/${task.id}?panel=checks`)} />
			<div className="flex min-h-0 flex-1">
				<ScrollArea className="min-w-0 flex-1">
					<div className="flex flex-col gap-3 px-6 py-4">
						{DIFF_FILES.map((f) => (
							<DiffFile key={f.path} file={f} review={review} />
						))}
					</div>
				</ScrollArea>
				<aside aria-label="Files" className="w-[280px] shrink-0 border-l border-border">
					<FileTree files={DIFF_FILES} review={review} selected={selected} onSelect={select} />
				</aside>
			</div>
			<footer className="flex shrink-0 items-center gap-2 border-t border-border px-6 py-3">
				<span className="flex items-center gap-1.5 text-caption text-ink-faint">
					<Kbd>n</Kbd>
					<Kbd>p</Kbd> file · <Kbd>a</Kbd> accept · <Kbd>x</Kbd> reject · <Kbd>c</Kbd> comment
				</span>
				<span className="flex-1" />
				<Button variant="destructive" onClick={() => toast("Changes discarded")}>
					Discard
				</Button>
				<Button variant="secondary" onClick={requestChanges}>
					Request changes{review.pendingComments > 0 && ` · ${review.pendingComments}`}
					<Kbd>{SHORTCUTS.requestChanges.label}</Kbd>
				</Button>
				<Button onClick={() => setShipping(true)}>Ship</Button>
			</footer>
			<ShipDialog
				open={shipping}
				onOpenChange={setShipping}
				onShip={(action) => {
					setShipping(false);
					toast(action === "Open PR" ? "PR opened" : `${action} done`);
				}}
			/>
		</main>
	);
}
