import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  MinusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { ProgressBar } from "@tremor/react";
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
      return <ArrowPathIcon className="h-4 w-4 animate-spin text-indigo-400" />;
    case "success":
      return <CheckCircleIcon className="h-4 w-4 text-emerald-400" />;
    case "failed":
      return <XCircleIcon className="h-4 w-4 text-red-400" />;
    case "skipped":
      return <MinusCircleIcon className="h-4 w-4 text-gray-500" />;
    default:
      return <ClockIcon className="h-4 w-4 text-gray-600" />;
  }
}

export function InstallProgress({ tools, toolStates, progress }: InstallProgressProps) {
  const pct = progress && progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1 flex items-center justify-between text-sm text-gray-400">
          <span>{progress?.currentToolName ? `Installing ${progress.currentToolName}…` : "Preparing…"}</span>
          <span>{pct}%</span>
        </div>
        <ProgressBar value={pct} color="indigo" className="h-2" />
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {tools.map((t) => {
          const state: ToolInstallState = toolStates[t.id] ?? "pending";
          return (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
            >
              <StateIcon state={state} />
              <span className="truncate text-xs text-gray-300">{t.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
