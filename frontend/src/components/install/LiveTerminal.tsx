import { useEffect, useRef } from "react";
import type { TerminalLine } from "../../hooks/useInstallation";

interface LiveTerminalProps {
  lines: TerminalLine[];
}

export function LiveTerminal({ lines }: LiveTerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="flex h-72 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="ml-2 text-xs font-medium text-slate-400">Terminal Output</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs">
        {lines.length === 0 ? (
          <p className="text-slate-500">Waiting for output...</p>
        ) : (
          lines.map((l, i) => (
            <div key={i} className={l.isStderr ? "text-red-300" : "text-emerald-300"}>
              <span className="mr-2 text-slate-500">[{l.toolId}]</span>
              {l.line}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
