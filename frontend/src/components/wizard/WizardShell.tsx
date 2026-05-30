import { Check, ClipboardList, PackageCheck, Shapes } from "lucide-react";
import type { useInstallation } from "../../hooks/useInstallation";
import type { useWizard, WizardStep } from "../../hooks/useWizard";
import type { Profile, Tool } from "../../types/tool";
import { StepCategories } from "./StepCategories";
import { StepInstall } from "./StepInstall";
import { StepTools } from "./StepTools";

const STEPS: { label: string; step: WizardStep; Icon: typeof Shapes }[] = [
  { label: "Categories", step: 1, Icon: Shapes },
  { label: "Tools", step: 2, Icon: ClipboardList },
  { label: "Install", step: 3, Icon: PackageCheck },
];

interface WizardShellProps {
  wizard: ReturnType<typeof useWizard>;
  installation: ReturnType<typeof useInstallation>;
  tools: Tool[];
  profiles: Profile[];
  platform: string;
}

export function WizardShell({ wizard, installation, tools, profiles, platform }: WizardShellProps) {
  const {
    step,
    selectedCategories,
    selectedToolIds,
    setStep,
    toggleCategory,
    applyProfile,
    toggleTool,
    selectAllInCategory,
    deselectAllInCategory,
    reset,
  } = wizard;

  const selectedTools = tools.filter((t) => selectedToolIds.has(t.id));

  function handleReset() {
    reset();
    installation.reset();
    setStep(1);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-600">Step {step} of 3</p>
          <p className="text-sm font-medium text-slate-500">{STEPS[step - 1].label}</p>
        </div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-sky-600 transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => {
            const isComplete = step > s.step;
            const isActive = step === s.step;
            const Icon = s.Icon;

            return (
              <div
                key={s.step}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                  isActive
                    ? "border-sky-200 bg-sky-50 text-sky-950"
                    : isComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    isActive
                      ? "bg-sky-600 text-white"
                      : isComplete
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-sm font-semibold">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="min-h-[560px]">
        {step === 1 && (
          <StepCategories
            tools={tools}
            profiles={profiles}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            onApplyProfile={applyProfile}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepTools
            tools={tools}
            selectedCategories={selectedCategories}
            selectedToolIds={selectedToolIds}
            platform={platform}
            onToggleTool={toggleTool}
            onSelectAll={selectAllInCategory}
            onDeselectAll={deselectAllInCategory}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepInstall
            selectedTools={selectedTools}
            installation={installation}
            platform={platform}
            onBack={() => setStep(2)}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
