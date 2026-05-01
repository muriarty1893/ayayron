import { useQuery } from "@tanstack/react-query";
import * as svc from "../services/tools";

export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: svc.getTools,
    staleTime: Infinity,
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: svc.getProfiles,
    staleTime: Infinity,
  });
}

export function usePlatform() {
  return useQuery({
    queryKey: ["platform"],
    queryFn: svc.getPlatform,
    staleTime: Infinity,
  });
}

export function useInstallationHistory(limit = 100) {
  return useQuery({
    queryKey: ["history", limit],
    queryFn: () => svc.getInstallationHistory(limit),
  });
}
