import { CircleAlert, Lock } from "lucide-react";
import { type ReactNode, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Meter } from "@/components/studio/meter";
import { RuntimeSelect } from "@/components/studio/runtime-select";
import { SettingRow } from "@/components/studio/settings/setting-row";
import { SetupNudge } from "@/components/studio/setup-nudge";
import { SortableList } from "@/components/studio/sortable-list";
import { ROUTING_RULES, USAGE } from "@/lib/mock-studio";
import { type ThemeSetting, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SECTIONS = [
	{ to: "routing", label: "Routing" },
	{ to: "appearance", label: "Appearance" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-title">{title}</h2>
			{children}
		</section>
	);
}

function Routing() {
	const [rules, setRules] = useState(ROUTING_RULES);
	const [nudge, setNudge] = useState(true);
	const [balance, setBalance] = useState(true);

	return (
		<>
			<h1 className="text-xl leading-[26px] font-semibold">Routing</h1>

			<Section title="Usage windows">
				<div className="flex flex-col gap-2">
					{USAGE.map((u) => (
						<div key={u.name} className="flex flex-col gap-0.5">
							<Meter label={u.name} pct={u.pct} />
							<span className="pl-[108px] text-caption text-ink-faint">{u.window}</span>
						</div>
					))}
				</div>
			</Section>

			<Section title="Rules">
				<p className="text-small text-muted-foreground">First match wins. Drag project rules to reorder.</p>
				<SortableList
					label="Routing rules"
					items={rules}
					onReorder={setRules}
					itemLabel={(r) => r.when}
					isLocked={(r) => r.locked}
					rowClassName="grid grid-cols-[20px_1fr_auto] items-center gap-3 border-b border-border py-2.5"
					renderItem={(r) => (
						<>
							<span className="flex min-w-0 items-center gap-2">
								{r.locked && <Lock className="size-3.5 shrink-0 text-ink-faint" aria-label="Locked" />}
								<span className="truncate">{r.when}</span>
								<Badge variant="pill">{r.source}</Badge>
							</span>
							{r.locked ? (
								<span className="text-small text-muted-foreground">{r.runtime}</span>
							) : (
								<RuntimeSelect
									label={`Runtime for ${r.when}`}
									value={r.runtime}
									onChange={(v) => setRules((s) => s.map((x) => (x.id === r.id ? { ...x, runtime: v } : x)))}
								/>
							)}
						</>
					)}
				/>
			</Section>

			{nudge && (
				<SetupNudge
					icon={CircleAlert}
					title="Route Verify to Codex?"
					description="Codex finished Verify 31% faster across your last 20 tasks, with the same pass rate."
					confirmLabel="Add rule for brixport"
					onConfirm={() => {
						setNudge(false);
						setRules((s) => [...s, { id: "r5", locked: false, when: "Verify stage", runtime: "Codex", source: "from Insights" }]);
						toast("Rule added");
					}}
					onDismiss={() => setNudge(false)}
				/>
			)}

			<Section title="Limits and balancing">
				<div>
					<SettingRow
						label="Hand off at usage limit"
						description="Continue in the next runtime when one hits its limit."
						scope="Project"
						overrides="Global"
						htmlFor="balance"
					>
						<Switch id="balance" checked={balance} onCheckedChange={setBalance} />
					</SettingRow>
					<SettingRow label="Parallel subagents" description="Most subagents that run at once." scope="Global" htmlFor="parallel">
						<Input id="parallel" type="number" defaultValue={3} min={1} max={8} className="w-20" />
					</SettingRow>
					<SettingRow label="Editors at a time" description="Subagents allowed to edit files at once." scope="Project" htmlFor="editors">
						<Input id="editors" type="number" defaultValue={1} min={1} max={4} className="w-20" />
					</SettingRow>
				</div>
			</Section>
		</>
	);
}

function Appearance() {
	const { setting, setTheme } = useTheme();
	return (
		<>
			<h1 className="text-xl leading-[26px] font-semibold">Appearance</h1>
			<div>
				<SettingRow label="Theme" description="System follows your OS setting." scope="Global" htmlFor="theme">
					<Select value={setting} onValueChange={(v) => setTheme(v as ThemeSetting)}>
						<SelectTrigger id="theme">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="dark">Dark</SelectItem>
							<SelectItem value="light">Light</SelectItem>
							<SelectItem value="system">System</SelectItem>
						</SelectContent>
					</Select>
				</SettingRow>
			</div>
		</>
	);
}

export function Settings() {
	return (
		<main aria-label="Settings" className="flex h-full min-w-0">
			<nav aria-label="Settings sections" className="flex w-[220px] shrink-0 flex-col gap-px border-r border-border px-2 py-6">
				{SECTIONS.map((s) => (
					<NavLink
						key={s.to}
						to={`/settings/${s.to}`}
						className={({ isActive }) =>
							cn(buttonVariants({ variant: "ghost" }), "justify-start", isActive && "bg-surface-selected text-foreground")
						}
					>
						{s.label}
					</NavLink>
				))}
			</nav>
			<div className="min-w-0 flex-1 overflow-y-auto">
				<div className="mx-auto flex max-w-[860px] flex-col gap-8 px-8 py-6">
					<Routes>
						<Route index element={<Navigate to="routing" replace />} />
						<Route path="routing" element={<Routing />} />
						<Route path="appearance" element={<Appearance />} />
					</Routes>
				</div>
			</div>
		</main>
	);
}
