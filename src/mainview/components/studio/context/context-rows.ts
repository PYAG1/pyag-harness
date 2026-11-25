import { File, FileText, GitFork, Lock, MessageSquare, SquareTerminal, Zap, type LucideIcon } from "lucide-react";

import {
	AGENT_TAGS,
	type AgentTagId,
	CONTEXT_GROUPS,
	type ContextGroup,
	type ContextIcon,
	RUNTIME_ROW,
} from "@/lib/mock-studio";

export const CONTEXT_ICON: Record<ContextIcon, LucideIcon> = {
	instructions: FileText,
	skill: Zap,
	prompt: MessageSquare,
	handoff: File,
	file: File,
	report: GitFork,
	tool: SquareTerminal,
	runtime: Lock,
};

export type AgentFilter = "all" | AgentTagId;

export function visibleAgents(filter: AgentFilter) {
	return filter === "all" ? AGENT_TAGS : AGENT_TAGS.filter((a) => a.tag === filter);
}

export function visibleGroups(filter: AgentFilter): ContextGroup[] {
	const groups =
		filter === "all"
			? CONTEXT_GROUPS
			: CONTEXT_GROUPS.map((g) => ({ ...g, rows: g.rows.filter((r) => r.agents.includes(filter)) })).filter(
					(g) => g.rows.length > 0,
				);
	return [...groups, { label: "", rows: [RUNTIME_ROW] }];
}
