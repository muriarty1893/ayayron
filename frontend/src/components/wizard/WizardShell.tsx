import { CheckCircleIcon } from "@heroicons/react/24/solid";
import type { useInstallation } from "../../hooks/useInstallation";
import type { useWizard, WizardStep } from "../../hooks/useWizard";
import type { Profile, Tool } from "../../types/tool";
import { StepCategories } from "./StepCategories";
import { StepInstall } from "./StepInstall";
import { StepTools } from "./StepTools";

const STEPS: { label: string; step: WizardStep }[] = [
  { label: "Categories", step: 1 },
  { label: "Tools", step: 2 },
  { label: "Install", step: 3 },
];

interface WizardShellProps {
  wizard: ReturnType<typeof useWizard>;
  installation: ReturnType<typeof useInstallation>;
  tools: Tool[];
  profiles: Profile[];
  platform: string;
}

export function WizardShell({ wizard, installation, tools, profiles, platform }: WizardShellProps) {
  const { step, selectedCategories, selectedToolIds, setStep, toggleCategory, applyProfile,
    toggleTool, selectAllInCategory, deselectAllInCategory, reset } = wizard;

  const selectedTools = tools.filter((t) => selectedToolIds.has(t.id));

  function handleReset() {
    reset();
    installation.reset();
    setStep(1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const isComplete = step > s.step;
          const isActive = step === s.step;
          return (
            <div key={s.step} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isComplete
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {isComplete ? <CheckCircleIcon className="h-4 w-4" /> : s.step}
              </div>
              <span
                className={`text-sm ${
                  isActive ? "font-semibold text-white" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="mx-2 h-px w-8 bg-white/10" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div>
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
            onBack={() => setStep(2)}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
