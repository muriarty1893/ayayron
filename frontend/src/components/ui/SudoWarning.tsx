import { TriangleAlert } from "lucide-react";

interface SudoWarningProps {
  toolNames: string[];
}

export function SudoWarning({ toolNames }: SudoWarningProps) {
  if (toolNames.length === 0) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-semibold text-amber-950">Sudo/admin required</p>
        <p className="mt-0.5 text-amber-800">
          {toolNames.join(", ")} - you may be prompted for your password during installation.
        </p>
      </div>
    </div>
  );
}
