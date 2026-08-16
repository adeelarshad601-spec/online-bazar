import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategoryApi, updateCategoryApi, deleteCategoryApi, CreateCategoryPayload, UpdateCategoryPayload } from "./categories-api";
import { CATEGORIES_QUERY_KEY } from "@/features/products/queries";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategoryApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => updateCategoryApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category deleted!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
