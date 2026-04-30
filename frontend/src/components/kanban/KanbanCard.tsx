import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { MapPinIcon } from "@heroicons/react/24/outline";
import type { JobApplication } from "../../types/application";

interface KanbanCardProps {
  app: JobApplication;
  onClick: () => void;
}

export function KanbanCard({ app, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: app.id,
      data: { status: app.status, app },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-indigo-500 transition-colors select-none"
    >
      <p className="text-sm font-semibold text-white leading-tight">{app.company}</p>
      <p className="text-xs text-gray-400 mt-0.5">{app.position}</p>
      {app.location && (
        <div className="flex items-center gap-1 mt-2">
          <MapPinIcon className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-500">{app.location}</span>
        </div>
      )}
      <p className="text-xs text-gray-600 mt-2">
        {format(new Date(app.appliedDate), "MMM d")}
      </p>
    </div>
  );
}
