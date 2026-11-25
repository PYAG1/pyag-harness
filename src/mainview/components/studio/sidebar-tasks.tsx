import { ChevronRight, ChevronDown, Plus, Search } from "lucide-react";
import { useMatch, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { DiffStat } from "@/components/studio/diff/diff-stat";
import { ShortcutTooltip } from "@/components/studio/shortcut-tooltip";
import { StatusDot } from "@/components/studio/status-dot";
import { PROJECT, STATUS_GROUPS, type Task, TASKS } from "@/lib/mock-data";
import { SHORTCUTS } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";

const ROUTE_FOR: Record<Task["status"], string> = { attention: "/plan", running: "", ready: "/review", done: "", failed: "" };

const PROJECTS = [PROJECT.name, "ledger-api", "marketing-site"];
const MAX_TREE_ROWS = 5;

const GROUPS = STATUS_GROUPS.map((g) => ({ ...g, tasks: TASKS.filter((t) => t.status === g.status) })).filter(
	(g) => g.tasks.length > 0,
);

function TaskMeta({ task }: { task: Task }) {
	if (task.diff) return <DiffStat {...task.diff} className="text-caption" />;
	return (
		<span
			className={cn(
				"shrink-0 font-mono text-caption text-ink-faint group-hover/row:text-muted-foreground group-data-[active=true]/row:text-muted-foreground",
				task.status === "failed" && "text-remove",
			)}
		>
			{task.meta}
		</span>
	);
}

function AgentTree({ task }: { task: Task }) {
	const children = task.subagents ?? [];
	return (
		<SidebarMenuSub aria-label={`Subagents of ${task.title}`}>
			{children.slice(0, MAX_TREE_ROWS).map((s) => (
				<SidebarMenuSubItem key={s.id}>
					<SidebarMenuSubButton asChild>
						<button type="button">
							<StatusDot state={s.state} />
							<span className="min-w-0 flex-1 truncate">
								<span className="font-mono text-foreground">{s.type}</span> {s.brief}
							</span>
							<span className="shrink-0 font-mono text-caption text-ink-faint">{s.duration}</span>
						</button>
					</SidebarMenuSubButton>
				</SidebarMenuSubItem>
			))}
			{children.length > MAX_TREE_ROWS && (
				<SidebarMenuSubItem className="flex h-[30px] items-center text-small text-ink-faint">
					+{children.length - MAX_TREE_ROWS} more
				</SidebarMenuSubItem>
			)}
		</SidebarMenuSub>
	);
}

function TaskRow({ task, selected }: { task: Task; selected: boolean }) {
	const navigate = useNavigate();
	const showTree = selected && task.subagents?.some((s) => s.state === "running");
	return (
		<SidebarMenuItem>
			<SidebarMenuButton isActive={selected} onClick={() => navigate(`/task/${task.id}${ROUTE_FOR[task.status]}`)} className="group/row gap-2">
				<StatusDot state={task.status === "done" ? "idle" : task.status} />
				<span className="min-w-0 flex-1 truncate">{task.title}</span>
				<TaskMeta task={task} />
			</SidebarMenuButton>
			{showTree && <AgentTree task={task} />}
		</SidebarMenuItem>
	);
}

function StatusGroup({ group, selectedId }: { group: (typeof GROUPS)[number]; selectedId?: string }) {
	return (
		<Collapsible defaultOpen={!group.collapsed} className="group/collapsible">
			<SidebarGroup className="p-0">
				<SidebarGroupLabel asChild className="h-auto justify-between px-2 pt-3 pb-1 hover:text-muted-foreground">
					<CollapsibleTrigger>
						{group.label} · {group.tasks.length}
						<ChevronRight className="hidden size-3.5 group-data-[state=closed]/collapsible:block" aria-hidden />
					</CollapsibleTrigger>
				</SidebarGroupLabel>
				<CollapsibleContent>
					<SidebarGroupContent>
						<SidebarMenu className="gap-px">
							{group.tasks.map((t) => (
								<TaskRow key={t.id} task={t} selected={t.id === selectedId} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</CollapsibleContent>
			</SidebarGroup>
		</Collapsible>
	);
}

export function SidebarTasks() {
	const navigate = useNavigate();
	const selectedId = useMatch("/task/:id/*")?.params.id;

	return (
		<Sidebar collapsible="offcanvas" aria-label="Tasks" className="left-14">
			<SidebarHeader className="gap-1 p-2 pt-0">
				<div className="app-drag h-7 shrink-0" />
				<div className="flex items-center gap-1">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="app-no-drag flex-1 justify-start text-title text-foreground">
								{PROJECT.name}
								<ChevronDown className="text-muted-foreground" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-56">
							<DropdownMenuLabel className="text-ink-faint">Projects</DropdownMenuLabel>
							<DropdownMenuRadioGroup value={PROJECT.name}>
								{PROJECTS.map((p) => (
									<DropdownMenuRadioItem key={p} value={p}>
										{p}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<Plus />
								Add project
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<ShortcutTooltip label="Search tasks">
						<Button variant="ghost" size="icon" aria-label="Search tasks" className="app-no-drag">
							<Search />
						</Button>
					</ShortcutTooltip>
				</div>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton onClick={() => navigate("/")} className="text-muted-foreground">
							<Plus />
							<span className="flex-1">New task</span>
							<Kbd>{SHORTCUTS.newTask.label}</Kbd>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="px-2 pb-3">
				<nav aria-label="Tasks by status" className="flex flex-col">
					{GROUPS.map((g) => (
						<StatusGroup key={g.status} group={g} selectedId={selectedId} />
					))}
				</nav>
			</SidebarContent>
		</Sidebar>
	);
}
