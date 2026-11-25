import { Check, File } from "lucide-react";

import { DiffStat } from "@/components/studio/diff/diff-stat";
import type { Review } from "@/components/studio/diff/use-review";
import type { DiffFile } from "@/lib/mock-task";
import { cn } from "@/lib/utils";

const split = (path: string) => {
	const i = path.lastIndexOf("/");
	return i === -1 ? ["", path] : [path.slice(0, i + 1), path.slice(i + 1)];
};

export function FileTree({
	files,
	review,
	selected,
	onSelect,
}: {
	files: DiffFile[];
	review: Review;
	selected: string;
	onSelect: (path: string) => void;
}) {
	return (
		<nav aria-label="Changed files" className="flex flex-col gap-2 p-3">
			<p className="px-1 text-caption text-ink-faint">
				{files.length} files · {review.acceptedCount} of {files.length} accepted
			</p>
			<ul className="flex flex-col gap-px">
				{files.map((f) => {
					const [dir, base] = split(f.path);
					const accepted = review.fileAccepted(f);
					return (
						<li key={f.path}>
							<button
								type="button"
								aria-current={f.path === selected ? "true" : undefined}
								onClick={() => onSelect(f.path)}
								className={cn(
									"flex h-[30px] w-full items-center gap-2 rounded-md px-2 text-left font-mono text-code-sm hover:bg-surface-hover",
									f.path === selected && "bg-surface-selected hover:bg-surface-selected",
								)}
							>
								{accepted ? (
									<Check className="size-3.5 shrink-0 text-add" aria-label="Accepted" />
								) : (
									<File className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
								)}
								<span className="min-w-0 flex-1 truncate">
									<span className="text-ink-faint">{dir}</span>
									{base}
								</span>
								<DiffStat add={f.add} del={f.del} />
							</button>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
