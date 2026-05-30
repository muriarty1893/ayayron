import { ArrowLeft, ArrowRight, CheckCheck } from "lucide-react";
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
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            Pick packages
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Choose exactly what gets installed
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Everything below is grouped by the categories you selected. Installed tools stay visible
            so you can decide whether to keep them in the run plan.
          </p>
        </div>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Categories
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{selectedCategories.length}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Selected tools
            </p>
            <p className="mt-1 text-2xl font-semibold text-sky-700">{selectedToolIds.size}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Admin prompts
            </p>
            <p className="mt-1 text-2xl font-semibold text-amber-700">{sudoTools.length}</p>
          </div>
        </div>
      </section>

      <SudoWarning toolNames={sudoTools.map((t) => t.name)} />

      <div className="flex flex-col gap-4">
        {selectedCategories.map((cat) => {
          const catTools = tools.filter((t) => t.category === cat);
          const allSelected = catTools.every((t) => selectedToolIds.has(t.id));
          return (
            <div key={cat} className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">{CATEGORY_LABELS[cat]}</h3>
                  <p className="text-xs text-slate-500">{catTools.length} available tools</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => (allSelected ? onDeselectAll(cat) : onSelectAll(cat))}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
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

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-[#f4f8f7]/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex flex-wrap items-center justify-end gap-4">
          <span className="text-sm font-medium text-slate-500">
            {selectedToolIds.size} tool{selectedToolIds.size !== 1 ? "s" : ""} selected
          </span>
          <button
            type="button"
            disabled={selectedToolIds.size === 0}
            onClick={onNext}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Review install
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
