import { ArrowLeft, FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AgentTag } from "@/components/studio/agent-tag";
import { DEFINE_SECTIONS, EXECUTION_LOG, type LogWriter, PLAN_STEPS, SESSION_FILES, type SessionFile } from "@/lib/mock-studio";
import { cn } from "@/lib/utils";

const ORDER = ["task.md", "plan.md", "execution.md", "learnings.md", "interface.md"];

const sortFiles = (files: SessionFile[]) =>
	[...files].sort((a, b) => {
		const ia = ORDER.indexOf(a.name);
		const ib = ORDER.indexOf(b.name);
		return (ia === -1 ? ORDER.length : ia) - (ib === -1 ? ORDER.length : ib) || a.name.localeCompare(b.name);
	});

const SECTION = { filled: "bg-muted-foreground", none: "bg-border-control", missing: "bg-surface-hover" };

export function SectionBar({ sections }: { sections: NonNullable<SessionFile["sections"]> }) {
	return (
		<span className="flex shrink-0 gap-0.5" aria-hidden>
			{sections.map((s, i) => (
				<span key={i} className={cn("h-[3px] w-3.5 rounded-sm", SECTION[s])} />
			))}
		</span>
	);
}

type LogFilter = "all" | "CC" | "sub" | "CX";

const matches = (writer: LogWriter, f: LogFilter) =>
	f === "all" ||
	(f === "CC" && writer === "CC") ||
	(f === "sub" && writer.startsWith("CC ›")) ||
	(f === "CX" && writer === "CX");

function ExecutionLog() {
	const [filter, setFilter] = useState<LogFilter>("all");
	return (
		<div className="flex flex-col gap-3">
			<ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as LogFilter)} aria-label="Filter by writer">
				<ToggleGroupItem value="all">All</ToggleGroupItem>
				<ToggleGroupItem value="CC">CC</ToggleGroupItem>
				<ToggleGroupItem value="sub">Subagents</ToggleGroupItem>
				<ToggleGroupItem value="CX">CX</ToggleGroupItem>
			</ToggleGroup>
			<ol className="flex flex-col">
				{EXECUTION_LOG.filter((e) => matches(e.writer, filter)).map((e) => (
					<li key={`${e.time}-${e.entry}`} className="grid grid-cols-[44px_auto_1fr] items-start gap-2 py-1.5 text-small">
						<time className="font-mono text-code-sm text-ink-faint">{e.time}</time>
						<AgentTag tag={e.writer} />
						<span>{e.entry}</span>
					</li>
				))}
			</ol>
		</div>
	);
}

function FilePreview({ name }: { name: string }) {
	if (name === "execution.md") return <ExecutionLog />;
	if (name === "task.md")
		return (
			<ol className="flex flex-col gap-3">
				{DEFINE_SECTIONS.map((s, i) => (
					<li key={s.id} className="grid grid-cols-[28px_1fr] gap-1">
						<span className="font-mono text-code-sm text-ink-faint">{i + 1}</span>
						<div>
							<h4 className="font-semibold">{s.title}</h4>
							<p className="text-small text-muted-foreground">
								{s.body ?? s.unknowns?.map((u) => u.text).join(" ")}
							</p>
						</div>
					</li>
				))}
			</ol>
		);
	if (name === "plan.md")
		return (
			<ol className="flex flex-col gap-2">
				{PLAN_STEPS.map((p, i) => (
					<li key={p.id} className="grid grid-cols-[24px_1fr] gap-1 text-small">
						<span className="font-mono text-code-sm text-ink-faint">{i + 1}</span>
						<span>
							<span className="font-medium">{p.title}</span>
							<span className="block text-caption text-ink-faint">
								<code className="font-mono">{p.path}</code> · {p.check}
							</span>
						</span>
					</li>
				))}
			</ol>
		);
	return <p className="text-small text-ink-faint">Rendered when the runtime writes it.</p>;
}

export function SessionFiles() {
	const [open, setOpen] = useState<string | null>(null);
	const files = sortFiles(SESSION_FILES);

	if (open) {
		const file = files.find((f) => f.name === open);
		return (
			<div className="flex flex-col gap-3 p-4">
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="icon-sm" aria-label="All files" onClick={() => setOpen(null)}>
						<ArrowLeft />
					</Button>
					<span className="font-mono text-code-sm">{open}</span>
					{file && <AgentTag tag={file.writer} />}
					<span className="flex-1" />
					{file && <time className="font-mono text-code-sm text-ink-faint">{file.time}</time>}
				</div>
				<FilePreview name={open} />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2 p-4">
			<h2 className="text-title">Session</h2>
			<ul>
				{files.map((f) => (
					<li key={f.name}>
						<button
							type="button"
							onClick={() => setOpen(f.name)}
							className="grid w-full grid-cols-[16px_1fr_auto_64px] items-center gap-2 rounded-sm px-1 py-[7px] text-left text-small hover:bg-surface-hover"
						>
							<FileText className="size-3.5 text-muted-foreground" aria-hidden />
							<span className="flex min-w-0 items-center gap-2">
								<span className="shrink-0 font-mono text-code-sm">{f.name}</span>
								<span className="min-w-0 truncate text-ink-faint">· {f.meta}</span>
								{f.sections && <SectionBar sections={f.sections} />}
							</span>
							<AgentTag tag={f.writer} />
							<time className="text-right font-mono text-code-sm text-ink-faint">{f.time}</time>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
