import { cn } from "@/lib/utils";

export function DiffStat({ add, del, className }: { add: number; del: number; className?: string }) {
	return (
		<span className={cn("shrink-0 font-mono text-code-sm whitespace-nowrap", className)}>
			<span className="text-add">+{add}</span> <span className="text-remove">−{del}</span>
		</span>
	);
}
