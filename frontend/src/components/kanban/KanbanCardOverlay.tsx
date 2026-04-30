import type { JobApplication } from "../../types/application";

export function KanbanCardOverlay({ app }: { app: JobApplication }) {
  return (
    <div className="bg-gray-800 border border-indigo-500 rounded-lg p-3 shadow-2xl rotate-2 w-52">
      <p className="text-sm font-semibold text-white">{app.company}</p>
      <p className="text-xs text-gray-400 mt-0.5">{app.position}</p>
    </div>
  );
}
