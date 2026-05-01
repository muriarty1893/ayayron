import {
  CancelInstallation,
  GetInstallationHistory,
  GetPlatform,
  GetProfiles,
  GetTools,
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
