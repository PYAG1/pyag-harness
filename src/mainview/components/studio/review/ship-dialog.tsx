import { type ReactNode, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioCards } from "@/components/studio/radio-cards";
import { PROJECT } from "@/lib/mock-data";
import { SHIP } from "@/lib/mock-studio";

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-2">
			<h3 className="text-caption text-ink-faint">{title}</h3>
			{children}
		</section>
	);
}

export function ShipDialog({
	open,
	onOpenChange,
	onShip,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onShip: (action: string) => void;
}) {
	const [method, setMethod] = useState(SHIP.methods[0].value);
	const [message, setMessage] = useState(SHIP.message);
	const [keep, setKeep] = useState<Set<string>>(() => new Set(SHIP.learnings.map((l) => l.id)));
	const [removeWorktree, setRemoveWorktree] = useState(true);
	const action = SHIP.methods.find((m) => m.value === method)!.action;

	const toggleKeep = (id: string, on: boolean) =>
		setKeep((s) => {
			const next = new Set(s);
			if (on) next.add(id);
			else next.delete(id);
			return next;
		});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[560px] gap-4 sm:max-w-[560px]" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Ship task</DialogTitle>
					<DialogDescription>3 files, +46 −12 on studio/t-31.</DialogDescription>
				</DialogHeader>

				<Section title="How">
					<RadioCards
						label="How to ship"
						value={method}
						onChange={setMethod}
						options={SHIP.methods.map((m) => ({
							value: m.value,
							label: m.label,
							detail: <span className="font-mono text-code-sm">{m.detail}</span>,
						}))}
					/>
				</Section>

				<Section title="Commit message">
					<Textarea
						aria-label="Commit message"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						className="max-h-48 font-mono text-code-sm leading-[18px]"
					/>
				</Section>

				<Section title="Keep for next time">
					<ul className="flex flex-col gap-2">
						{SHIP.learnings.map((l) => (
							<li key={l.id} className="flex items-start gap-2.5">
								<Checkbox
									id={l.id}
									checked={keep.has(l.id)}
									onCheckedChange={(v) => toggleKeep(l.id, v === true)}
									className="mt-0.5"
								/>
								<Label htmlFor={l.id} className="block text-small leading-5 font-normal">
									<Badge variant="pill" className="mr-2 align-[1px]">
										{l.tag}
									</Badge>
									{l.text}
								</Label>
							</li>
						))}
					</ul>
					<p className="text-caption text-ink-faint">Saved to the vault for {PROJECT.name}.</p>
				</Section>

				<div className="flex items-center justify-between gap-4">
					<Label htmlFor="remove-worktree" className="text-small font-normal">
						Remove worktree after shipping
					</Label>
					<Switch id="remove-worktree" checked={removeWorktree} onCheckedChange={setRemoveWorktree} />
				</div>

				<DialogFooter>
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={() => onShip(action)}>{action}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
