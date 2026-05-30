import {
  ArrowLeft,
  CheckCircle2,
  CircleMinus,
  Play,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
import { useState } from "react";
import type { useInstallation } from "../../hooks/useInstallation";
import type { Tool } from "../../types/tool";
import { InstallProgress } from "../install/InstallProgress";
import { LiveTerminal } from "../install/LiveTerminal";
import { InstallPackage } from "../ui/InstallPackage";

interface StepInstallProps {
  selectedTools: Tool[];
  installation: ReturnType<typeof useInstallation>;
  platform: string;
  onBack: () => void;
  onReset: () => void;
}

export function StepInstall({
  selectedTools,
  installation,
  platform,
  onBack,
  onReset,
}: StepInstallProps) {
  const { isRunning, isDone, progress, toolStates, lines, result, error, start, cancel } =
    installation;
  const [acknowledgedDotfiles, setAcknowledgedDotfiles] = useState(false);

  const hasStarted = isRunning || isDone;
  const hasIllogicalImpulse = selectedTools.some(
    (tool) => tool.id === "UserLevel.Dotfiles.illogical-impulse",
  );
  const canBegin = !hasIllogicalImpulse || acknowledgedDotfiles;

  return (
    <div className="flex flex-col gap-5">
      {!hasStarted && (
        <div className="flex flex-col gap-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                Confirm and run
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Review the install plan
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Ayayron will pass these selections to the bundled setup scripts and stream terminal
                output as each package runs.
              </p>
            </div>
            <div className="grid gap-5 p-6 lg:grid-cols-[1fr_420px]">
              <div>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Selected tools</p>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedTools.length} tool{selectedTools.length !== 1 ? "s" : ""} in this run
                </p>
              </div>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Estimated: a few minutes
              </span>
            </div>
            <div className="mb-5 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
              <div className="divide-y divide-slate-200">
                {selectedTools.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950">{t.name}</p>
                      <p className="truncate text-xs text-slate-500">{t.description}</p>
                    </div>
                    {t.isInstalled && (
                      <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        installed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {hasIllogicalImpulse && (
              <label className="mb-5 flex cursor-pointer gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <input
                  type="checkbox"
                  checked={acknowledgedDotfiles}
                  onChange={(event) => setAcknowledgedDotfiles(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-amber-300 accent-amber-600 focus:ring-amber-500"
                />
                <span>
                  Illogical Impulse runs an upstream interactive installer and may overwrite
                  Hyprland, Quickshell, launcher, terminal, and shell config files. Ayayron creates
                  backups of matching config paths before starting it.
                </span>
              </label>
            )}
              </div>
              <InstallPackage platform={platform} selectedTools={selectedTools} />
            </div>
          </section>
          <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-[#f4f8f7]/95 py-4 backdrop-blur">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (canBegin) {
                  start(selectedTools.map((t) => t.id));
                }
              }}
              disabled={!canBegin}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
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
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}

          {isDone && result && (
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-950">Installation Complete</h3>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {result.installed} installed
                </span>
                {result.failed > 0 && (
                  <span className="flex items-center gap-1.5 text-red-700">
                    <TriangleAlert className="h-4 w-4" />
                    {result.failed} failed
                  </span>
                )}
                {result.skipped > 0 && (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <CircleMinus className="h-4 w-4" />
                    {result.skipped} skipped
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Restart your terminal for PATH changes to take effect.
              </p>
              <button
                type="button"
                onClick={onReset}
                className="mt-1 inline-flex cursor-pointer items-center gap-2 self-start rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm font-medium text-red-700">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
