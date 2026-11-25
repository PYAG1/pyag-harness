import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Kbd } from "@/components/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EmptyState } from "@/components/studio/empty-state";
import { NeedsYouItem } from "@/components/studio/needs-you-item";
import { INBOX, INBOX_GROUPS, type InboxKind } from "@/lib/mock-studio";
import { useKeys } from "@/lib/shortcuts";

type Filter = "all" | InboxKind;

export function NeedsYou() {
	const navigate = useNavigate();
	const [items, setItems] = useState(INBOX);
	const [filter, setFilter] = useState<Filter>("all");
	const [active, setActive] = useState(0);

	const groups = INBOX_GROUPS.filter((g) => filter === "all" || g.kind === filter)
		.map((g) => ({ ...g, items: items.filter((i) => i.kind === g.kind) }))
		.filter((g) => g.items.length > 0);
	const flat = groups.flatMap((g) => g.items);
	const current = flat[Math.min(active, flat.length - 1)];

	const resolve = (id: string, verb: string) => {
		setItems((s) => s.filter((i) => i.id !== id));
		toast(verb);
	};

	useKeys({
		j: () => setActive((a) => Math.min(flat.length - 1, a + 1)),
		k: () => setActive((a) => Math.max(0, a - 1)),
		y: () => current?.kind === "approval" && resolve(current.id, "Allowed once"),
		n: () => current?.kind === "approval" && resolve(current.id, "Denied"),
		Enter: () => current && navigate(`/task/${current.taskId}`),
	});

	return (
		<main aria-label="Needs you" className="flex h-full flex-col overflow-y-auto">
			<div className="mx-auto flex w-full max-w-[880px] flex-1 flex-col px-6 py-6">
				<header className="flex items-center gap-2 pb-4">
					<h1 className="text-title">Needs you</h1>
					<span className="font-mono text-caption text-ink-faint">{items.length}</span>
					<span className="flex-1" />
					<ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as Filter)} aria-label="Filter">
						<ToggleGroupItem value="all">All</ToggleGroupItem>
						{INBOX_GROUPS.map((g) => (
							<ToggleGroupItem key={g.kind} value={g.kind}>
								{g.label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</header>

				{flat.length === 0 ? (
					<EmptyState message="Nothing needs you. Agents will ask here." />
				) : (
					<div className="flex flex-col gap-4" aria-live="polite">
						{groups.map((g) => (
							<section key={g.kind} aria-label={g.label}>
								<h2 className="pb-1 pl-3 text-caption text-ink-faint">
									{g.label} · {g.items.length}
								</h2>
								<ul className="border-t border-border">
									{g.items.map((item) => (
										<NeedsYouItem
											key={item.id}
											item={item}
											active={item.id === current?.id}
											onFocus={() => setActive(flat.indexOf(item))}
											onResolve={(verb) => resolve(item.id, verb)}
										/>
									))}
								</ul>
							</section>
						))}
					</div>
				)}

				<footer className="mt-auto flex items-center gap-1.5 pt-6 text-caption text-ink-faint">
					<Kbd>j</Kbd>
					<Kbd>k</Kbd> move · <Kbd>y</Kbd> allow · <Kbd>n</Kbd> deny · <Kbd>↵</Kbd> open
				</footer>
			</div>
		</main>
	);
}
