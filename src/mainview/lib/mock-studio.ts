import type { DotState } from "@/lib/status";
import type { Agent } from "@/lib/mock-task";

export type AgentTagId = "CC" | "CX";

export const CODEX: Agent = { id: "cx-planner", name: "Codex", role: "planner", family: "codex", state: "done" };
export const CLAUDE: Agent = { id: "cc-builder", name: "Claude Code", role: "builder", family: "claude-code", state: "running" };
export const GENERAL_PURPOSE: Agent = {
	id: "sub-gp-1",
	name: "general-purpose",
	family: "claude-subagent",
	state: "running",
};

export const AGENT_TAGS: { tag: AgentTagId; name: string }[] = [
	{ tag: "CX", name: "Codex" },
	{ tag: "CC", name: "Claude Code" },
];

export type ContextIcon = "instructions" | "skill" | "prompt" | "handoff" | "file" | "report" | "tool" | "runtime";

export type ContextRow = {
	id: string;
	icon: ContextIcon;
	name: string;
	note?: string;
	agents: AgentTagId[];
	tokens: string;
	opaque?: boolean;
	heat: Partial<Record<AgentTagId, number[]>>;
};

export type ContextGroup = { label: string; rows: ContextRow[] };

export const HEAT_STEPS: Record<AgentTagId, number> = { CX: 6, CC: 10 };
export const COMPACTED_BEFORE: Partial<Record<AgentTagId, number>> = { CC: 7 };

export const METERS = [
	{ tag: "CX" as const, name: "Codex", pct: 42 },
	{ tag: "CC" as const, name: "Claude Code", pct: 81 },
];

