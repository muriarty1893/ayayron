import { Badge } from "@tremor/react";

interface ToolBadgeProps {
  isInstalled: boolean;
  requiresSudo: boolean;
  version?: string;
}

export function ToolBadge({ isInstalled, requiresSudo, version }: ToolBadgeProps) {
  if (isInstalled) {
    return (
      <Badge color="emerald" size="xs">
        {version ? version.slice(0, 20) : "Installed"}
      </Badge>
    );
  }
  if (requiresSudo) {
    return (
      <Badge color="amber" size="xs">
        Sudo
      </Badge>
    );
  }
  return null;
}
