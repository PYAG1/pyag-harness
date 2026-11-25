import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center border border-transparent whitespace-nowrap select-none transition-colors duration-150 ease-out outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				secondary:
					"bg-secondary text-secondary-foreground border-border-strong hover:bg-surface-hover",
				ghost: "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
				destructive: "text-remove hover:bg-remove-bg",
				outline: "border-border-strong bg-transparent hover:bg-surface-hover",
				link: "text-link underline-offset-2 hover:underline",
				chip: "text-muted-foreground hover:bg-surface-hover hover:text-foreground data-[active=true]:bg-surface-selected data-[active=true]:text-foreground",
			},
			size: {
				default: "h-8 px-3 gap-1.5 rounded-md text-small font-medium",
				sm: "h-6 px-2 gap-1 rounded-md text-caption",
				icon: "size-8 rounded-md",
				"icon-sm": "size-6 rounded-md",
				"icon-round": "size-8 rounded-full",
			},
		},
		compoundVariants: [
			{ variant: "chip", size: "default", className: "h-7 px-2.5 gap-1.5 rounded-full" },
			{ variant: "link", className: "h-auto p-0" },
		],
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
