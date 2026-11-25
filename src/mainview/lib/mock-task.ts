import type { AgentFamily, OrbState } from "@/lib/orb-palette";

export type StageState = "upcoming" | "done" | "current" | "gate";
export type Stage = { name: string; state: StageState; progress?: string };

export type Agent = {
	id: string;
	name: string;
	role?: string;
	family: AgentFamily;
	state: OrbState;
};

export type ToolKind = "read" | "run" | "edit";

export type ThreadItem =
	| { kind: "user"; id: string; text: string }
	| { kind: "agent"; id: string; agentId: string; time: string; text: string }
	| {
			kind: "tool";
			id: string;
			tool: ToolKind;
			summary: string;
			result?: string;
			failed?: boolean;
			output: string;
	  }
	| {
			kind: "skill";
			id: string;
			skill: string;
			reason: string;
			pickedByAgent?: boolean;
	  }
	| {
			kind: "subagent";
			id: string;
			agentId: string;
			type: string;
			brief: string;
			state: "running" | "returned" | "queued" | "not-started";
			meta: string;
			verified?: boolean;
			steps?: string[];
			report?: string;
			reason?: string;
	  };

export type DiffLine =
	| { type: "ctx" | "add" | "del"; old?: number; new?: number; text: string }
	| { type: "fold"; count: number };
export type DiffHunk = { id: string; lines: DiffLine[] };
export type DiffFile = {
	path: string;
	add: number;
	del: number;
	isNew?: boolean;
	editorId: string;
	hunks: DiffHunk[];
};

export const STAGES: Stage[] = [
	{ name: "Define", state: "done" },
	{ name: "Plan", state: "done" },
	{ name: "Build", state: "current", progress: "3 of 7" },
	{ name: "Verify", state: "upcoming" },
	{ name: "Review", state: "upcoming" },
	{ name: "Ship", state: "upcoming" },
];

export const AGENTS: Agent[] = [
	{ id: "cc-builder", name: "Claude Code", role: "builder", family: "claude-code", state: "running" },
	{ id: "sub-explore-1", name: "Explore", family: "claude-subagent", state: "done" },
	{ id: "sub-gp-1", name: "general-purpose", family: "claude-subagent", state: "running" },
	{ id: "sub-explore-2", name: "Explore", family: "claude-subagent", state: "running" },
];

export const ROOT_AGENT = AGENTS[0];
const AGENT_BY_ID = new Map(AGENTS.map((a) => [a.id, a]));
export const agentById = (id: string) => AGENT_BY_ID.get(id) ?? ROOT_AGENT;

export const THREAD: ThreadItem[] = [
	{
		kind: "user",
		id: "m1",
		text: "The payments retry test fails about one run in five. Find the cause and fix it.",
	},
	{
		kind: "agent",
		id: "m2",
		agentId: "cc-builder",
		time: "10:42",
		text: "I'll reproduce it first, then look at how the retry policy schedules attempts. Sending two subagents to map the adapters and fixtures in parallel.",
	},
	{
		kind: "tool",
		id: "t1",
		tool: "run",
		summary: "Ran `bun test payments`",
		result: "2 failed",
		failed: true,
		output:
			"payments/retry.test.ts\n  ✓ retries on 503 (12ms)\n  ✗ backs off exponentially (31ms)\n    expected 400, received 398\n  ✗ stops after max attempts (8ms)\n\n46 passed, 2 failed",
	},
	{
		kind: "skill",
		id: "k1",
		skill: "debugging-and-error-recovery",
		reason: "bun test failed",
	},
	{
		kind: "subagent",
		id: "s1",
		agentId: "sub-explore-1",
		type: "Explore",
		brief: "Map payment adapters and where retries are scheduled",
		state: "returned",
		meta: "41s · 12 tools · 3.1k",
		verified: true,
		steps: ["Read src/payments/adapters/*.ts", "Searched for setTimeout", "Read src/payments/retry.ts"],
		report:
			"Retries are scheduled in retry.ts via setTimeout with Date.now() deltas. The test uses fake timers but the policy reads the real clock, so jitter leaks in.",
	},
	{
		kind: "subagent",
		id: "s2",
		agentId: "sub-gp-1",
		type: "general-purpose",
		brief: "Rewrite retry policy against an injected clock",
		state: "running",
		meta: "1m 12s · 6 tools",
	},
	{
		kind: "subagent",
		id: "s3",
		agentId: "sub-explore-2",
		type: "Explore",
		brief: "Find fixtures that depend on wall-clock time",
		state: "running",
		meta: "18s · 3 tools",
	},
	{
		kind: "subagent",
		id: "s4",
		agentId: "sub-gp-1",
		type: "general-purpose",
		brief: "Update adapter call sites",
		state: "not-started",
		meta: "1 editor at a time",
		reason: "Another subagent is editing src/payments. Only one editor runs at a time in this project.",
	},
	{
		kind: "tool",
		id: "t2",
		tool: "read",
		summary: "Read 4 files",
		output: "src/payments/retry.ts\nsrc/payments/clock.ts\nsrc/payments/adapters/stripe.ts\ntest/payments/retry.test.ts",
	},
	{
		kind: "tool",
		id: "t3",
		tool: "edit",
		summary: "Edited `src/payments/retry.ts`",
		result: "+24 −9",
		output: "Inject Clock into RetryPolicy; compute delays from clock.now().",
	},
	{
		kind: "agent",
		id: "m3",
		agentId: "cc-builder",
		time: "10:47",
		text: "The policy read the real clock while the test advanced fake timers, so each delay was off by a few milliseconds. RetryPolicy now takes a `Clock`; the test passes it the fake one. Waiting on the fixtures sweep before I run the suite again.",
	},
];

