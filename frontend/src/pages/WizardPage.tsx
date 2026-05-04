import { useInstallation } from "../hooks/useInstallation";
import { usePlatform, useProfiles, useTools } from "../hooks/useTools";
import { useWizard } from "../hooks/useWizard";
import { usePrereqs } from "../hooks/usePrereqs";
import { WizardShell } from "../components/wizard/WizardShell";
import { PrereqScreen } from "../components/setup/PrereqScreen";

export function WizardPage() {
  const { data: tools = [] } = useTools();
  const { data: profiles = [] } = useProfiles();
  const { data: platform = "linux" } = usePlatform();

  const wizard = useWizard(tools);
  const installation = useInstallation();
  const { prereqs, isLoading, installStates, install, allRequiredMet } = usePrereqs();

  if (!isLoading && !allRequiredMet) {
    return (
      <PrereqScreen
        prereqs={prereqs}
        installStates={installStates}
        onInstall={install}
        onContinue={() => {}}
        allRequiredMet={allRequiredMet}
      />
    );
  }

  return (
    <WizardShell
      wizard={wizard}
      installation={installation}
      tools={tools}
      profiles={profiles}
      platform={platform}
    />
  );
}
