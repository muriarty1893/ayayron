import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { useApplications } from "../hooks/useApplications";

const ALL_FILTER = { search: "", statuses: [], sortBy: "appliedDate" as const, sortDir: "asc" as const };

export function KanbanPage() {
  const { data: applications = [], isLoading } = useApplications(ALL_FILTER);

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500 text-sm">Loading...</div>;
  }

  return <KanbanBoard applications={applications} />;
}
