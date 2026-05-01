import { CATEGORY_LABELS } from "../../constants/categories";
import type { Category, Tool } from "../../types/tool";
import { SudoWarning } from "../ui/SudoWarning";
import { ToolItem } from "../ui/ToolItem";

interface StepToolsProps {
  tools: Tool[];
  selectedCategories: Category[];
  selectedToolIds: Set<string>;
  platform: string;
  onToggleTool: (id: string) => void;
  onSelectAll: (cat: Category) => void;
  onDeselectAll: (cat: Category) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepTools({
  tools,
  selectedCategories,
  selectedToolIds,
  platform,
  onToggleTool,
  onSelectAll,
  onDeselectAll,
  onBack,
  onNext,
}: StepToolsProps) {
  const selectedTools = tools.filter((t) => selectedToolIds.has(t.id));
  const sudoTools = selectedTools.filter((t) => t.requiresSudo);

  return (
    <div className="flex flex-col gap-5">
      <SudoWarning toolNames={sudoTools.map((t) => t.name)} />

      <div className="flex max-h-[calc(100vh-340px)] flex-col gap-6 overflow-y-auto pr-1">
        {selectedCategories.map((cat) => {
          const catTools = tools.filter((t) => t.category === cat);
          const allSelected = catTools.every((t) => selectedToolIds.has(t.id));
          return (
            <div key={cat}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-300">{CATEGORY_LABELS[cat]}</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => (allSelected ? onDeselectAll(cat) : onSelectAll(cat))}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/5">
                {catTools.map((tool) => (
                  <ToolItem
                    key={tool.id}
                    tool={tool}
                    isSelected={selectedToolIds.has(tool.id)}
                    onToggle={onToggleTool}
                    platform={platform}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {selectedToolIds.size} tool{selectedToolIds.size !== 1 ? "s" : ""} selected
          </span>
          <button
            type="button"
            disabled={selectedToolIds.size === 0}
            onClick={onNext}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Installation →
          </button>
        </div>
      </div>
    </div>
  );
}
