import { useInstallation } from "../hooks/useInstallation";
import { usePlatform, useProfiles, useTools } from "../hooks/useTools";
import { useWizard } from "../hooks/useWizard";
import { WizardShell } from "../components/wizard/WizardShell";

export function WizardPage() {
  const { data: tools = [] } = useTools();
  const { data: profiles = [] } = useProfiles();
  const { data: platform = "linux" } = usePlatform();

  const wizard = useWizard(tools);
  const installation = useInstallation();

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
