import { SunIcon, MoonIcon, PlusIcon } from "@heroicons/react/24/outline";

interface TopBarProps {
  title: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onAdd?: () => void;
}

export function TopBar({ title, isDark, onToggleTheme, onAdd }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Application
          </button>
        )}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          {isDark ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}
