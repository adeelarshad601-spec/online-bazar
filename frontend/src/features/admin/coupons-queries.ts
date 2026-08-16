import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCouponsApi,
  createCouponApi,
  updateCouponApi,
  deleteCouponApi,
  CouponItem,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "./coupons-api";
import { useCurrentUser } from "@/features/auth/queries";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";

export const COUPONS_QUERY_KEY = ["coupons"];

export function useCoupons() {
  const { data: user } = useCurrentUser();

  return useQuery<CouponItem[]>({
    queryKey: COUPONS_QUERY_KEY,
    queryFn: getCouponsApi,
    enabled: Boolean(user && user.role === "ADMIN"),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => createCouponApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      toast.success("Coupon created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useUpdateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCouponPayload }) =>
      updateCouponApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      toast.success("Coupon updated!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useDeleteCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCouponApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      toast.success("Coupon deleted!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
