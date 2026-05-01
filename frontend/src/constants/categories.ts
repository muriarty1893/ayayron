import type { Category } from "../types/tool";

export const CATEGORY_ORDER: Category[] = [
  "core",
  "languages",
  "databases",
  "cloud",
  "editors",
  "terminal",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  core: "Core Tools",
  languages: "Languages",
  databases: "Databases",
  cloud: "Cloud & DevOps",
  editors: "Editors",
  terminal: "Terminal",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  core: "git, curl, wget, vim, tmux, htop…",
  languages: "Node.js, Python, Go, Rust, Java…",
  databases: "PostgreSQL, MySQL, Redis, MongoDB…",
  cloud: "Docker, kubectl, AWS CLI, Terraform…",
  editors: "VS Code, Neovim",
  terminal: "Zsh, Starship, fzf, zoxide, bat…",
};

// Explicit Tailwind classes — must be full strings (no dynamic concatenation)
export const CATEGORY_RING: Record<Category, string> = {
  core: "ring-blue-500 bg-blue-500/10 border-blue-500/30",
  languages: "ring-indigo-500 bg-indigo-500/10 border-indigo-500/30",
  databases: "ring-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  cloud: "ring-violet-500 bg-violet-500/10 border-violet-500/30",
  editors: "ring-orange-500 bg-orange-500/10 border-orange-500/30",
  terminal: "ring-cyan-500 bg-cyan-500/10 border-cyan-500/30",
};

export const CATEGORY_ICON_COLOR: Record<Category, string> = {
  core: "text-blue-400",
  languages: "text-indigo-400",
  databases: "text-emerald-400",
  cloud: "text-violet-400",
  editors: "text-orange-400",
  terminal: "text-cyan-400",
};
