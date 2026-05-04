import type { Category } from "../types/tool";

export const CATEGORY_ORDER: Category[] = [
  "core",
  "languages",
  "databases",
  "cloud",
  "editors",
  "terminal",
  "apps",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  core: "Core Tools",
  languages: "Languages",
  databases: "Databases",
  cloud: "Cloud & DevOps",
  editors: "Editors",
  terminal: "Terminal",
  apps: "Apps & Fonts",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  core: "git, curl, jq, build tools, utilities…",
  languages: "Node.js, Python, Go, Rust, Java…",
  databases: "PostgreSQL, MySQL, Redis, SQLite…",
  cloud: "Docker, kubectl, AWS CLI, Terraform…",
  editors: "VS Code, Neovim, Vim…",
  terminal: "Starship, tmux, fzf, zoxide, bat…",
  apps: "Browsers, fonts, GUI applications…",
};

// Explicit Tailwind classes — must be full strings (no dynamic concatenation)
export const CATEGORY_RING: Record<Category, string> = {
  core: "ring-blue-500 bg-blue-500/10 border-blue-500/30",
  languages: "ring-indigo-500 bg-indigo-500/10 border-indigo-500/30",
  databases: "ring-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  cloud: "ring-violet-500 bg-violet-500/10 border-violet-500/30",
  editors: "ring-orange-500 bg-orange-500/10 border-orange-500/30",
  terminal: "ring-cyan-500 bg-cyan-500/10 border-cyan-500/30",
  apps: "ring-pink-500 bg-pink-500/10 border-pink-500/30",
};

export const CATEGORY_ICON_COLOR: Record<Category, string> = {
  core: "text-blue-400",
  languages: "text-indigo-400",
  databases: "text-emerald-400",
  cloud: "text-violet-400",
  editors: "text-orange-400",
  terminal: "text-cyan-400",
  apps: "text-pink-400",
};
