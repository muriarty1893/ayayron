import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EventsOn } from "../../wailsjs/runtime/runtime";
import * as svc from "../services/tools";
import type {
  InstallDoneEvent,
  InstallLineEvent,
  InstallProgressEvent,
  InstallStartEvent,
  InstallToolDoneEvent,
} from "../types/tool";

export type ToolInstallState = "pending" | "running" | "success" | "failed" | "skipped";

export interface TerminalLine {
  toolId: string;
  line: string;
  isStderr: boolean;
}

interface InstallProgress {
  current: number;
  total: number;
  currentToolId: string;
  currentToolName: string;
}

interface InstallResult {
  installed: number;
  failed: number;
  skipped: number;
}

export function useInstallation() {
  const qc = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState<InstallProgress | null>(null);
  const [toolStates, setToolStates] = useState<Record<string, ToolInstallState>>({});
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [result, setResult] = useState<InstallResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unsubscribers = useRef<Array<() => void>>([]);

  useEffect(() => {
    const offs = [
      EventsOn("install:start", (data: InstallStartEvent) => {
        setIsRunning(true);
        setIsDone(false);
        setLines([]);
        setResult(null);
        setError(null);
        const initial: Record<string, ToolInstallState> = {};
        data.toolIds.forEach((id) => { initial[id] = "pending"; });
        setToolStates(initial);
        setProgress({ current: 0, total: data.total, currentToolId: "", currentToolName: "" });
      }),
      EventsOn("install:progress", (data: InstallProgressEvent) => {
        setProgress({
          current: data.current,
          total: data.total,
          currentToolId: data.toolId,
          currentToolName: data.toolName,
        });
        setToolStates((prev) => ({ ...prev, [data.toolId]: "running" }));
      }),
      EventsOn("install:line", (data: InstallLineEvent) => {
        setLines((prev) => {
          const next = [...prev, { toolId: data.toolId, line: data.line, isStderr: data.isStderr }];
          // Keep last 2000 lines to avoid memory bloat
          return next.length > 2000 ? next.slice(-2000) : next;
        });
      }),
      EventsOn("install:toolDone", (data: InstallToolDoneEvent) => {
        setToolStates((prev) => ({
          ...prev,
          [data.toolId]: data.success ? "success" : "failed",
        }));
      }),
      EventsOn("install:done", (data: InstallDoneEvent) => {
        setIsRunning(false);
        setIsDone(true);
        setResult({ installed: data.installed, failed: data.failed, skipped: data.skipped });
        qc.invalidateQueries({ queryKey: ["tools"] });
        qc.invalidateQueries({ queryKey: ["history"] });
      }),
    ];
    unsubscribers.current = offs;
    return () => offs.forEach((off) => off());
  }, [qc]);

  const start = useCallback(async (toolIds: string[]) => {
    setError(null);
    try {
      await svc.startInstallation(toolIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start installation");
    }
  }, []);

  const cancel = useCallback(async () => {
    try {
      await svc.cancelInstallation();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsDone(false);
    setProgress(null);
    setToolStates({});
    setLines([]);
    setResult(null);
    setError(null);
  }, []);

  return { isRunning, isDone, progress, toolStates, lines, result, error, start, cancel, reset };
}
