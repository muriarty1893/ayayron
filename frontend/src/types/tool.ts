export interface Prerequisite {
  id: string;
  name: string;
  description: string;
  isInstalled: boolean;
  required: boolean;
  installNote: string;
}

export interface PrereqDoneEvent {
  id: string;
  success: boolean;
  error?: string;
}

export type Category =
  | "core"
  | "languages"
  | "databases"
  | "cloud"
  | "editors"
  | "terminal"
  | "dotfiles"
  | "apps";

export type PermissionLevel = "user" | "admin";

export type InstallStatus = "installed" | "failed" | "skipped";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  section: string;
  permissionLevel: PermissionLevel;
  defaultEnabled: boolean;
  requiresSudo: boolean;
  isInstalled: boolean;
  version?: string;
}

export interface Profile {
  id: string;
  name: string;
  icon: string;
  toolIds: string[];
}

export interface Installation {
  id: number;
  toolId: string;
  toolName: string;
  status: InstallStatus;
  output: string;
  durationMs: number;
  installedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstallStartEvent {
  total: number;
  toolIds: string[];
}

export interface InstallProgressEvent {
  current: number;
  total: number;
  toolId: string;
  toolName: string;
}

export interface InstallLineEvent {
  toolId: string;
  line: string;
  isStderr: boolean;
}

export interface InstallToolDoneEvent {
  toolId: string;
  success: boolean;
  durationMs: number;
}

export interface InstallDoneEvent {
  installed: number;
  failed: number;
  skipped: number;
}
