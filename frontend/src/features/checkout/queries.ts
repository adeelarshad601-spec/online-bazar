import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processCheckoutApi } from "./api";
import { CheckoutInput, CheckoutApiResponse } from "./schemas";
import { CART_QUERY_KEY } from "@/features/cart/queries";
import { ORDERS_QUERY_KEY } from "@/features/orders/queries";
import { toast } from "sonner";

export function useCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<CheckoutApiResponse, any, CheckoutInput>({
    mutationFn: (payload: CheckoutInput) => processCheckoutApi(payload),
    onSuccess: (data) => {
      // Immediately reset cart cache structure without corrupting shape
      queryClient.setQueryData(CART_QUERY_KEY, (oldData: any) => {
        if (!oldData) return { items: [], totalItems: 0, totalAmount: 0 };
        return {
          ...oldData,
          items: [],
          totalItems: 0,
          totalAmount: 0,
        };
      });

      // Invalidate cart and orders query for server synchronization across application
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      toast.success(data.message || "Order placed successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors)
          ? error.response?.data?.errors[0]?.message
          : null) ||
        "Checkout failed. Please check your shipping details and try again.";
      toast.error(message);
    },
  });
}