export const CONTEXT_GROUPS: ContextGroup[] = [
	{
		label: "Shared",
		rows: [
			{
				id: "agents-md",
				icon: "instructions",
				name: "AGENTS.md",
				note: "project instructions",
				agents: ["CX", "CC"],
				tokens: "640",
				heat: { CX: [2, 1, 1, 1, 1, 1], CC: [2, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
			},
			{
				id: "tdd",
				icon: "skill",
				name: "test-driven-development",
				note: "core · Build",
				agents: ["CC"],
				tokens: "520",
				heat: { CC: [3, 2, 2, 3, 2, 1, 1, 2, 2, 1] },
			},
			{
				id: "prompt",
				icon: "prompt",
				name: "Task prompt",
				agents: ["CX", "CC"],
				tokens: "120",
				heat: { CX: [4, 2, 1, 1, 1, 1], CC: [3, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
			},
		],
	},
	{
		label: "Passed on",
		rows: [
			{
				id: "handoff",
				icon: "handoff",
				name: "plan.md",
				note: "handoff from Codex",
				agents: ["CC"],
				tokens: "1.4k",
				heat: { CC: [4, 3, 3, 2, 2, 2, 1, 1, 1, 1] },
			},
		],
	},
	{
		label: "Loaded on the fly",
		rows: [
			{
				id: "debugging",
				icon: "skill",
				name: "debugging-and-error-recovery",
				note: "bun test failed",
				agents: ["CC"],
				tokens: "410",
				heat: { CC: [0, 0, 0, 4, 3, 2, 1, 1, 0, 0] },
			},
		],
	},
	{
		label: "Picked up while working",
		rows: [
			{
				id: "retry-ts",
				icon: "file",
				name: "src/payments/retry.ts",
				agents: ["CX", "CC"],
				tokens: "2.2k",
				heat: { CX: [0, 3, 2, 1, 0, 0], CC: [0, 2, 4, 4, 3, 2, 0, 3, 4, 2] },
			},
			{
				id: "report",
				icon: "report",
				name: "Explore report",
				note: "adapters",
				agents: ["CC"],
				tokens: "3.1k",
				heat: { CC: [0, 0, 0, 0, 0, 4, 3, 1, 1, 1] },
			},
			{
				id: "test-out",
				icon: "tool",
				name: "bun test payments",
				note: "tool output",
				agents: ["CC"],
				tokens: "900",
				heat: { CC: [0, 0, 0, 3, 2, 0, 0, 0, 0, 0] },
			},
		],
	},
];

export const RUNTIME_ROW: ContextRow = {
	id: "runtime",
	icon: "runtime",
	name: "Runtime's own prompt",
	agents: ["CX", "CC"],
	tokens: "—",
	opaque: true,
	heat: { CX: [1, 1, 1, 1, 1, 1], CC: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
};

export type SessionFile = {
	name: string;
	meta: string;
	writer: AgentTagId;
	time: string;
	sections?: ("filled" | "none" | "missing")[];
};

export const SESSION_FILES: SessionFile[] = [
	{
		name: "task.md",
		meta: "10 of 10 sections",
		writer: "CX",
		time: "10:31",
		sections: ["filled", "filled", "filled", "filled", "filled", "none", "filled", "filled", "filled", "filled"],
	},
	{ name: "plan.md", meta: "7 steps", writer: "CX", time: "10:38" },
	{ name: "execution.md", meta: "14 entries", writer: "CC", time: "10:47" },
	{ name: "learnings.md", meta: "2 entries", writer: "CC", time: "10:46" },
	{ name: "ref-payments-clock.md", meta: "from Explore", writer: "CC", time: "10:44" },
];

export type LogWriter = "CC" | "CC › Explore" | "CC › general-purpose" | "CX";

export const EXECUTION_LOG: { time: string; writer: LogWriter; entry: string }[] = [
	{ time: "10:47", writer: "CC", entry: "Injected Clock into RetryPolicy; waiting on fixtures sweep." },
	{ time: "10:46", writer: "CC › general-purpose", entry: "Rewrote delayFor against clock.now()." },
	{ time: "10:45", writer: "CC › Explore", entry: "Found 3 fixtures reading Date.now()." },
	{ time: "10:44", writer: "CC › Explore", entry: "Mapped adapters; retries scheduled in retry.ts." },
	{ time: "10:43", writer: "CC", entry: "Loaded debugging-and-error-recovery after 2 failures." },
	{ time: "10:42", writer: "CC", entry: "Reproduced flake: 2 of 48 failing." },
	{ time: "10:38", writer: "CX", entry: "Plan approved; handed off to Claude Code." },
];

export type Check = { id: string; label: string; summary: string; state: DotState; log: string };

export const CHECKS: Check[] = [
	{
		id: "tests",
		label: "Tests",
		summary: "48 passed",
		state: "ready",
		log: "bun test\n\npayments/retry.test.ts  ✓ 12\npayments/adapters.test.ts  ✓ 21\nledger/*.test.ts  ✓ 15\n\n48 passed, 0 failed (1.92s)",
	},
	{
		id: "lint",
		label: "Lint",
		summary: "2 warnings",
		state: "attention",
		log: "biome check\n\nsrc/payments/clock.ts:5  noExplicitAny  warning\nsrc/payments/retry.ts:52  useConst  warning\n\n0 errors, 2 warnings",
	},
	{ id: "types", label: "Types", summary: "clean", state: "ready", log: "tsc --noEmit\n\nNo errors." },
];

export type LaneBar = { start: number; end: number; state: "done" | "running" | "failed" | "waiting" };
export type Lane = { id: string; label: string; type?: string; child?: boolean; bars: LaneBar[]; spawnAt?: number };

export const LANE_MINUTES = 12;
export const LANE_NOW = 9.5;

export const LANES: Lane[] = [
	{ id: "cx", label: "Codex · planner", bars: [{ start: 0, end: 3.5, state: "done" }] },
	{
		id: "cc",
		label: "Claude Code · builder",
		bars: [
			{ start: 3.5, end: 4.2, state: "waiting" },
			{ start: 4.2, end: 9.5, state: "running" },
		],
	},
	{ id: "s1", label: "adapters", type: "Explore", child: true, spawnAt: 5, bars: [{ start: 5, end: 5.7, state: "done" }] },
	{
		id: "s2",
		label: "retry policy",
		type: "general-purpose",
		child: true,
		spawnAt: 5,
		bars: [{ start: 5, end: 9.5, state: "running" }],
	},
	{ id: "s3", label: "fixtures", type: "Explore", child: true, spawnAt: 8.2, bars: [{ start: 8.2, end: 9.5, state: "running" }] },
];

export type InboxKind = "approval" | "gate" | "failure" | "question";

export type InboxItem = {
	id: string;
	kind: InboxKind;
	agent: Agent;
	via?: string;
	task: string;
	taskId: string;
	kindLabel: string;
	content: string;
	command?: string;
	note?: string;
};

export const INBOX: InboxItem[] = [
	{
		id: "i1",
		kind: "approval",
		agent: GENERAL_PURPOSE,
		via: "Claude Code",
		task: "Fix flaky payments retry test",
		taskId: "t-31",
		kindLabel: "Run command",
		content: "Wants to run",
		command: "bun run db:reset --env=test",
		note: "Resets the local test database. Not seen before in brixport.",
	},
	{
		id: "i2",
		kind: "gate",
		agent: CODEX,
		task: "Split checkout into steps",
		taskId: "t-34",
		kindLabel: "Plan gate",
		content: "Plan ready: 6 steps across checkout and cart.",
		note: "Estimated 25 min · worktree studio/t-34",
	},
	{
		id: "i3",
		kind: "failure",
		agent: CLAUDE,
		task: "Migrate auth to passkeys",
		taskId: "t-27",
		kindLabel: "Stopped",
		content: "Claude Code hit its usage limit at step 4 of 9.",
		note: "Resets at 14:00. Codex can continue now.",
	},
	{
		id: "i4",
		kind: "question",
		agent: CODEX,
		task: "Add CSV export to invoices",
		taskId: "t-30",
		kindLabel: "Question",
		content: "Should exported amounts include tax, or list it as its own column?",
	},
];

export const INBOX_GROUPS: { kind: InboxKind; label: string }[] = [
	{ kind: "approval", label: "Approvals" },
	{ kind: "gate", label: "Gates" },
	{ kind: "failure", label: "Failures" },
	{ kind: "question", label: "Questions" },
];

export const HANDOFF = {
	resetAt: "14:00",
	options: [
		{
			value: "codex",
			label: "Continue in Codex",
			detail: "Picks up from step 4 with the session files below.",
			recommended: true,
		},
		{ value: "wait", label: "Wait for reset", detail: "Claude Code resumes at 14:00 with full context." },
		{ value: "sonnet", label: "Switch to Sonnet", detail: "Same runtime, smaller model. Higher usage headroom." },
	],
	files: [
		{ name: "task.md", meta: "10 of 10 sections" },
		{ name: "plan.md", meta: "9 steps · 3 done" },
		{ name: "execution.md", meta: "22 entries" },
		{ name: "learnings.md", meta: "1 entry" },
	],
	stopped: "1 subagent was stopped mid-run (general-purpose · session store). Its partial edits are kept on the branch.",
	lanes: [
		{ id: "cc", label: "Claude Code", bars: [{ start: 0, end: 7, state: "failed" as const }] },
		{
			id: "sub",
			label: "session store",
			type: "general-purpose",
			child: true,
			spawnAt: 4,
			bars: [{ start: 4, end: 7, state: "failed" as const }],
		},
		{ id: "cx", label: "Codex", bars: [{ start: 7, end: 10, state: "waiting" as const }] },
	] satisfies Lane[],
};

export const SHIP = {
	methods: [
		{ value: "pr", label: "Push branch and open PR", detail: "studio/t-31 → main", action: "Open PR" },
		{ value: "squash", label: "Squash into main", detail: "One commit, no PR", action: "Squash and merge" },
		{ value: "keep", label: "Keep branch only", detail: "Push studio/t-31, decide later", action: "Push branch" },
	],
	message:
		"fix(payments): inject clock into RetryPolicy\n\nThe retry policy read Date.now() while tests advanced fake timers,\nso computed delays drifted by a few ms and the backoff test flaked.\n\n- Add Clock interface with systemClock default\n- RetryPolicy takes a Clock; delayFor uses clock.now()\n- Tests pass fakeClock()",
	learnings: [
		{ id: "l1", tag: "learning", text: "Time-dependent code in payments takes a Clock; tests pass fakeClock()." },
		{ id: "l2", tag: "decision", text: "Retry backoff caps at 5s; jitter stays out of unit tests." },
	],
};

export type Scope = "Global" | "Project" | "Task";

export const ROUTING_RULES = [
	{ id: "r1", locked: true, when: "Any task touching secrets/", runtime: "Claude Code", source: "Global" as const },
	{ id: "r2", locked: false, when: "Plan stage", runtime: "Codex", source: "project" as const },
	{ id: "r3", locked: false, when: "Build stage", runtime: "Claude Code", source: "project" as const },
	{ id: "r4", locked: false, when: "Test-only changes", runtime: "Codex", source: "from Insights" as const },
];

export const RUNTIME_OPTIONS = ["Claude Code", "Codex", "OpenCode"];

export const USAGE = [
	{ name: "Claude Code", pct: 64, window: "resets 14:00" },
	{ name: "Codex", pct: 22, window: "resets Mon" },
];

export type PlanStep = { id: string; title: string; path: string; check: string; tag?: string };

export const PLAN_STEPS: PlanStep[] = [
	{ id: "p1", title: "Extract CheckoutStep type", path: "src/checkout/types.ts", check: "tsc passes", tag: "TDD" },
	{ id: "p2", title: "Split Checkout into Address, Shipping, Payment", path: "src/checkout/Checkout.tsx", check: "3 step components render" },
	{ id: "p3", title: "Add step navigation state", path: "src/checkout/useSteps.ts", check: "back/next unit tests", tag: "TDD" },
	{ id: "p4", title: "Persist progress in cart session", path: "src/cart/session.ts", check: "reload keeps step" },
	{ id: "p5", title: "Map current analytics events", path: "src/analytics/*", check: "no event renamed", tag: "Explore" },
	{ id: "p6", title: "Update checkout e2e", path: "e2e/checkout.spec.ts", check: "e2e green" },
];

export const PLAN_STAGES = [
	{ stage: "Build", runtime: "Claude Code" },
	{ stage: "Verify", runtime: "Codex" },
	{ stage: "Review", runtime: "Claude Code" },
];

export const LIKELY_SKILLS = [
	{ name: "test-driven-development", reason: "3 steps tagged TDD" },
	{ name: "incremental-implementation", reason: "6 steps touch 5 files" },
];

export type Unknown = { id: string; text: string; action: "ask" | "assume" | "read"; label: string };

export const DEFINE_SECTIONS: { id: string; title: string; body?: string; unknowns?: Unknown[] }[] = [
	{ id: "d1", title: "Goal", body: "Split the single-page checkout into three steps so mobile users can finish without scrolling past the fold." },
	{ id: "d2", title: "Users", body: "Shoppers on mobile web; 68% of checkout sessions." },
	{ id: "d3", title: "In scope", body: "Address, Shipping and Payment steps; progress persisted in the cart session." },
	{ id: "d4", title: "Out of scope", body: "Guest checkout changes, payment providers." },
	{
		id: "d5",
		title: "Unknowns",
		unknowns: [
			{ id: "u1", text: "Should the order summary stay visible on every step?", action: "ask", label: "Ask you" },
			{ id: "u2", text: "Do analytics events need new names per step?", action: "assume", label: "Assume no · flagged" },
			{ id: "u3", text: "How does the cart session expire today?", action: "read", label: "Read more" },
		],
	},
	{ id: "d6", title: "Acceptance", body: "e2e checkout passes; no analytics event renamed; step survives reload." },
];

export const DEFINE_CHECKS = [
	{ text: "Goal is measurable", ok: true },
	{ text: "Scope has both in and out", ok: true },
	{ text: "1 unknown needs your answer", ok: false },
];
