import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

interface TopBarProps {
  title: string;
  isDark: boolean;
  onToggleTheme: () => void;
  platform?: string;
}

export function TopBar({ title, isDark, onToggleTheme, platform }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-6 py-4">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        {platform && (
          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-400">
            {platform === "windows" ? "Windows" : "Linux"}
          </span>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
