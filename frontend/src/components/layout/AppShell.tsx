import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Setup Wizard",
  "/history": "Installation History",
};

export function AppShell() {
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] ?? "Dev Setup";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f8f7]">
      <Sidebar title={title} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-6xl px-5 py-7 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
