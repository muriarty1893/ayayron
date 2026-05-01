import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";
import type { useInstallation } from "../../hooks/useInstallation";
import type { Tool } from "../../types/tool";
import { InstallProgress } from "../install/InstallProgress";
import { LiveTerminal } from "../install/LiveTerminal";

interface StepInstallProps {
  selectedTools: Tool[];
  installation: ReturnType<typeof useInstallation>;
  onBack: () => void;
  onReset: () => void;
}

export function StepInstall({ selectedTools, installation, onBack, onReset }: StepInstallProps) {
  const { isRunning, isDone, progress, toolStates, lines, result, error, start, cancel } =
    installation;

  const hasStarted = isRunning || isDone;

  return (
    <div className="flex flex-col gap-5">
      {!hasStarted && (
        <div>
          <p className="mb-4 text-sm text-gray-400">
            Ready to install {selectedTools.length} tool{selectedTools.length !== 1 ? "s" : ""}.
            This may take a few minutes.
          </p>
          <div className="mb-5 rounded-xl border border-white/10 bg-white/5 divide-y divide-white/5 max-h-52 overflow-y-auto">
            {selectedTools.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.description}</p>
                </div>
                {t.isInstalled && (
                  <span className="text-xs text-emerald-400">already installed</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => start(selectedTools.map((t) => t.id))}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Begin Installation
            </button>
          </div>
        </div>
      )}

      {hasStarted && (
        <div className="flex flex-col gap-4">
          <InstallProgress
            tools={selectedTools}
            toolStates={toolStates}
            progress={progress}
          />
          <LiveTerminal lines={lines} />

          {isRunning && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={cancel}
                className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                Cancel
              </button>
            </div>
          )}

          {isDone && result && (
            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold text-white">Installation Complete</h3>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircleIcon className="h-4 w-4" />
                  {result.installed} installed
                </span>
                {result.failed > 0 && (
                  <span className="flex items-center gap-1.5 text-red-400">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    {result.failed} failed
                  </span>
                )}
                {result.skipped > 0 && (
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <MinusCircleIcon className="h-4 w-4" />
                    {result.skipped} skipped
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Restart your terminal for PATH changes to take effect.
              </p>
              <button
                type="button"
                onClick={onReset}
                className="mt-1 self-start rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
              >
                Start Over
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
