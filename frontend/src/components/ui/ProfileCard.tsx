import {
  BoltIcon,
  ChartBarIcon,
  CodeBracketIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";
import type { Profile, Tool } from "../../types/tool";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  terminal: BoltIcon,
  code: CodeBracketIcon,
  server: ServerIcon,
  chart: ChartBarIcon,
};

interface ProfileCardProps {
  profile: Profile;
  tools: Tool[];
  onSelect: () => void;
}

export function ProfileCard({ profile, tools, onSelect }: ProfileCardProps) {
  const Icon = ICONS[profile.icon] ?? BoltIcon;
  const count = profile.toolIds.filter((id) => tools.some((t) => t.id === id)).length;
  const installed = profile.toolIds.filter((id) =>
    tools.find((t) => t.id === id && t.isInstalled)
  ).length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10"
    >
      <div className="rounded-lg bg-indigo-500/20 p-2">
        <Icon className="h-5 w-5 text-indigo-400" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{profile.name}</p>
        <p className="text-xs text-gray-400">
          {installed > 0 ? (
            <span className="text-emerald-400">{installed}/</span>
          ) : null}
          {count} tools
        </p>
      </div>
    </button>
  );
}
