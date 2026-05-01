interface TopBarProps {
  title: string;
  platform?: string;
}

export function TopBar({ title, platform }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-6 py-4">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      {platform && (
        <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-400">
          {platform === "windows" ? "Windows" : "Linux"}
        </span>
      )}
    </header>
  );
}
