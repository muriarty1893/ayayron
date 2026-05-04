import { LockClosedIcon } from "@heroicons/react/24/outline";
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
      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5 ${
        isSelected ? "bg-white/5" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(tool.id)}
        className="h-4 w-4 rounded border-gray-600 accent-indigo-500"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{tool.name}</p>
        {tool.description && (
          <p className="truncate text-xs text-gray-400">{tool.description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {isAdmin && (
          <span
            className="flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs text-amber-400"
            title="Requires administrator / sudo privileges"
          >
            <LockClosedIcon className="h-3 w-3" />
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
