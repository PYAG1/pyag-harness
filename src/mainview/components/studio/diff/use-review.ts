import { useState } from "react";

import type { DiffFile } from "@/lib/mock-task";

export type Decision = "accepted" | "rejected";

export type CommentAuthor = { kind: "you" } | { kind: "agent"; agentId: string };
export type Comment = { id: string; author: CommentAuthor; text: string };
export type Thread = { key: string; path: string; label: string; comments: Comment[]; resolved: boolean };

let nextId = 0;
const id = () => `c${++nextId}`;

export function useReview(files: DiffFile[], seed: Thread[] = []) {
	const [decisions, setDecisions] = useState<Record<string, Decision>>({});
	const [threads, setThreads] = useState<Record<string, Thread>>(() =>
		Object.fromEntries(seed.map((t) => [t.key, t])),
	);
	const [draft, setDraft] = useState<{ key: string; path: string; label: string } | null>(null);

	const decide = (hunkId: string, d: Decision) => setDecisions((s) => ({ ...s, [hunkId]: d }));

	const startComment = (key: string, path: string, label: string) =>
		threads[key] ? setDraft(null) : setDraft({ key, path, label });

	const addComment = (key: string, text: string) => {
		setThreads((s) => {
			const existing = s[key];
			const base = existing ?? (draft && draft.key === key ? { ...draft, comments: [], resolved: false } : null);
			if (!base) return s;
			return { ...s, [key]: { ...base, comments: [...base.comments, { id: id(), author: { kind: "you" }, text }] } };
		});
		setDraft(null);
	};

	const resolve = (key: string) => setThreads((s) => ({ ...s, [key]: { ...s[key], resolved: true } }));

	const fileAccepted = (f: DiffFile) => f.hunks.every((h) => decisions[h.id] === "accepted");
	const openComments = Object.values(threads).filter((t) => !t.resolved && t.comments.some((c) => c.author.kind === "you"));

	return {
		decisions,
		decide,
		threads,
		draft,
		startComment,
		cancelDraft: () => setDraft(null),
		addComment,
		resolve,
		acceptedCount: files.filter(fileAccepted).length,
		fileAccepted,
		pendingComments: openComments.length,
	};
}

export type Review = ReturnType<typeof useReview>;
