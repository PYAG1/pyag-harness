export type TaskStatus = "attention" | "running" | "ready" | "done" | "failed";

export type SubagentRow = {
	id: string;
	type: string;
	brief: string;
	state: "running" | "ready" | "idle" | "failed";
	duration: string;
};

export type Task = {
	id: string;
	title: string;
	status: TaskStatus;
	meta: string;
	diff?: { add: number; del: number };
	subagents?: SubagentRow[];
};

export const PROJECT = { name: "brixport", branch: "main" };

export const TASKS: Task[] = [
	{
		id: "t-34",
		title: "Split checkout into steps",
		status: "attention",
		meta: "Plan · approve",
	},
	{
		id: "t-31",
		title: "Fix flaky payments retry test",
		status: "running",
		meta: "CC · 3 sub",
		subagents: [
			{ id: "s1", type: "Explore", brief: "adapters", state: "ready", duration: "41s" },
			{ id: "s2", type: "general-purpose", brief: "retry policy", state: "running", duration: "1m 12s" },
			{ id: "s3", type: "Explore", brief: "fixtures", state: "running", duration: "18s" },
		],
	},
	{
		id: "t-30",
		title: "Add CSV export to invoices",
		status: "running",
		meta: "4m",
	},
	{
		id: "t-28",
		title: "Rename ledger entities",
		status: "ready",
		meta: "",
		diff: { add: 31, del: 4 },
	},
	{
		id: "t-25",
		title: "Upgrade Stripe SDK to v18",
		status: "done",
		meta: "2d",
	},
	{
		id: "t-22",
		title: "Cache exchange rates",
		status: "done",
		meta: "3d",
	},
	{
		id: "t-27",
		title: "Migrate auth to passkeys",
		status: "failed",
		meta: "Usage limit",
	},
];

export const STATUS_GROUPS: { status: TaskStatus; label: string; collapsed?: boolean }[] = [
	{ status: "attention", label: "Needs you" },
	{ status: "running", label: "Running" },
	{ status: "ready", label: "Ready for review" },
	{ status: "done", label: "Done", collapsed: true },
	{ status: "failed", label: "Failed" },
];
