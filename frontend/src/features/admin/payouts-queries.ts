import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPayoutsApi,
  updateAdminPayoutStatusApi,
  AdminPayoutsData,
  AdminPayoutItem,
} from "./payouts-api";

export function useAdminPayouts(status?: string) {
  return useQuery<AdminPayoutsData>({
    queryKey: ["admin-payouts", status],
    queryFn: () => getAdminPayoutsApi(status),
  });
}

export function useUpdateAdminPayoutStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    }) => updateAdminPayoutStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["seller-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] });
    },
  });
}
