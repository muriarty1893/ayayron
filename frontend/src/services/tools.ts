import {
  CancelInstallation,
  CheckPrerequisites,
  GetInstallationHistory,
  GetPlatform,
  GetProfiles,
  GetTools,
  InstallPrerequisite,
  StartInstallation,
} from "../../wailsjs/go/main/App";
import type { Installation, Profile, Tool } from "../types/tool";

export async function getPlatform(): Promise<string> {
  return GetPlatform();
}

export async function getTools(): Promise<Tool[]> {
  const result = await GetTools();
  return result as unknown as Tool[];
}

export async function getProfiles(): Promise<Profile[]> {
  const result = await GetProfiles();
  return result as unknown as Profile[];
}

export async function startInstallation(toolIDs: string[]): Promise<void> {
  await StartInstallation(toolIDs);
}

export async function cancelInstallation(): Promise<void> {
  await CancelInstallation();
}

export async function getInstallationHistory(limit: number): Promise<Installation[]> {
  const result = await GetInstallationHistory(limit);
  return result as unknown as Installation[];
}

export async function checkPrerequisites(): Promise<import("../types/tool").Prerequisite[]> {
  const result = await CheckPrerequisites();
  return result as unknown as import("../types/tool").Prerequisite[];
}

export async function installPrerequisite(id: string): Promise<void> {
  await InstallPrerequisite(id);
}
