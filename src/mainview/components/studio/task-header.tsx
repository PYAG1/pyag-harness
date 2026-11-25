import { Ellipsis } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StageTracker } from "@/components/studio/stage-tracker";
import { StatusBadge } from "@/components/studio/status-dot";
import type { Stage } from "@/lib/mock-task";
import type { DotState } from "@/lib/status";

export function TaskHeader({
	title,
	status,
	branch,
	stages,
	onOpenStage,
	view,
	children,
}: {
	title: string;
	status: { state: DotState; label: string };
	branch: string;
	stages: Stage[];
	onOpenStage: (stage: Stage) => void;
	view?: ReactNode;
	children?: ReactNode;
}) {
	return (
		<header className="flex shrink-0 flex-col gap-2.5 border-b border-border px-5 pt-3.5 pb-3">
			<div className="flex min-w-0 items-center gap-2">
				<h1 className="min-w-0 truncate text-title">{title}</h1>
				<StatusBadge state={status.state} className="shrink-0">
					{status.label}
				</StatusBadge>
				<span className="hidden shrink-0 font-mono text-caption whitespace-nowrap text-ink-faint 2xl:inline">{branch}</span>
				<span className="flex-1" />
				{children}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" aria-label="More actions">
							<Ellipsis />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						<DropdownMenuItem>Rename</DropdownMenuItem>
						<DropdownMenuItem>Copy branch name</DropdownMenuItem>
						<DropdownMenuItem>Open worktree in editor</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem variant="destructive">Archive task</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<StageTracker stages={stages} onOpenStage={onOpenStage} />
				{view && <div className="ml-auto">{view}</div>}
			</div>
		</header>
	);
}

export const withGate = (stages: Stage[], gate: string): Stage[] => {
	const at = stages.findIndex((s) => s.name === gate);
	return stages.map((s, i) => ({ name: s.name, state: i < at ? "done" : i === at ? "gate" : "upcoming" }));
};