export const DIFF_FILES: DiffFile[] = [
	{
		path: "src/payments/retry.ts",
		add: 24,
		del: 9,
		editorId: "cc-builder",
		hunks: [
			{
				id: "h1",
				lines: [
					{ type: "ctx", old: 1, new: 1, text: 'import type { Clock } from "./clock";' },
					{ type: "ctx", old: 2, new: 2, text: "" },
					{ type: "del", old: 3, text: "export class RetryPolicy {" },
					{ type: "del", old: 4, text: "  constructor(private max = 3) {}" },
					{ type: "add", new: 3, text: "export class RetryPolicy {" },
					{ type: "add", new: 4, text: "  constructor(" },
					{ type: "add", new: 5, text: "    private clock: Clock," },
					{ type: "add", new: 6, text: "    private max = 3," },
					{ type: "add", new: 7, text: "  ) {}" },
					{ type: "ctx", old: 5, new: 8, text: "" },
				],
			},
			{
				id: "h2",
				lines: [
					{ type: "fold", count: 42 },
					{ type: "ctx", old: 48, new: 51, text: "  delayFor(attempt: number) {" },
					{ type: "del", old: 49, text: "    const started = Date.now();" },
					{ type: "add", new: 52, text: "    const started = this.clock.now();" },
					{ type: "ctx", old: 50, new: 53, text: "    return Math.min(100 * 2 ** attempt, 5_000);" },
					{ type: "ctx", old: 51, new: 54, text: "  }" },
				],
			},
		],
	},
	{
		path: "src/payments/clock.ts",
		add: 14,
		del: 0,
		isNew: true,
		editorId: "sub-gp-1",
		hunks: [
			{
				id: "h3",
				lines: [
					{ type: "add", new: 1, text: "export interface Clock {" },
					{ type: "add", new: 2, text: "  now(): number;" },
					{ type: "add", new: 3, text: "}" },
					{ type: "add", new: 4, text: "" },
					{ type: "add", new: 5, text: "export const systemClock: Clock = { now: () => Date.now() };" },
				],
			},
		],
	},
	{
		path: "test/payments/retry.test.ts",
		add: 8,
		del: 3,
		editorId: "cc-builder",
		hunks: [
			{
				id: "h4",
				lines: [
					{ type: "ctx", old: 12, new: 12, text: 'it("backs off exponentially", () => {' },
					{ type: "del", old: 13, text: "  const policy = new RetryPolicy();" },
					{ type: "add", new: 13, text: "  const clock = fakeClock();" },
					{ type: "add", new: 14, text: "  const policy = new RetryPolicy(clock);" },
					{ type: "ctx", old: 14, new: 15, text: "  expect(policy.delayFor(2)).toBe(400);" },
				],
			},
		],
	},
];
