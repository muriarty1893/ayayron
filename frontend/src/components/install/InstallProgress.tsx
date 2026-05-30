import { CheckCircle2, CircleMinus, Clock3, Loader2, XCircle } from "lucide-react";
import type { ToolInstallState } from "../../hooks/useInstallation";
import type { Tool } from "../../types/tool";

interface InstallProgressProps {
  tools: Tool[];
  toolStates: Record<string, ToolInstallState>;
  progress: { current: number; total: number; currentToolName: string } | null;
}

function StateIcon({ state }: { state: ToolInstallState }) {
  switch (state) {
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-teal-700" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-emerald-700" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-700" />;
    case "skipped":
      return <CircleMinus className="h-4 w-4 text-slate-400" />;
    default:
      return <Clock3 className="h-4 w-4 text-slate-400" />;
  }
}

export function InstallProgress({ tools, toolStates, progress }: InstallProgressProps) {
  const pct = progress && progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
          <span>
            {progress?.currentToolName ? `Installing ${progress.currentToolName}...` : "Preparing..."}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-700 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {tools.map((t) => {
          const state: ToolInstallState = toolStates[t.id] ?? "pending";
          return (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <StateIcon state={state} />
              <span className="truncate text-xs font-medium text-slate-700">{t.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
