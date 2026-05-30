import { BarChart3, Bolt, Code2, Server } from "lucide-react";
import type { Profile, Tool } from "../../types/tool";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  terminal: Bolt,
  code: Code2,
  server: Server,
  chart: BarChart3,
};

interface ProfileCardProps {
  profile: Profile;
  tools: Tool[];
  onSelect: () => void;
}

export function ProfileCard({ profile, tools, onSelect }: ProfileCardProps) {
  const Icon = ICONS[profile.icon] ?? Bolt;
  const count = profile.toolIds.filter((id) => tools.some((t) => t.id === id)).length;
  const installed = profile.toolIds.filter((id) =>
    tools.find((t) => t.id === id && t.isInstalled)
  ).length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-20 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:border-teal-300 hover:bg-teal-50"
    >
      <div className="rounded-lg bg-teal-950 p-2 text-white shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{profile.name}</p>
        <p className="mt-0.5 text-xs font-medium text-slate-500">
          {installed > 0 ? (
            <span className="text-emerald-700">{installed}/</span>
          ) : null}
          {count} tools
        </p>
      </div>
    </button>
  );
}
