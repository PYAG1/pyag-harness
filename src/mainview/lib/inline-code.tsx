import type { ReactNode } from "react";

export function inlineCode(text: string): ReactNode[] {
	return text.split(/(`[^`]+`)/g).map((part, i) =>
		part.startsWith("`") && part.endsWith("`") ? (
			<code key={i} className="rounded-sm bg-surface-raised px-1 font-mono text-code">
				{part.slice(1, -1)}
			</code>
		) : (
			part
		),
	);
}
