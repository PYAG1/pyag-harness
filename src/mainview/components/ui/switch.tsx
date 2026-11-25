import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				"peer inline-flex h-5 w-[34px] shrink-0 items-center rounded-full border p-px transition-colors duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-40",
				"data-[state=unchecked]:border-border-control data-[state=unchecked]:bg-surface-raised",
				"data-[state=checked]:border-foreground data-[state=checked]:bg-foreground",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className="pointer-events-none block size-3.5 rounded-full transition-transform duration-150 data-[state=unchecked]:translate-x-px data-[state=unchecked]:bg-muted-foreground data-[state=checked]:translate-x-[15px] data-[state=checked]:bg-background"
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
