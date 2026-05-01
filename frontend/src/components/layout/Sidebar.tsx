import { ClockIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

const nav = [
  { to: "/", label: "Setup Wizard", Icon: WrenchScrewdriverIcon },
  { to: "/history", label: "History", Icon: ClockIcon },
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-56 flex-col border-r border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 px-6 py-5">
        <span className="text-xl font-bold tracking-tight text-white">ayayron</span>
        <p className="mt-0.5 text-xs text-gray-500">Dev Setup</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
