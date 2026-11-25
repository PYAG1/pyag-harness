import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex field-sizing-content min-h-16 w-full rounded-md border border-border-control bg-surface-raised px-2.5 py-1.5 text-small text-foreground outline-none transition-colors placeholder:text-ink-faint disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-remove",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
