import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
	"inline-flex items-center justify-center gap-1.5 rounded-md whitespace-nowrap text-muted-foreground transition-colors duration-150 outline-none hover:bg-surface-hover hover:text-foreground disabled:pointer-events-none disabled:opacity-40 data-[state=on]:bg-surface-selected data-[state=on]:text-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				outline: "border border-border-strong bg-transparent",
			},
			size: {
				default: "h-8 min-w-8 px-2 text-small font-medium",
				sm: "h-[26px] min-w-[26px] rounded-[8px] px-2.5 text-caption [&_svg]:size-3.5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Toggle({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
	return (
		<TogglePrimitive.Root
			data-slot="toggle"
			className={cn(toggleVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Toggle, toggleVariants };
