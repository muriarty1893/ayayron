import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useTheme } from "../../hooks/useTheme";
import { ApplicationForm } from "../forms/ApplicationForm";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/applications": "Applications",
  "/kanban": "Kanban Board",
};

export function AppShell() {
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);

  const title = PAGE_TITLES[location.pathname] ?? "Ayayron";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          title={title}
          isDark={isDark}
          onToggleTheme={toggle}
          onAdd={() => setShowForm(true)}
        />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
      {showForm && (
        <ApplicationForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
