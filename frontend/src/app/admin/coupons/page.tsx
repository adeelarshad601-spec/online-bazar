"use client";

import { useCoupons, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } from "@/features/admin/coupons-queries";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Percent,
  DollarSign,
} from "lucide-react";
import { CouponItem } from "@/features/admin/coupons-api";

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters long")
    .max(50, "Code must not exceed 50 characters")
    .toUpperCase(),

  type: z.enum(["PERCENTAGE", "FIXED"]),

  value: z.number().positive("Value must be greater than 0"),

  minOrderAmount: z.number().positive("Min order amount must be greater than 0").optional(),

  maxDiscount: z.number().positive("Max discount must be greater than 0").optional(),

  usageLimit: z.number().int().positive("Usage limit must be greater than 0").optional(),

  isActive: z.boolean(),
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useCoupons();
  const { mutate: createCoupon, isPending: isCreating } = useCreateCouponMutation();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCouponMutation();
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCouponMutation();

  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: undefined,
      maxDiscount: undefined,
      usageLimit: undefined,
      isActive: true,
    },
  });

  const handleStartEdit = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setValue("code", coupon.code);
    setValue("type", coupon.type);
    setValue("value", Number(coupon.value));
    setValue("minOrderAmount", coupon.minOrderAmount ? Number(coupon.minOrderAmount) : undefined);
    setValue("maxDiscount", coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined);
    setValue("usageLimit", coupon.usageLimit ? Number(coupon.usageLimit) : undefined);
    setValue("isActive", coupon.isActive);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingCoupon(null);
    reset({
      code: "",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: undefined,
      maxDiscount: undefined,
      usageLimit: undefined,
      isActive: true,
    });
    setShowForm(false);
  };

  const onSubmit = (data: CouponFormData) => {
    if (editingCoupon) {
      updateCoupon(
        { id: editingCoupon.id, payload: data },
        { onSuccess: () => handleCancelForm() }
      );
    } else {
      createCoupon(data, { onSuccess: () => handleCancelForm() });
    }
  };

  const handleDelete = (id: string) => {
    deleteCoupon(id, { onSuccess: () => setDeletingId(null) });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Ticket className="h-7 w-7 text-indigo-600" />
            <span>Discount Coupon Management</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Create and manage promotional discount coupons for checkout
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
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Form Card */}
      {showForm && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            {editingCoupon ? "Edit Coupon" : "Create Promotional Coupon"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  {...register("code")}
                  placeholder="e.g. SAVE20"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-xs font-mono uppercase text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {errors.code && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={isSubmitting}
                  {...register("type")}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={isSubmitting}
                  {...register("value", { valueAsNumber: true })}
                  placeholder="20"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {errors.value && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.value.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Min Order Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={isSubmitting}
                  {...register("minOrderAmount", { valueAsNumber: true })}
                  placeholder="50.00"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Max Discount Cap ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={isSubmitting}
                  {...register("maxDiscount", { valueAsNumber: true })}
                  placeholder="100.00"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  disabled={isSubmitting}
                  {...register("usageLimit", { valueAsNumber: true })}
                  placeholder="100"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 justify-end">
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
                <span>{editingCoupon ? "Save Changes" : "Create Coupon"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Ticket className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Coupons Active
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Create discount coupons to offer checkout savings for customers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min Order</th>
                  <th className="py-3.5 px-4">Used Count</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {coupons.map((coupon) => {
                  const isConfirmingDelete = deletingId === coupon.id;

                  return (
                    <tr key={coupon.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {coupon.code}
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-900 dark:text-white">
                        {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `$${Number(coupon.value).toFixed(2)} OFF`}
                      </td>
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-300">
                        {coupon.minOrderAmount ? `$${Number(coupon.minOrderAmount).toFixed(2)}` : "None"}
                      </td>
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-300">
                        {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ""}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            coupon.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {coupon.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isConfirmingDelete ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] text-red-600 font-semibold">Delete?</span>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDelete(coupon.id)}
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
                              onClick={() => handleStartEdit(coupon)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                              title="Edit Coupon"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(coupon.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                              title="Delete Coupon"
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
