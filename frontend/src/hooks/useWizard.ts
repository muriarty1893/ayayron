import { useCallback, useState } from "react";
import type { Category, Tool } from "../types/tool";

export type WizardStep = 1 | 2 | 3;

interface WizardState {
  step: WizardStep;
  selectedCategories: Category[];
  selectedToolIds: Set<string>;
}

export function useWizard(tools: Tool[]) {
  const [state, setState] = useState<WizardState>({
    step: 1,
    selectedCategories: [],
    selectedToolIds: new Set(),
  });

  const setStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const toggleCategory = useCallback((cat: Category) => {
    setState((prev) => {
      const arr = [...prev.selectedCategories];
      const idx = arr.indexOf(cat);
      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        arr.push(cat);
      }
      return { ...prev, selectedCategories: arr };
    });
  }, []);

  const applyProfile = useCallback(
    (toolIds: string[], categories: Category[]) => {
      setState((prev) => ({
        ...prev,
        selectedCategories: categories,
        selectedToolIds: new Set(toolIds),
      }));
    },
    []
  );

  const toggleTool = useCallback((toolId: string) => {
    setState((prev) => {
      const next = new Set(prev.selectedToolIds);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return { ...prev, selectedToolIds: next };
    });
  }, []);

  const selectAllInCategory = useCallback(
    (cat: Category) => {
      const catTools = tools.filter((t) => t.category === cat).map((t) => t.id);
      setState((prev) => {
        const next = new Set(prev.selectedToolIds);
        catTools.forEach((id) => next.add(id));
        return { ...prev, selectedToolIds: next };
      });
    },
    [tools]
  );

  const deselectAllInCategory = useCallback(
    (cat: Category) => {
      const catTools = tools.filter((t) => t.category === cat).map((t) => t.id);
      setState((prev) => {
        const next = new Set(prev.selectedToolIds);
        catTools.forEach((id) => next.delete(id));
        return { ...prev, selectedToolIds: next };
      });
    },
    [tools]
  );

  const reset = useCallback(() => {
    setState({ step: 1, selectedCategories: [], selectedToolIds: new Set() });
  }, []);

  return {
    step: state.step,
    selectedCategories: state.selectedCategories,
    selectedToolIds: state.selectedToolIds,
    setStep,
    toggleCategory,
    applyProfile,
    toggleTool,
    selectAllInCategory,
    deselectAllInCategory,
    reset,
  };
}
