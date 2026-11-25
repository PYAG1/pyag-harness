import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Composer } from "@/components/studio/composer";
import { SetupNudge } from "@/components/studio/setup-nudge";
import { StatusDot } from "@/components/studio/status-dot";
import { PROJECT, TASKS } from "@/lib/mock-data";

const RUNNING = TASKS.filter((t) => t.status === "running");
const AGENTS_RUNNING = RUNNING.reduce(
	(n, t) => n + 1 + (t.subagents?.filter((s) => s.state === "running").length ?? 0),
	0,
);
const NEEDS_YOU = TASKS.filter((t) => t.status === "attention").length;

export function Home() {
	const navigate = useNavigate();
	const [nudge, setNudge] = useState(true);

	return (
		<main aria-label="Home" className="flex flex-1 flex-col items-center overflow-y-auto px-6">
			<div className="flex w-full max-w-[760px] flex-1 flex-col items-center justify-center gap-6 py-12">
				<div className="flex flex-wrap items-center justify-center gap-2">
					{RUNNING.length > 0 && (
						<Badge variant="status" asChild>
							<Link to={`/task/${RUNNING[0].id}`} className="hover:text-foreground">
								<StatusDot state="running" />
								{AGENTS_RUNNING} agents running · {RUNNING.length} tasks
							</Link>
						</Badge>
					)}
					{NEEDS_YOU > 0 && (
						<Badge variant="status" asChild>
							<Link to="/inbox" className="text-status-attention">
								<StatusDot state="attention" />
								{NEEDS_YOU} plan needs you
							</Link>
						</Badge>
					)}
				</div>

				<h1 className="text-display">What should we build?</h1>

				<Composer
					scope
					onSubmit={() => {
						toast("Task created");
						navigate(`/task/${RUNNING[0].id}`);
					}}
				/>

				{nudge && (
					<SetupNudge
						icon={ShieldCheck}
						title={`Allow edits without asking in ${PROJECT.name}?`}
						description="You approved every file edit in your last 12 tasks here."
						confirmLabel={`Turn on for ${PROJECT.name}`}
						onConfirm={() => {
							setNudge(false);
							toast(`Edits allowed in ${PROJECT.name}`);
						}}
						onDismiss={() => setNudge(false)}
					/>
				)}
			</div>
		</main>
	);
}
