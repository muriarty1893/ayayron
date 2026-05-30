interface ToolBadgeProps {
  isInstalled: boolean;
  requiresSudo: boolean;
  version?: string;
}

export function ToolBadge({ isInstalled, requiresSudo, version }: ToolBadgeProps) {
  if (isInstalled) {
    return (
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
        {version ? version.slice(0, 20) : "Installed"}
      </span>
    );
  }
  if (requiresSudo) {
    return (
      <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
        Sudo
      </span>
    );
  }
  return null;
}
