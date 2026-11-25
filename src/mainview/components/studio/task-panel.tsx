import { PanelRightClose } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiffFile } from "@/components/studio/diff/diff-file";
import { DiffStat } from "@/components/studio/diff/diff-stat";
import { type Review, useReview } from "@/components/studio/diff/use-review";
import { ShortcutTooltip } from "@/components/studio/shortcut-tooltip";
import { ContextPanel } from "@/components/studio/context/context-panel";
import { ChecksList } from "@/components/studio/review/checks";
import { SessionFiles } from "@/components/studio/session/session-files";
import { DIFF_FILES, agentById } from "@/lib/mock-task";

export type PanelTab = "changes" | "context" | "session" | "checks";

const TOTAL_ADD = DIFF_FILES.reduce((n, f) => n + f.add, 0);
const TOTAL_DEL = DIFF_FILES.reduce((n, f) => n + f.del, 0);
const AUTHORSHIP = Object.entries(
	DIFF_FILES.reduce<Record<string, number>>((acc, f) => {
		const name = agentById(f.editorId).name;
		acc[name] = (acc[name] ?? 0) + 1;
		return acc;
	}, {}),
)
	.map(([name, n]) => `${n} by ${name}`)
	.join(" · ");

function ChangesSummary({ review }: { review: Review }) {
	return (
		<div className="flex items-center gap-3 border-b border-border px-4 py-3">
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2 text-small whitespace-nowrap">
					<span>{DIFF_FILES.length} files</span>
					<DiffStat add={TOTAL_ADD} del={TOTAL_DEL} />
					<span className="truncate font-mono text-code-sm text-ink-faint">studio/t-31 → main</span>
				</div>
				<p className="truncate text-caption text-ink-faint">{AUTHORSHIP}</p>
			</div>
			<div className="flex shrink-0 gap-1">
				<Button variant="secondary">
					Request changes{review.pendingComments > 0 && ` · ${review.pendingComments}`}
				</Button>
				<Button>Apply</Button>
			</div>
		</div>
	);
}

export function TaskPanel({
	tab,
	onTabChange,
	onCollapse,
}: {
	tab: PanelTab;
	onTabChange: (t: PanelTab) => void;
	onCollapse: () => void;
}) {
	const review = useReview(DIFF_FILES);

	return (
		<aside aria-label="Task panel" className="flex h-full min-w-0 flex-col bg-background">
			<Tabs value={tab} onValueChange={(v) => onTabChange(v as PanelTab)} className="h-full min-h-0 gap-0">
				<div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
					<TabsList>
						<TabsTrigger value="changes">Changes</TabsTrigger>
						<TabsTrigger value="context">Context</TabsTrigger>
						<TabsTrigger value="session">Session</TabsTrigger>
						<TabsTrigger value="checks">Checks</TabsTrigger>
					</TabsList>
					<span className="flex-1" />
					<ShortcutTooltip label="Collapse panel" shortcut="togglePanel">
						<Button variant="ghost" size="icon" aria-label="Collapse panel" onClick={onCollapse}>
							<PanelRightClose />
						</Button>
					</ShortcutTooltip>
				</div>
				<TabsContent value="changes" className="flex min-h-0 flex-col">
					<ChangesSummary review={review} />
					<ScrollArea className="min-h-0 flex-1">
						<div className="flex flex-col gap-3 p-4">
							{DIFF_FILES.map((f) => (
								<DiffFile key={f.path} file={f} review={review} />
							))}
						</div>
					</ScrollArea>
				</TabsContent>
				<TabsContent value="context" className="min-h-0">
					<ScrollArea className="h-full">
						<ContextPanel />
					</ScrollArea>
				</TabsContent>
				<TabsContent value="session" className="min-h-0">
					<ScrollArea className="h-full">
						<SessionFiles />
					</ScrollArea>
				</TabsContent>
				<TabsContent value="checks" className="min-h-0">
					<ScrollArea className="h-full">
						<ChecksList />
					</ScrollArea>
				</TabsContent>
			</Tabs>
		</aside>
	);
}
