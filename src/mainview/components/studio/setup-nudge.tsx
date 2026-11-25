import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";

export function SetupNudge({
	icon: Icon,
	title,
	description,
	confirmLabel,
	onConfirm,
	onDismiss,
}: {
	icon: LucideIcon;
	title: string;
	description: string;
	confirmLabel: string;
	onConfirm: () => void;
	onDismiss: () => void;
}) {
	return (
		<Item
			variant="muted"
			role="region"
			aria-label={title}
			className="max-w-[560px] flex-nowrap items-start gap-3 rounded-lg px-4 py-3"
		>
			<ItemMedia className="mt-0.5 text-muted-foreground">
				<Icon className="size-4" aria-hidden />
			</ItemMedia>
			<ItemContent className="gap-2">
				<div className="flex flex-col gap-0.5">
					<ItemTitle>{title}</ItemTitle>
					<ItemDescription className="text-small">{description}</ItemDescription>
				</div>
				<div className="flex gap-1">
					<Button variant="secondary" onClick={onConfirm}>
						{confirmLabel}
					</Button>
					<Button variant="ghost" onClick={onDismiss}>
						Not now
					</Button>
				</div>
			</ItemContent>
		</Item>
	);
}
