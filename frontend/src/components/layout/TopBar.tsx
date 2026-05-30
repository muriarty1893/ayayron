import { MonitorCog } from "lucide-react";

interface TopBarProps {
  title: string;
  platform?: string;
}

export function TopBar({ title, platform }: TopBarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Build a clean developer workstation from embedded scripts.
        </p>
      </div>
      {platform && (
        <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          <MonitorCog className="h-3.5 w-3.5 text-teal-700" />
          {platform === "windows" ? "Windows" : "Linux"}
        </span>
      )}
    </header>
  );
}
