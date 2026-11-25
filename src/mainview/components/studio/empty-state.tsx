import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader } from "@/components/ui/empty";

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyDescription>{message}</EmptyDescription>
			</EmptyHeader>
			{action && <EmptyContent>{action}</EmptyContent>}
		</Empty>
	);
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<Alert variant="destructive" className="items-center">
			<CircleAlert />
			<AlertDescription className="flex items-center gap-2 text-small text-foreground">
				<span className="flex-1">{message}</span>
				<Button variant="secondary" onClick={onRetry}>
					Retry
				</Button>
			</AlertDescription>
		</Alert>
	);
}
