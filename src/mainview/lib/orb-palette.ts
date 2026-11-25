type OrbPalette = readonly [string, string, string, string];

export type OrbState = "idle" | "running" | "done" | "queued" | "attention" | "failed";

export type AgentFamily =
	| "claude-code"
	| "claude-subagent"
	| "codex"
	| "codex-subagent"
	| "opencode";

const ORB_FAMILIES: Record<AgentFamily, readonly OrbPalette[]> = {
	"claude-code": [["#e2559a", "#7a4ff0", "#d258e3", "#b54fe0"]],
	"claude-subagent": [
		["#f3a6cc", "#b9a3f7", "#eaa6f0", "#d8a8ee"],
		["#f7b8d6", "#c9b8fa", "#f0bdf3", "#e2bdf2"],
		["#eeb3d4", "#c2b0f8", "#efb2f2", "#ddb2ef"],
		["#f0c2dc", "#d3c6fb", "#f4cdf6", "#e9cff5"],
	],
	codex: [
		["#55b3f0", "#6fa8ea", "#e0703f", "#7d9fd8"],
		["#6ec3f2", "#58a0e8", "#f0a060", "#8fb3e0"],
	],
	"codex-subagent": [["#9fd0f6", "#a9c4f2", "#f2b99a", "#b5cbea"]],
	opencode: [["#e3d84b", "#a8ef4a", "#d9e86a", "#9ce84a"]],
};

function hash(s: string): number {
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

export function pickPalette(family: AgentFamily, agentId: string): OrbPalette {
	const list = ORB_FAMILIES[family];
	return list[hash(agentId) % list.length];
}
