import { AxiosError } from "axios";
import { ApiResponse } from "@/types/auth";

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiResponse | undefined;
    
    if (responseData?.message) {
      return responseData.message;
    }
    
    if (responseData?.errors && responseData.errors.length > 0) {
      return responseData.errors[0].message;
    }

    if (error.response?.status === 401) {
      return "Unauthorized access. Please log in again.";
    }

    if (error.response?.status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (error.response?.status === 404) {
      return "Requested resource not found.";
    }

    if (error.response?.status === 409) {
      return "A conflict occurred. Email may already be registered.";
    }

    if (error.message === "Network Error") {
      return "Unable to connect to server. Please check your internet connection or backend status.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
