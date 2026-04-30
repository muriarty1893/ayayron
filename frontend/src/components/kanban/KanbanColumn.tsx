import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { STATUS_LABELS, STATUS_BADGE_COLORS } from "../../constants/statuses";
import type { JobApplication, Status } from "../../types/application";

interface KanbanColumnProps {
  status: Status;
  applications: JobApplication[];
  onCardClick: (app: JobApplication) => void;
}

const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
  red: "bg-red-500",
  gray: "bg-gray-500",
};

export function KanbanColumn({ status, applications, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const color = COLOR_CLASSES[STATUS_BADGE_COLORS[status]] ?? "bg-gray-500";

  return (
    <div className="flex flex-col min-w-[200px] w-52 flex-shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          {STATUS_LABELS[status]}
        </span>
        <span className="ml-auto text-xs text-gray-500 bg-gray-800 rounded-full px-2 py-0.5">
          {applications.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 min-h-[120px] transition-colors ${
          isOver ? "bg-indigo-900/30 border border-indigo-500/50" : "bg-gray-900/50"
        }`}
      >
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {applications.map((app) => (
              <KanbanCard key={app.id} app={app} onClick={() => onCardClick(app)} />
            ))}
          </div>
        </SortableContext>
        {applications.length === 0 && (
          <div className="h-16 flex items-center justify-center">
            <span className="text-xs text-gray-600">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}
