import type * as React from "react";
import { CircleAlert, CircleCheck, Info, Loader2, X } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useTheme } from "@/lib/theme";

const Toaster = ({ ...props }: ToasterProps) => {
	const { resolved } = useTheme();

	return (
		<Sonner
			theme={resolved}
			position="bottom-right"
			visibleToasts={3}
			className="toaster group"
			icons={{
				success: <CircleCheck className="size-4 text-add" />,
				info: <Info className="size-4" />,
				warning: <CircleAlert className="size-4 text-status-attention" />,
				error: <X className="size-4 text-remove" />,
				loading: <Loader2 className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border-strong)",
					"--border-radius": "14px",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
