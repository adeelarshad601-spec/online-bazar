import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfileApi, updateUserPasswordApi, deleteAccountApi, UpdateProfileInput, ChangePasswordInput } from "./api";
import { CURRENT_USER_QUERY_KEY } from "@/features/auth/queries";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileInput) => updateUserProfileApi(payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updatedUser);
      toast.success("Profile updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordInput) => updateUserPasswordApi(payload),
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccountApi,
    onSuccess: () => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
      toast.success("Account deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
