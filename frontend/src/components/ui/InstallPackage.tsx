import { Check, Clipboard, FileTerminal } from "lucide-react";
import { useMemo, useState } from "react";
import type { Tool } from "../../types/tool";

interface InstallPackageProps {
  platform: string;
  selectedTools: Tool[];
}

const platformLabel: Record<string, string> = {
  linux: "Linux",
  windows: "Windows",
  darwin: "macOS",
};

export function InstallPackage({ platform, selectedTools }: InstallPackageProps) {
  const [active, setActive] = useState("plan");
  const [copied, setCopied] = useState(false);

  const installPlan = useMemo(
    () => selectedTools.map((tool) => tool.id).join("\n"),
    [selectedTools],
  );

  const adminCount = selectedTools.filter((tool) => tool.permissionLevel === "admin").length;
  const alreadyInstalled = selectedTools.filter((tool) => tool.isInstalled).length;

  const tabs = [
    {
      key: "plan",
      label: "Plan",
      comment: "# Ayayron install plan",
      body: `${selectedTools.length} selected packages\n${alreadyInstalled} already detected\n${adminCount} may request admin privileges`,
    },
    {
      key: "script",
      label: "Script",
      comment: `# ${platformLabel[platform] ?? platform} embedded installer`,
      body:
        platform === "windows"
          ? "PowerShell + winget/scoop routes selected packages"
          : "Bash routes selected packages through the bundled setup script",
    },
    {
      key: "tools",
      label: "Tools",
      comment: "# Selected tool ids",
      body: installPlan || "No tools selected",
    },
  ];

  const activeTab = tabs.find((tab) => tab.key === active) ?? tabs[0];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(activeTab.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = activeTab.body;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
          <FileTerminal className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Install package</h3>
          <p className="text-xs text-slate-500">21st.dev-style tabbed command preview</p>
        </div>
      </div>

      <div className="flex overflow-x-auto border-y border-slate-200 text-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-4 py-2 font-semibold transition-colors ${
              active === tab.key
                ? "border-teal-700 text-teal-800"
                : "border-transparent text-slate-500 hover:text-slate-950"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative m-4 rounded-lg border border-slate-200 bg-slate-950 px-4 py-5 font-mono text-sm shadow-inner">
        <pre className="whitespace-pre-wrap leading-6">
          <code className="text-emerald-300">{activeTab.comment}</code>
          {"\n"}
          <code className="text-orange-200">{activeTab.body}</code>
        </pre>

        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Copy install plan"
          title="Copy install plan"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-300" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
