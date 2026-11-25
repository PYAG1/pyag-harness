import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { Scope } from "@/lib/mock-studio";

export function SettingRow({
	label,
	description,
	scope,
	overrides,
	htmlFor,
	children,
}: {
	label: string;
	description?: string;
	scope?: Scope;
	overrides?: Scope;
	htmlFor?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center gap-4 border-b border-border py-3">
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					<label htmlFor={htmlFor} className="font-medium">
						{label}
					</label>
					{scope && <Badge variant="pill">{scope}</Badge>}
				</div>
				{(description || overrides) && (
					<p className="text-small text-muted-foreground">
						{description}
						{overrides && `${description ? " " : ""}Overrides ${overrides}.`}
					</p>
				)}
			</div>
			<div className="shrink-0">{children}</div>
		</div>
	);
}
