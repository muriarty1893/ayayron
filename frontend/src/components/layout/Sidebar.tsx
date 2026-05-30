import { Clock3, Command, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";
import { usePlatform } from "../../hooks/useTools";

const nav = [
  { to: "/", label: "Setup Wizard", Icon: Wrench },
  { to: "/history", label: "History", Icon: Clock3 },
];

interface SidebarProps {
  title: string;
}

export function Sidebar({ title }: SidebarProps) {
  const { data: platform } = usePlatform();

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-950 text-white">
            <Command className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-slate-950">ayayron</span>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal-700">
              {title}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {platform && (
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              {platform === "windows" ? "Windows" : platform === "darwin" ? "macOS" : "Linux"}
            </span>
          )}
          <nav className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {nav.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
