import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Item = { id: string };

function SortableRow({
	id,
	label,
	disabled,
	className,
	children,
}: {
	id: string;
	label: string;
	disabled?: boolean;
	className?: string;
	children: ReactNode;
}) {
	const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
		id,
		disabled,
	});
	return (
		<li
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={cn("relative bg-background", isDragging && "z-10 shadow-popover", className)}
		>
			{disabled ? (
				<span className="size-4" aria-hidden />
			) : (
				<button
					ref={setActivatorNodeRef}
					type="button"
					aria-label={`Reorder ${label}`}
					className="flex size-5 cursor-grab items-center justify-center rounded-sm text-ink-faint hover:text-foreground active:cursor-grabbing"
					{...attributes}
					{...listeners}
				>
					<GripVertical className="size-4" />
				</button>
			)}
			{children}
		</li>
	);
}

export function SortableList<T extends Item>({
	items,
	onReorder,
	label,
	itemLabel,
	isLocked,
	rowClassName,
	renderItem,
}: {
	items: T[];
	onReorder: (items: T[]) => void;
	label: string;
	itemLabel: (item: T) => string;
	isLocked?: (item: T) => boolean;
	rowClassName?: string;
	renderItem: (item: T, index: number) => ReactNode;
}) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const onDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		const from = items.findIndex((i) => i.id === active.id);
		const to = items.findIndex((i) => i.id === over.id);
		if (isLocked?.(items[to])) return;
		onReorder(arrayMove(items, from, to));
	};

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
			<SortableContext items={items} strategy={verticalListSortingStrategy}>
				<ol aria-label={label} className="flex flex-col">
					{items.map((item, i) => (
						<SortableRow
							key={item.id}
							id={item.id}
							label={itemLabel(item)}
							disabled={isLocked?.(item)}
							className={rowClassName}
						>
							{renderItem(item, i)}
						</SortableRow>
					))}
				</ol>
			</SortableContext>
		</DndContext>
	);
}
