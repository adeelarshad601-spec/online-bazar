import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getShippingQuoteApi,
  getShippingZonesApi,
  createShippingZoneApi,
  updateShippingZoneApi,
  deleteShippingZoneApi,
  ShippingQuoteRequest,
  ShippingQuoteResponse,
  ShippingZoneItem,
} from "./api";
import { toast } from "sonner";

export const SHIPPING_ZONES_QUERY_KEY = ["shipping", "zones"];

export function useShippingQuote(payload: ShippingQuoteRequest | null, enabled: boolean = true) {
  return useQuery<ShippingQuoteResponse>({
    queryKey: ["shipping", "quote", payload],
    queryFn: () => getShippingQuoteApi(payload!),
    enabled: enabled && Boolean(payload?.shippingAddress?.city && payload?.shippingAddress?.country),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useShippingZones() {
  return useQuery<{ success: boolean; data: ShippingZoneItem[] }>({
    queryKey: SHIPPING_ZONES_QUERY_KEY,
    queryFn: getShippingZonesApi,
  });
}

export function useCreateShippingZoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShippingZoneApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_ZONES_QUERY_KEY });
      toast.success(data.message || "Shipping zone created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create shipping zone");
    },
  });
}

export function useUpdateShippingZoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateShippingZoneApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_ZONES_QUERY_KEY });
      toast.success(data.message || "Shipping zone updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update shipping zone");
    },
  });
}

export function useDeleteShippingZoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteShippingZoneApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_ZONES_QUERY_KEY });
      toast.success(data.message || "Shipping zone deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete shipping zone");
    },
  });
}
