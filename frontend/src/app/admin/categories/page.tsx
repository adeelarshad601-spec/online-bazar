"use client";

import { useCategories } from "@/features/products/queries";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/features/admin/categories-queries";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Save,
  Loader2,
  Search,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { Category } from "@/types/category";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only"
    ),

  image: z
    .string()
    .trim()
    .url("Image must be a valid URL")
    .or(z.literal(""))
    .optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategoryMutation();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategoryMutation();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategoryMutation();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", image: "" },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", generatedSlug);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setValue("name", cat.name);
    setValue("slug", cat.slug);
    setValue("image", cat.image || "");
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingCategory(null);
    reset({ name: "", slug: "", image: "" });
    setShowForm(false);
  };

  const onSubmit = (data: CategoryFormData) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      image: data.image || undefined,
    };

    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, payload },
        {
          onSuccess: () => handleCancelForm(),
        }
      );
    } else {
      createCategory(payload, {
        onSuccess: () => handleCancelForm(),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteCategory(id, {
      onSuccess: () => setDeletingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Layers className="h-7 w-7 text-indigo-600" />
            <span>Category Management</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Organize marketplace product taxonomy, create and edit product categories
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) handleCancelForm();
            else setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            {editingCategory ? "Edit Category" : "Create New Category"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  {...register("name")}
                  onChange={handleNameChange}
                  placeholder="e.g. Consumer Electronics"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  {...register("slug")}
                  placeholder="consumer-electronics"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {errors.slug && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Category Image URL
              </label>
              <input
                type="url"
                disabled={isSubmitting}
                {...register("image")}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.image && (
                <p className="mt-1 text-[11px] text-red-500">{errors.image.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories by name or slug..."
          className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/* Categories Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Categories Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              No categories exist matching your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredCategories.map((cat) => {
                  const isConfirmingDelete = deletingId === cat.id;

                  return (
                    <tr key={cat.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-zinc-400" />
                            )}
                          </div>
                          <span className="font-bold text-zinc-900 dark:text-white">{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {cat.slug}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isConfirmingDelete ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] text-red-600 font-semibold">Delete?</span>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDelete(cat.id)}
                              className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => setDeletingId(null)}
                              className="rounded-lg bg-zinc-200 px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                              title="Edit Category"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(cat.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                              title="Delete Category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
