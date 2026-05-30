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
      {/* Quick start presets */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Quick Start
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      <div className="border-t border-white/10" />

      {/* Category grid */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Or select categories
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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

      <div className="flex justify-end">
        <button
          type="button"
          disabled={selectedCategories.length === 0}
          onClick={onNext}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
