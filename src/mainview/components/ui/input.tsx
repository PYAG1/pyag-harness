import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"h-8 w-full min-w-0 rounded-md border border-border-control bg-surface-raised px-2.5 text-small text-foreground outline-none transition-colors placeholder:text-ink-faint file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-small file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
				"aria-invalid:border-remove",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
