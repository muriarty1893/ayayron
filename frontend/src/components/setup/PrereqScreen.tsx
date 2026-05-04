import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Setup Requirements</h1>
          <p className="text-gray-400 text-sm">
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
            className="px-8 py-3 rounded-lg font-semibold transition-colors
              disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
              bg-indigo-600 hover:bg-indigo-500 text-white"
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {isSuccess ? (
            <CheckCircleSolid className="w-5 h-5 text-green-500" />
          ) : isFailed ? (
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          ) : (
            <div className={`w-5 h-5 rounded-full border-2 ${prereq.required ? "border-amber-500" : "border-gray-600"}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white font-medium text-sm">{prereq.name}</span>
            {prereq.required && !isSuccess && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                Required
              </span>
            )}
            {!prereq.required && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                Optional
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs">{prereq.description}</p>
          {prereq.installNote && !isSuccess && (
            <p className="text-gray-500 text-xs mt-1 italic">{prereq.installNote}</p>
          )}

          {showLines && state!.lines.length > 0 && (
            <div className="mt-2 bg-gray-950 rounded p-2 max-h-24 overflow-y-auto">
              {state!.lines.map((line, i) => (
                <p key={i} className="text-xs font-mono text-gray-300 leading-relaxed">{line}</p>
              ))}
            </div>
          )}

          {isFailed && state?.error && (
            <p className="mt-1 text-xs text-red-400">{state.error}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          {isSuccess ? (
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
          ) : isRunning ? (
            <ArrowPathIcon className="w-4 h-4 text-indigo-400 animate-spin" />
          ) : (
            <button
              onClick={onInstall}
              disabled={isRunning}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
