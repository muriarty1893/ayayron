import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  TableCellsIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";

const nav = [
  { to: "/", label: "Dashboard", Icon: HomeIcon },
  { to: "/applications", label: "Applications", Icon: TableCellsIcon },
  { to: "/kanban", label: "Kanban", Icon: ViewColumnsIcon },
];

export function Sidebar() {
  return (
    <aside className="flex flex-col w-56 bg-gray-900 border-r border-gray-800 h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-gray-800">
        <span className="text-xl font-bold tracking-tight text-white">
          ayayron
        </span>
        <p className="text-xs text-gray-500 mt-0.5">Job Tracker</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
