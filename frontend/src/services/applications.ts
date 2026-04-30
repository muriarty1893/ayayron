import {
  ListApplications,
  GetApplication,
  CreateApplication,
  UpdateApplication,
  DeleteApplication,
  UpdateStatus,
  GetDashboardStats,
  GetStatusDistribution,
  GetApplicationsOverTime,
  GetRecentApplications,
} from "../../wailsjs/go/main/App";

import type {
  JobApplication,
  ListFilter,
  ApplicationInput,
  DashboardStats,
  StatusCount,
  TimeSeriesPoint,
} from "../types/application";

export async function listApplications(filter: ListFilter): Promise<JobApplication[]> {
  const result = await ListApplications(filter as never);
  return result as unknown as JobApplication[];
}

export async function getApplication(id: number): Promise<JobApplication> {
  const result = await GetApplication(id);
  return result as unknown as JobApplication;
}

export async function createApplication(input: ApplicationInput): Promise<JobApplication> {
  const result = await CreateApplication(input as never);
  return result as unknown as JobApplication;
}

export async function updateApplication(id: number, input: ApplicationInput): Promise<JobApplication> {
  const result = await UpdateApplication(id, input as never);
  return result as unknown as JobApplication;
}

export async function deleteApplication(id: number): Promise<void> {
  await DeleteApplication(id);
}

export async function updateStatus(id: number, status: string): Promise<JobApplication> {
  const result = await UpdateStatus(id, status as never);
  return result as unknown as JobApplication;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const result = await GetDashboardStats();
  return result as unknown as DashboardStats;
}

export async function getStatusDistribution(): Promise<StatusCount[]> {
  const result = await GetStatusDistribution();
  return result as unknown as StatusCount[];
}

export async function getApplicationsOverTime(days: number): Promise<TimeSeriesPoint[]> {
  const result = await GetApplicationsOverTime(days);
  return result as unknown as TimeSeriesPoint[];
}

export async function getRecentApplications(limit: number): Promise<JobApplication[]> {
  const result = await GetRecentApplications(limit);
  return result as unknown as JobApplication[];
}
