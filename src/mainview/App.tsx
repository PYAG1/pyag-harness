import { Route, Routes, useNavigate } from "react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RAIL_ITEMS, Rail } from "@/components/studio/rail";
import { SidebarTasks } from "@/components/studio/sidebar-tasks";
import { useShortcut } from "@/lib/shortcuts";
import { Home } from "@/screens/Home";
import { DefineReview } from "@/screens/DefineReview";
import { NeedsYou } from "@/screens/NeedsYou";
import { NotFound, Placeholder } from "@/screens/Placeholder";
import { PlanReview } from "@/screens/PlanReview";
import { Review } from "@/screens/Review";
import { Settings } from "@/screens/Settings";
import { TaskAgents } from "@/screens/TaskAgents";
import { TaskBuild } from "@/screens/TaskBuild";

function useGlobalShortcuts() {
	const navigate = useNavigate();
	useShortcut("newTask", () => {
		navigate("/");
		requestAnimationFrame(() => document.getElementById("composer-input")?.focus());
	});
	useShortcut("settings", () => navigate("/settings"));
	useShortcut("home", () => navigate(RAIL_ITEMS[0].to));
	useShortcut("tasks", () => navigate(RAIL_ITEMS[1].to));
	useShortcut("agents", () => navigate(RAIL_ITEMS[2].to));
	useShortcut("vault", () => navigate(RAIL_ITEMS[3].to));
}

function App() {
	useGlobalShortcuts();
	return (
		<TooltipProvider>
			<SidebarProvider className="h-screen min-h-0 overflow-hidden bg-background text-foreground">
				<Rail />
				<SidebarTasks />
				<SidebarInset className="min-w-0 overflow-hidden">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/task/:id" element={<TaskBuild />} />
						<Route path="/task/:id/review" element={<Review />} />
						<Route path="/task/:id/plan" element={<PlanReview />} />
						<Route path="/task/:id/define" element={<DefineReview />} />
						<Route path="/task/:id/agents" element={<TaskAgents />} />
						<Route path="/inbox" element={<NeedsYou />} />
						<Route
							path="/agents"
							element={<Placeholder title="Agents" message="No agents running. Start a task from Home." />}
						/>
						<Route
							path="/vault"
							element={<Placeholder title="Vault" message="No skills yet. Import a skill pack to start." />}
						/>
						<Route
							path="/insights"
							element={<Placeholder title="Insights" message="Insights appear after your first few tasks." />}
						/>
						<Route path="/settings/*" element={<Settings />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</SidebarInset>
			</SidebarProvider>
			<Toaster />
		</TooltipProvider>
	);
}

export default App;
