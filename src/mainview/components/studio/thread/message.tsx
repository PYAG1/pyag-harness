import { AgentOrb } from "@/components/studio/agents/agent-orb";
import { inlineCode } from "@/lib/inline-code";
import type { Agent } from "@/lib/mock-task";

export function UserMessage({ text }: { text: string }) {
	return (
		<div className="max-w-[520px] self-end rounded-xl bg-surface-raised px-3.5 py-2.5 text-body">
			{inlineCode(text)}
		</div>
	);
}

export function AgentMessage({ agent, time, text }: { agent: Agent; time: string; text: string }) {
	return (
		<article className="flex flex-col gap-1">
			<header className="flex items-center gap-2 text-small">
				<AgentOrb agentId={agent.id} family={agent.family} />
				<b className="font-medium">{agent.name}</b>
				{agent.role && <span className="text-muted-foreground">{agent.role}</span>}
				<time className="text-caption text-ink-faint">{time}</time>
			</header>
			<p className="ml-7 max-w-[560px] text-body">{inlineCode(text)}</p>
		</article>
	);
}
