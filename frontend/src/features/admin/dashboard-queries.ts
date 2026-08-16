import { useQuery } from "@tanstack/react-query";
import { getAdminStatsApi, AdminStatsData } from "./dashboard-api";
import { useCurrentUser } from "@/features/auth/queries";

export const ADMIN_STATS_QUERY_KEY = ["adminStats"];

export function useAdminStats() {
  const { data: user } = useCurrentUser();

  return useQuery<AdminStatsData>({
    queryKey: ADMIN_STATS_QUERY_KEY,
    queryFn: getAdminStatsApi,
    enabled: Boolean(user && user.role === "ADMIN"),
    staleTime: 1000 * 60 * 2,
  });
}
