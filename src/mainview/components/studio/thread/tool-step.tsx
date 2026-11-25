import { File, Pencil, SquareTerminal, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { inlineCode } from "@/lib/inline-code";
import type { ToolKind } from "@/lib/mock-task";
import { cn } from "@/lib/utils";

const ICON: Record<ToolKind, LucideIcon> = { read: File, run: SquareTerminal, edit: Pencil };
const MAX_LINES = 12;

function ToolOutput({ output }: { output: string }) {
	const [showAll, setShowAll] = useState(false);
	const lines = output.split("\n");
	const hidden = showAll ? 0 : Math.max(0, lines.length - MAX_LINES);
	return (
		<>
			<pre className="mt-0.5 ml-8 rounded-md bg-surface-raised px-3 py-2 font-mono text-code-sm whitespace-pre-wrap text-muted-foreground">
				{(hidden ? lines.slice(0, MAX_LINES) : lines).join("\n")}
			</pre>
			{hidden > 0 && (
				<Button variant="link" className="mt-1 ml-8 text-caption" onClick={() => setShowAll(true)}>
					Show {hidden} more lines
				</Button>
			)}
		</>
	);
}

export function ToolStep({
	tool,
	summary,
	result,
	failed,
	output,
}: {
	tool: ToolKind;
	summary: string;
	result?: string;
	failed?: boolean;
	output: string;
}) {
	const Icon = ICON[tool];
	return (
		<Collapsible defaultOpen={failed}>
			<CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-small text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-foreground">
				<CollapsibleChevron />
				<Icon className="size-4 shrink-0" aria-hidden />
				<span className="min-w-0 truncate">
					{inlineCode(summary)}
					{result && <span className={cn(failed && "text-remove")}> · {result}</span>}
				</span>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<ToolOutput output={output} />
			</CollapsibleContent>
		</Collapsible>
	);
}
