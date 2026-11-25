import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SkillMarker({
	skill,
	reason,
	pickedByAgent,
	onView,
	onMute,
}: {
	skill: string;
	reason: string;
	pickedByAgent?: boolean;
	onView?: () => void;
	onMute?: () => void;
}) {
	return (
		<div role="note" className="marker">
			<span className="flex items-center gap-2">
				<Zap className="size-3.5" aria-hidden />
				<span>
					<b className={cn("font-mono font-medium", pickedByAgent ? "text-muted-foreground" : "text-foreground")}>
						{skill}
					</b>{" "}
					{pickedByAgent ? "picked by agent" : `loaded · ${reason}`}
				</span>
				<Button variant="ghost" size="sm" onClick={onView}>
					View
				</Button>
				{!pickedByAgent && (
					<Button variant="ghost" size="sm" onClick={onMute}>
						Mute here
					</Button>
				)}
			</span>
		</div>
	);
}
