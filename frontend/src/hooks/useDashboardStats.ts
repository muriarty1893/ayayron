import { useQuery } from "@tanstack/react-query";
import * as svc from "../services/applications";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: svc.getDashboardStats,
  });
}

export function useStatusDistribution() {
  return useQuery({
    queryKey: ["statusDist"],
    queryFn: svc.getStatusDistribution,
  });
}

export function useApplicationsOverTime(days: number) {
  return useQuery({
    queryKey: ["timeseries", days],
    queryFn: () => svc.getApplicationsOverTime(days),
  });
}

export function useRecentApplications(limit = 5) {
  return useQuery({
    queryKey: ["recent", limit],
    queryFn: () => svc.getRecentApplications(limit),
  });
}
