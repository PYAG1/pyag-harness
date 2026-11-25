import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
	return (
		<ToggleGroupPrimitive.Root
			data-slot="toggle-group"
			className={cn("inline-flex w-fit gap-0.5 rounded-md bg-surface-raised p-0.5", className)}
			{...props}
		/>
	);
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
	return (
		<ToggleGroupPrimitive.Item
			data-slot="toggle-group-item"
			className={cn(toggleVariants({ size: "sm" }), "hover:bg-transparent", className)}
			{...props}
		/>
	);
}

export { ToggleGroup, ToggleGroupItem };
