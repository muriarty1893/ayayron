import {
  CircleStackIcon,
  CloudIcon,
  CodeBracketIcon,
  CommandLineIcon,
  CpuChipIcon,
  PencilSquareIcon,
  SwatchIcon,
  WindowIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  CATEGORY_ICON_COLOR,
  CATEGORY_RING,
} from "../../constants/categories";
import type { Category } from "../../types/tool";

const ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  core: CommandLineIcon,
  languages: CodeBracketIcon,
  databases: CircleStackIcon,
  cloud: CloudIcon,
  editors: PencilSquareIcon,
  terminal: CpuChipIcon,
  dotfiles: SwatchIcon,
  apps: WindowIcon,
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
  const ringCls = isSelected ? CATEGORY_RING[category] : "border-white/10 bg-white/5";
  const iconCls = CATEGORY_ICON_COLOR[category];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex w-full cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left ring-2 transition-all duration-150 hover:bg-white/10 ${
        isSelected ? `${ringCls} ring-2` : "ring-transparent"
      } ${ringCls}`}
    >
      {isSelected && (
        <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-white/70" />
      )}
      <div className="flex items-center gap-3">
        <div className={`rounded-lg bg-white/5 p-2`}>
          <Icon className={`h-6 w-6 ${iconCls}`} />
        </div>
        <div>
          <p className="font-semibold text-white">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {installedCount === toolCount ? (
          <span className="text-emerald-400">All {toolCount} installed ✓</span>
        ) : installedCount > 0 ? (
          <>
            <span className="text-emerald-400">{installedCount} installed</span>
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
