import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import type { Prerequisite } from "../../types/tool";
import type { PrereqInstallState } from "../../hooks/usePrereqs";

interface Props {
  prereqs: Prerequisite[];
  installStates: Record<string, PrereqInstallState>;
  onInstall: (id: string) => void;
  onContinue: () => void;
  allRequiredMet: boolean;
}

export function PrereqScreen({ prereqs, installStates, onInstall, onContinue, allRequiredMet }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            Setup gate
          </p>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-950">
            Setup Requirements
          </h1>
          <p className="text-sm text-slate-600">
            These dependencies are needed before installing tools. Required items must be installed to continue.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {prereqs.map((prereq) => (
            <PrereqRow
              key={prereq.id}
              prereq={prereq}
              state={installStates[prereq.id]}
              onInstall={() => onInstall(prereq.id)}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onContinue}
            disabled={!allRequiredMet}
            className="cursor-pointer rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {allRequiredMet ? "Continue to Setup" : "Install required items to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  prereq: Prerequisite;
  state?: PrereqInstallState;
  onInstall: () => void;
}

function PrereqRow({ prereq, state, onInstall }: RowProps) {
  const isRunning = state?.status === "running";
  const isSuccess = state?.status === "success" || prereq.isInstalled;
  const isFailed = state?.status === "failed";
  const showLines = isRunning || isFailed;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
          ) : isFailed ? (
            <TriangleAlert className="h-5 w-5 text-red-700" />
          ) : (
            <div className={`h-5 w-5 rounded-full border-2 ${prereq.required ? "border-amber-500" : "border-slate-300"}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-slate-950">{prereq.name}</span>
            {prereq.required && !isSuccess && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                Required
              </span>
            )}
            {!prereq.required && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Optional
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{prereq.description}</p>
          {prereq.installNote && !isSuccess && (
            <p className="mt-1 text-xs italic text-slate-400">{prereq.installNote}</p>
          )}

          {showLines && state!.lines.length > 0 && (
            <div className="mt-2 max-h-24 overflow-y-auto rounded bg-slate-950 p-2">
              {state!.lines.map((line, i) => (
                <p key={i} className="font-mono text-xs leading-relaxed text-slate-200">{line}</p>
              ))}
            </div>
          )}

          {isFailed && state?.error && (
            <p className="mt-1 text-xs text-red-700">{state.error}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          ) : isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin text-teal-700" />
          ) : (
            <button
              onClick={onInstall}
              disabled={isRunning}
              className="cursor-pointer rounded-lg bg-teal-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
