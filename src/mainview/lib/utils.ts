import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			text: ["display", "title", "body", "small", "caption", "code", "code-sm", "prompt", "micro"],
			radius: ["sm", "md", "lg", "xl"],
			shadow: ["popover"],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
