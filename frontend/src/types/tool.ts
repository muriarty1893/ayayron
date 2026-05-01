export type Category =
  | "core"
  | "languages"
  | "databases"
  | "cloud"
  | "editors"
  | "terminal";

export type InstallStatus = "installed" | "failed" | "skipped";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  linuxCmd?: string;
  windowsCmd?: string;
  checkCmd: string;
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
