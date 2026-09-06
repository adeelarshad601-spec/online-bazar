import apiClient from "@/lib/api/client";
import { CheckoutInput, CheckoutApiResponse } from "./schemas";

export async function processCheckoutApi(payload: CheckoutInput): Promise<CheckoutApiResponse> {
  const response = await apiClient.post<CheckoutApiResponse>("/checkout", payload);
  return response.data;
}

export async function processTestPaymentApi(paymentId: string, action: "SUCCESS" | "FAILED") {
  const response = await apiClient.post(`/payments/${paymentId}/process-test`, { action });
  return response.data;
}

