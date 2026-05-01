import type { Tool } from "../../types/tool";
import { ToolBadge } from "./ToolBadge";

interface ToolItemProps {
  tool: Tool;
  isSelected: boolean;
  onToggle: (id: string) => void;
  platform: string;
}

export function ToolItem({ tool, isSelected, onToggle, platform }: ToolItemProps) {
  const notAvailable =
    (platform === "linux" && !tool.linuxCmd) ||
    (platform === "windows" && !tool.windowsCmd);

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        notAvailable
          ? "cursor-not-allowed opacity-40"
          : "hover:bg-white/5"
      } ${isSelected && !notAvailable ? "bg-white/5" : ""}`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        disabled={notAvailable}
        onChange={() => !notAvailable && onToggle(tool.id)}
        className="h-4 w-4 rounded border-gray-600 accent-indigo-500"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{tool.name}</p>
        <p className="truncate text-xs text-gray-400">{tool.description}</p>
      </div>
      <div className="shrink-0">
        <ToolBadge
          isInstalled={tool.isInstalled}
          requiresSudo={tool.requiresSudo}
          version={tool.version}
        />
        {notAvailable && (
          <span className="text-xs text-gray-500">N/A on {platform}</span>
        )}
      </div>
    </label>
  );
}
