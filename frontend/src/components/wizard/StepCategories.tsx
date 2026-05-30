import { ArrowRight, Layers3 } from "lucide-react";
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS, CATEGORY_ORDER } from "../../constants/categories";
import type { Category, Profile, Tool } from "../../types/tool";
import { CategoryCard } from "../ui/CategoryCard";
import { ProfileCard } from "../ui/ProfileCard";

interface StepCategoriesProps {
  tools: Tool[];
  profiles: Profile[];
  selectedCategories: Category[];
  onToggleCategory: (cat: Category) => void;
  onApplyProfile: (toolIds: string[], categories: Category[]) => void;
  onNext: () => void;
}

export function StepCategories({
  tools,
  profiles,
  selectedCategories,
  onToggleCategory,
  onApplyProfile,
  onNext,
}: StepCategoriesProps) {
  function handleProfileSelect(profile: Profile) {
    const toolSet = new Set(profile.toolIds);
    const derivedCats = [
      ...new Set(
        tools
          .filter((t) => toolSet.has(t.id))
          .map((t) => t.category)
      ),
    ] as Category[];
    onApplyProfile(profile.toolIds, derivedCats);
    onNext();
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            Choose a starting point
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            What kind of setup are you building?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Start from a profile when you want a complete baseline, or choose categories for a
            controlled custom install. You will review individual tools on the next page.
          </p>
        </div>
        <div className="px-6 py-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-950">Recommended profiles</p>
            <p className="text-xs font-medium text-slate-500">One click continues to review</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                tools={tools}
                onSelect={() => handleProfileSelect(p)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">Custom categories</p>
            <p className="mt-1 text-sm text-slate-500">
              Select the areas you want Ayayron to prepare.
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            <Layers3 className="mr-1 inline h-3.5 w-3.5" />
            {selectedCategories.length} selected
          </span>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {CATEGORY_ORDER.map((cat) => {
              const catTools = tools.filter((t) => t.category === cat);
              if (catTools.length === 0) {
                return null;
              }
              const installed = catTools.filter((t) => t.isInstalled).length;
              return (
                <CategoryCard
                  key={cat}
                  category={cat}
                  label={CATEGORY_LABELS[cat]}
                  description={CATEGORY_DESCRIPTIONS[cat]}
                  toolCount={catTools.length}
                  installedCount={installed}
                  isSelected={selectedCategories.includes(cat)}
                  onToggle={() => onToggleCategory(cat)}
                />
              );
            })}
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-slate-200 bg-[#f4f8f7]/95 py-4 backdrop-blur">
        <button
          type="button"
          disabled={selectedCategories.length === 0}
          onClick={onNext}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Review tools
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
