import { ShieldAlert } from "lucide-react";
import type { Tool } from "../../types/tool";
import { ToolBadge } from "./ToolBadge";

interface ToolItemProps {
  tool: Tool;
  isSelected: boolean;
  onToggle: (id: string) => void;
  platform: string;
}

export function ToolItem({ tool, isSelected, onToggle, platform: _platform }: ToolItemProps) {
  const isAdmin = tool.permissionLevel === "admin";

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-teal-50/70 ${
        isSelected ? "bg-teal-50" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(tool.id)}
        className="h-4 w-4 rounded border-slate-300 accent-teal-700"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-950">{tool.name}</p>
        {tool.description && (
          <p className="truncate text-xs text-slate-500">{tool.description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {isAdmin && (
          <span
            className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-700"
            title="Requires administrator / sudo privileges"
          >
            <ShieldAlert className="h-3 w-3" />
            sudo
          </span>
        )}
        <ToolBadge
          isInstalled={tool.isInstalled}
          requiresSudo={false}
          version={tool.version}
        />
      </div>
    </label>
  );
}
