import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RUNTIME_OPTIONS } from "@/lib/mock-studio";

export function RuntimeSelect({
	id,
	value,
	onChange,
	label,
}: {
	id?: string;
	value: string;
	onChange: (v: string) => void;
	label: string;
}) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger id={id} aria-label={label}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{RUNTIME_OPTIONS.map((r) => (
					<SelectItem key={r} value={r}>
						{r}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
