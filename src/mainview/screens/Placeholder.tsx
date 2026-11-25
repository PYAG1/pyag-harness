import { Link } from "react-router";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/studio/empty-state";

export function Placeholder({ title, message }: { title: string; message: string }) {
	return (
		<main aria-label={title} className="flex flex-1 flex-col overflow-y-auto">
			<header className="flex h-12 shrink-0 items-center border-b border-border px-5">
				<h1 className="text-title">{title}</h1>
			</header>
			<EmptyState message={message} />
		</main>
	);
}

export function NotFound() {
	return (
		<main aria-label="Not found" className="flex flex-1 flex-col">
			<EmptyState
				message="That page doesn't exist."
				action={
					<Link to="/" className={buttonVariants({ variant: "secondary" })}>
						Back to home
					</Link>
				}
			/>
		</main>
	);
}
