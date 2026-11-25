import { ArrowUp, Check, File, Folder, Laptop, Plus, Shield, Zap, type LucideIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ShortcutTooltip } from "@/components/studio/shortcut-tooltip";
import { PROJECT } from "@/lib/mock-data";

type Option = { value: string; label: string; detail?: string };

function PickerChip({
	icon: Icon,
	label,
	options,
	value,
	onChange,
	placeholder,
	render,
}: {
	icon: LucideIcon;
	label: string;
	options: Option[];
	value: string;
	onChange: (v: string) => void;
	placeholder: string;
	render?: (o: Option) => ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const current = options.find((o) => o.value === value) ?? options[0];
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="chip" aria-label={label} data-active={open}>
					<Icon />
					{render ? render(current) : current.label}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-64 p-0">
				<Command>
					<CommandInput placeholder={placeholder} />
					<CommandList>
						<CommandEmpty>No match.</CommandEmpty>
						<CommandGroup>
							{options.map((o) => (
								<CommandItem
									key={o.value}
									value={o.label}
									onSelect={() => {
										onChange(o.value);
										setOpen(false);
									}}
									className="text-small"
								>
									<span className="flex-1">
										{o.label}
										{o.detail && <span className="text-ink-faint"> · {o.detail}</span>}
									</span>
									{o.value === value && <Check className="size-3.5" />}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

const APPROVAL: Option[] = [
	{ value: "ask", label: "Ask first" },
	{ value: "edits", label: "Allow edits" },
	{ value: "all", label: "Allow all" },
];

const RUNTIMES: Option[] = [
	{ value: "cc-opus-high", label: "Claude Code", detail: "Opus · High" },
	{ value: "cc-sonnet", label: "Claude Code", detail: "Sonnet · Medium" },
	{ value: "cx", label: "Codex", detail: "GPT · High" },
	{ value: "oc", label: "OpenCode", detail: "Default" },
];

const CONTEXT_PREVIEW = [
	{ group: "Shared", icon: File, rows: [
		{ name: "CLAUDE.md", note: "project instructions", tokens: "640" },
		{ name: "task prompt", note: "", tokens: "120" },
	] },
	{ group: "Skills", icon: Zap, rows: [
		{ name: "test-driven-development", note: "core · Build", tokens: "520" },
		{ name: "debugging-and-error-recovery", note: "on trigger", tokens: "410" },
		{ name: "incremental-implementation", note: "core · Build", tokens: "430" },
	] },
];

function ContextChip({ running }: { running: boolean }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="chip" className="border-border-strong" aria-label="Inspect context">
					Context · {running ? "81%" : "3 skills · 2.1k"}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-[400px] p-2">
				<div className="flex items-center justify-between px-1 pb-2">
					<span className="text-title">Context</span>
					<span className="font-mono text-caption text-ink-faint">2.1k tokens</span>
				</div>
				<Separator />
				{CONTEXT_PREVIEW.map((g) => (
					<div key={g.group} className="pt-2">
						<p className="px-1 pb-1 text-caption text-ink-faint">{g.group}</p>
						<ul>
							{g.rows.map((r) => (
								<li
									key={r.name}
									className="grid grid-cols-[16px_1fr_auto] items-center gap-2 rounded-sm px-1 py-[7px] text-small hover:bg-surface-hover"
								>
									<g.icon className="size-3.5 text-muted-foreground" aria-hidden />
									<span className="min-w-0 truncate">
										<span className="font-mono">{r.name}</span>
										{r.note && <span className="text-ink-faint"> · {r.note}</span>}
									</span>
									<span className="font-mono text-caption text-ink-faint">{r.tokens}</span>
								</li>
							))}
						</ul>
					</div>
				))}
			</PopoverContent>
		</Popover>
	);
}

export function Composer({
	scope = false,
	running = false,
	onSubmit,
}: {
	scope?: boolean;
	running?: boolean;
	onSubmit?: (prompt: string) => void;
}) {
	const [text, setText] = useState("");
	const [approval, setApproval] = useState("edits");
	const [runtime, setRuntime] = useState("cc-opus-high");

	const submit = () => {
		const v = text.trim();
		if (!v) return;
		onSubmit?.(v);
		setText("");
	};

	return (
		<div className="w-full max-w-[760px]">
			{scope && (
				<div className="mx-4 flex gap-1 rounded-t-lg border border-b-0 border-border bg-sidebar px-2 py-1">
					<Button variant="chip" data-active="true" aria-label="Project">
						<Laptop />
						{PROJECT.name}
					</Button>
					<Button variant="chip" aria-label="Base branch">
						<Folder />
						<span className="font-mono">{PROJECT.branch}</span>
					</Button>
					<Button variant="chip" aria-label="Workflow">
						standard
					</Button>
				</div>
			)}
			<div className="rounded-xl border border-border bg-surface-raised px-3 pt-3 pb-2">
				<label htmlFor="composer-input" className="sr-only">
					Task prompt
				</label>
				<Textarea
					id="composer-input"
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
							e.preventDefault();
							submit();
						}
						if (e.key === "Escape") e.currentTarget.blur();
					}}
					placeholder={
						running ? "Steer Claude Code, or @ an agent" : "Describe a task. @ to add files, / for workflows"
					}
					rows={1}
					className="max-h-[176px] min-h-11 resize-none rounded-none border-0 bg-transparent px-1 py-0 text-prompt"
				/>
				<div className="mt-2 flex items-center gap-0.5">
					<ShortcutTooltip label="Attach files" shortcut="attach">
						<Button variant="ghost" size="icon" aria-label="Attach files">
							<Plus />
						</Button>
					</ShortcutTooltip>
					{!running && (
						<PickerChip
							icon={Shield}
							label="Approval mode"
							options={APPROVAL}
							value={approval}
							onChange={setApproval}
							placeholder="Approval mode"
						/>
					)}
					<ContextChip running={running} />
					<div className="flex-1" />
					{running ? (
						<Button variant="secondary">Stop</Button>
					) : (
						<PickerChip
							icon={Zap}
							label="Runtime"
							options={RUNTIMES}
							value={runtime}
							onChange={setRuntime}
							placeholder="Choose runtime"
							render={(o) => (
								<span>
									<b className="font-medium text-foreground">{o.label}</b> {o.detail}
								</span>
							)}
						/>
					)}
					<ShortcutTooltip label="Run task" shortcut="run">
						<Button size="icon-round" aria-label="Run task" onClick={submit} disabled={!text.trim()} className="ml-1">
							<ArrowUp />
						</Button>
					</ShortcutTooltip>
				</div>
			</div>
		</div>
	);
}
