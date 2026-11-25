import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StatusBadge, StatusDot } from "@/components/studio/status-dot";
import { CHECKS } from "@/lib/mock-studio";

export function ChecksStrip({ onOpenCheck }: { onOpenCheck: (id: string) => void }) {
	const warnings = CHECKS.some((c) => c.state === "attention");
	return (
		<div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-3">
			<span className="text-caption text-ink-faint">Checks</span>
			{CHECKS.map((c) => (
				<button key={c.id} type="button" onClick={() => onOpenCheck(c.id)} className="rounded-full">
					<StatusBadge state={c.state} className="hover:bg-surface-hover">
						{c.label} · {c.summary}
					</StatusBadge>
				</button>
			))}
			<span className="flex-1" />
			{warnings && <Button variant="ghost">Ask agent to fix warnings</Button>}
		</div>
	);
}

export function ChecksList({ openId }: { openId?: string }) {
	return (
		<div className="flex flex-col gap-2 p-4">
			<h2 className="text-title">Checks</h2>
			{CHECKS.map((c) => (
				<Collapsible key={c.id} defaultOpen={c.id === openId || c.state === "attention"} className="rounded-lg border border-border">
					<CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-left text-small">
						<CollapsibleChevron className="text-muted-foreground" />
						<StatusDot state={c.state} />
						<span className="font-medium">{c.label}</span>
						<span className="text-muted-foreground">{c.summary}</span>
						<span className="flex-1" />
						{c.state === "attention" && <Badge variant="pill" className="border-status-attention text-status-attention">warnings</Badge>}
					</CollapsibleTrigger>
					<CollapsibleContent>
						<pre className="mx-3 mb-3 rounded-md bg-surface-raised px-3 py-2 font-mono text-code-sm whitespace-pre-wrap text-muted-foreground">
							{c.log}
						</pre>
					</CollapsibleContent>
				</Collapsible>
			))}
		</div>
	);
}
