import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface SudoWarningProps {
  toolNames: string[];
}

export function SudoWarning({ toolNames }: SudoWarningProps) {
  if (toolNames.length === 0) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
      <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
      <div>
        <p className="font-medium text-amber-200">Sudo/admin required</p>
        <p className="mt-0.5 text-amber-300/80">
          {toolNames.join(", ")} — you may be prompted for your password during installation.
        </p>
      </div>
    </div>
  );
}
