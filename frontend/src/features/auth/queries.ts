import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserApi, loginApi, registerApi, logoutApi } from "./api";
import { LoginInput, RegisterInput, User } from "@/types/auth";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";

export const CURRENT_USER_QUERY_KEY = ["currentUser"];

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUserApi,
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => loginApi(data),
    onSuccess: (user) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
      toast.success(`Welcome back, ${user.name}!`);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) => registerApi(data),
    onSuccess: (user) => {
      toast.success(`Account created for ${user.email}! Please log in with your credentials.`);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      toast.success("Logged out successfully");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
