import { useNavigate } from "react-router";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function TaskViewToggle({ taskId, value }: { taskId: string; value: "thread" | "agents" }) {
	const navigate = useNavigate();
	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={(v) => v && navigate(v === "agents" ? `/task/${taskId}/agents` : `/task/${taskId}`)}
			aria-label="Task view"
			className="shrink-0"
		>
			<ToggleGroupItem value="thread">Thread</ToggleGroupItem>
			<ToggleGroupItem value="agents">Agents</ToggleGroupItem>
		</ToggleGroup>
	);
}
