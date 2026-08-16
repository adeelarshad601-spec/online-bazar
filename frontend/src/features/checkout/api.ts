import apiClient from "@/lib/api/client";
import { CheckoutInput, CheckoutApiResponse } from "./schemas";

export async function processCheckoutApi(payload: CheckoutInput): Promise<CheckoutApiResponse> {
  const response = await apiClient.post<CheckoutApiResponse>("/checkout", payload);
  return response.data;
}
