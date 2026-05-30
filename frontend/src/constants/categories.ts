import type { Category } from "../types/tool";

export const CATEGORY_ORDER: Category[] = [
  "core",
  "languages",
  "databases",
  "cloud",
  "editors",
  "terminal",
  "dotfiles",
  "apps",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  core: "Core Tools",
  languages: "Languages",
  databases: "Databases",
  cloud: "Cloud & DevOps",
  editors: "Editors",
  terminal: "Terminal",
  dotfiles: "Dotfiles",
  apps: "Apps & Fonts",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  core: "git, curl, jq, build tools, utilities...",
  languages: "Node.js, Python, Go, Rust, Java...",
  databases: "PostgreSQL, MySQL, Redis, SQLite...",
  cloud: "Docker, kubectl, AWS CLI, Terraform...",
  editors: "VS Code, Neovim, Vim...",
  terminal: "Starship, tmux, fzf, zoxide, bat...",
  dotfiles: "Hyprland desktop configs and shells...",
  apps: "Browsers, fonts, GUI applications...",
};

// Explicit Tailwind classes must be full strings (no dynamic concatenation).
export const CATEGORY_RING: Record<Category, string> = {
  core: "ring-sky-500 bg-sky-50 border-sky-200",
  languages: "ring-indigo-500 bg-indigo-50 border-indigo-200",
  databases: "ring-emerald-500 bg-emerald-50 border-emerald-200",
  cloud: "ring-violet-500 bg-violet-50 border-violet-200",
  editors: "ring-orange-500 bg-orange-50 border-orange-200",
  terminal: "ring-cyan-500 bg-cyan-50 border-cyan-200",
  dotfiles: "ring-teal-500 bg-teal-50 border-teal-200",
  apps: "ring-rose-500 bg-rose-50 border-rose-200",
};

export const CATEGORY_ICON_COLOR: Record<Category, string> = {
  core: "text-sky-700",
  languages: "text-indigo-700",
  databases: "text-emerald-700",
  cloud: "text-violet-700",
  editors: "text-orange-700",
  terminal: "text-cyan-700",
  dotfiles: "text-teal-700",
  apps: "text-rose-700",
};
