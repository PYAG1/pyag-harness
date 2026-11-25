import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type RadioCardOption = { value: string; label: string; detail?: ReactNode; recommended?: boolean };

export function RadioCards({
	options,
	value,
	onChange,
	label,
}: {
	options: RadioCardOption[];
	value: string;
	onChange: (v: string) => void;
	label: string;
}) {
	return (
		<RadioGroup value={value} onValueChange={onChange} aria-label={label} className="gap-2">
			{options.map((o) => (
				<label
					key={o.value}
					className={cn(
						"flex cursor-pointer items-start gap-3 rounded-md border px-3.5 py-3 transition-colors duration-150",
						o.value === value ? "border-border-control bg-surface-raised" : "border-border hover:bg-surface-hover",
					)}
				>
					<RadioGroupItem value={o.value} className="mt-0.5" />
					<span className="flex min-w-0 flex-1 flex-col gap-0.5">
						<span className="flex items-center gap-2 font-medium">
							{o.label}
							{o.recommended && <Badge variant="pill">recommended</Badge>}
						</span>
						{o.detail && <span className="text-small text-muted-foreground">{o.detail}</span>}
					</span>
				</label>
			))}
		</RadioGroup>
	);
}
