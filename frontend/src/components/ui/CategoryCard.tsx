import {
  CheckCircle2,
  Cloud,
  Code2,
  Cpu,
  Database,
  Palette,
  PanelsTopLeft,
  PenLine,
  Terminal,
} from "lucide-react";
import {
  CATEGORY_ICON_COLOR,
  CATEGORY_RING,
} from "../../constants/categories";
import type { Category } from "../../types/tool";

const ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  core: Terminal,
  languages: Code2,
  databases: Database,
  cloud: Cloud,
  editors: PenLine,
  terminal: Cpu,
  dotfiles: Palette,
  apps: PanelsTopLeft,
};

interface CategoryCardProps {
  category: Category;
  label: string;
  description: string;
  toolCount: number;
  installedCount: number;
  isSelected: boolean;
  onToggle: () => void;
}

export function CategoryCard({
  category,
  label,
  description,
  toolCount,
  installedCount,
  isSelected,
  onToggle,
}: CategoryCardProps) {
  const Icon = ICONS[category];
  const ringCls = isSelected ? CATEGORY_RING[category] : "border-slate-200 bg-white";
  const iconCls = CATEGORY_ICON_COLOR[category];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex min-h-36 w-full cursor-pointer flex-col justify-between gap-3 rounded-lg border p-4 text-left ring-2 transition-colors duration-200 hover:border-teal-300 hover:bg-teal-50/50 ${
        isSelected ? `${ringCls} ring-2` : "ring-transparent"
      } ${ringCls}`}
    >
      {isSelected && (
        <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-teal-700" />
      )}
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          <Icon className={`h-6 w-6 ${iconCls}`} />
        </div>
        <div className="min-w-0 pr-5">
          <p className="font-semibold text-slate-950">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <p className="text-xs font-medium text-slate-500">
        {installedCount === toolCount ? (
          <span className="text-emerald-700">All {toolCount} installed</span>
        ) : installedCount > 0 ? (
          <>
            <span className="text-emerald-700">{installedCount} installed</span>
            {" / "}
            {toolCount - installedCount} available
          </>
        ) : (
          `${toolCount} tools available`
        )}
      </p>
    </button>
  );
}
