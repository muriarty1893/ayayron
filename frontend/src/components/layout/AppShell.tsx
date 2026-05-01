import { Outlet, useLocation } from "react-router-dom";
import { usePlatform } from "../../hooks/useTools";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Setup Wizard",
  "/history": "Installation History",
};

export function AppShell() {
  const location = useLocation();
  const { data: platform } = usePlatform();

  const title = PAGE_TITLES[location.pathname] ?? "Dev Setup";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} platform={platform} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
