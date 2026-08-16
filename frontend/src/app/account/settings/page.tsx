"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCurrentUser, useLogout } from "@/features/auth/queries";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from "@/features/user/queries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Lock,
  Trash2,
  Save,
  Loader2,
  ShieldAlert,
  LogOut,
} from "lucide-react";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters"),
  avatar: z.string().trim().url("Avatar must be a valid URL").or(z.literal("")).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(100, "New password is too long"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

function AccountSettingsContent() {
  const { data: user } = useCurrentUser();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfileMutation();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePasswordMutation();
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccountMutation();
  const { mutate: logout } = useLogout();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", avatar: "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (user) {
      setProfileValue("name", user.name || "");
      setProfileValue("avatar", user.avatar || "");
    }
  }, [user, setProfileValue]);

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfile({
      name: data.name,
      avatar: data.avatar || null,
    });
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePassword(data, {
      onSuccess: () => {
        resetPasswordForm();
      },
    });
  };

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        logout();
      },
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <UserIcon className="h-7 w-7 text-emerald-600" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your account profile details, credentials and security settings
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <UserIcon className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Personal Information
          </h2>
        </div>

        <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              disabled={isUpdatingProfile}
              {...registerProfile("name")}
              className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {profileErrors.name && (
              <p className="mt-1 text-[11px] text-red-500">{profileErrors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address <span className="text-[11px] font-normal text-zinc-400">(Read-only)</span>
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              disabled={isUpdatingProfile}
              {...registerProfile("avatar")}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {profileErrors.avatar && (
              <p className="mt-1 text-[11px] text-red-500">{profileErrors.avatar.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
          >
            {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Password Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <Lock className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Security & Password
          </h2>
        </div>

        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              disabled={isChangingPassword}
              {...registerPassword("currentPassword")}
              className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-[11px] text-red-500">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                disabled={isChangingPassword}
                {...registerPassword("newPassword")}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-[11px] text-red-500">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                disabled={isChangingPassword}
                {...registerPassword("confirmPassword")}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-500">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
          >
            {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            <span>Update Password</span>
          </button>
        </form>
      </div>

      {/* Danger Zone Card */}
      <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 sm:p-8 dark:border-red-900/40 dark:bg-red-950/20 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <h2 className="text-base font-bold text-red-900 dark:text-red-300">
            Danger Zone
          </h2>
        </div>
        <p className="text-xs text-red-700 dark:text-red-400 max-w-lg leading-relaxed">
          Permanently delete your user account and clear session data. This action is irreversible.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        ) : (
          <div className="rounded-2xl border border-red-300 bg-white p-4 space-y-3 dark:bg-zinc-900 dark:border-red-900">
            <p className="text-xs font-bold text-red-900 dark:text-red-200">
              Are you sure you want to permanently delete your account?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={handleDeleteAccount}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingAccount ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Confirm Delete</span>
              </button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <ProtectedRoute>
      <AccountSettingsContent />
    </ProtectedRoute>
  );
}
