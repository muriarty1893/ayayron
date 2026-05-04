import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import * as svc from "../services/tools";
import type { Prerequisite, PrereqDoneEvent } from "../types/tool";

export interface PrereqInstallState {
  status: "idle" | "running" | "success" | "failed";
  lines: string[];
  error?: string;
}

export function usePrereqs() {
  const { data: prereqs = [], isLoading, refetch } = useQuery<Prerequisite[]>({
    queryKey: ["prereqs"],
    queryFn: svc.checkPrerequisites,
    staleTime: 0,
  });

  const [installStates, setInstallStates] = useState<Record<string, PrereqInstallState>>({});
  const unsubscribers = useRef<Array<() => void>>([]);

  useEffect(() => {
    const offs = [
      EventsOn("install:line", (data: { toolId: string; line: string }) => {
        setInstallStates((prev) => {
          const cur = prev[data.toolId];
          if (!cur) return prev;
          return {
            ...prev,
            [data.toolId]: { ...cur, lines: [...cur.lines, data.line] },
          };
        });
      }),
      EventsOn("prereq:done", (data: PrereqDoneEvent) => {
        setInstallStates((prev) => ({
          ...prev,
          [data.id]: {
            status: data.success ? "success" : "failed",
            lines: prev[data.id]?.lines ?? [],
            error: data.error,
          },
        }));
        refetch();
      }),
    ];
    unsubscribers.current = offs;
    return () => offs.forEach((off) => off());
  }, [refetch]);

  const install = useCallback(async (id: string) => {
    setInstallStates((prev) => ({
      ...prev,
      [id]: { status: "running", lines: [] },
    }));
    try {
      await svc.installPrerequisite(id);
    } catch (err) {
      setInstallStates((prev) => ({
        ...prev,
        [id]: {
          status: "failed",
          lines: prev[id]?.lines ?? [],
          error: err instanceof Error ? err.message : "Failed to install",
        },
      }));
    }
  }, []);

  const missingRequired = prereqs.filter((p) => p.required && !p.isInstalled);
  const allRequiredMet = missingRequired.length === 0;

  return { prereqs, isLoading, installStates, install, allRequiredMet, missingRequired };
}
