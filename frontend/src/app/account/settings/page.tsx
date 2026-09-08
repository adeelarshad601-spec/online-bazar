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
import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User as UserIcon,
  Lock,
  Trash2,
  Save,
  Loader2,
  ShieldAlert,
  ImageUp,
  Camera,
  Eye,
  EyeOff,
  X as XIcon,
  Palette,
  Shield,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters"),
  avatar: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https?:\/\//i.test(value) || /^data:image\//i.test(value),
      "Avatar must be a valid image URL or a local image upload"
    )
    .or(z.literal(""))
    .optional(),
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (hash === "personalization" || hash === "profile" || hash === "security") {
        setActiveTab(hash);
      }
    }
  }, [searchParams]);

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfileMutation();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePasswordMutation();
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccountMutation();
  const { mutate: logout } = useLogout();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "password">("confirm");
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState("");
  const [localAvatar, setLocalAvatar] = useState("");
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarPreview = localAvatar || user?.avatar || "";

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

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setLocalAvatar(result);
      setProfileValue("avatar", result, { shouldDirty: true, shouldValidate: true });
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute("capture");
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleAvatarClick = () => {
    setAvatarMenuOpen((prev) => !prev);
  };

  const triggerAvatarInput = (mode: "choose" | "camera" = "choose") => {
    setAvatarMenuOpen(false);
    if (!fileInputRef.current) return;

    if (mode === "camera") {
      fileInputRef.current.setAttribute("capture", "environment");
    } else {
      fileInputRef.current.removeAttribute("capture");
    }

    fileInputRef.current.click();
  };

  const handleViewAvatar = () => {
    if (avatarPreview) {
      window.open(avatarPreview, "_blank", "noopener,noreferrer");
    }
    setAvatarMenuOpen(false);
  };

  const handleRemoveAvatar = () => {
    setLocalAvatar("");
    setProfileValue("avatar", "", { shouldDirty: true, shouldValidate: true });
    setAvatarMenuOpen(false);
  };

  const handleDeleteAccount = () => {
    if (!deletePassword.trim()) {
      setDeletePasswordError("Current password is required to permanently delete your account.");
      return;
    }

    setDeletePasswordError("");

    deleteAccount(
      { currentPassword: deletePassword },
      {
        onSuccess: () => {
          logout();
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-500 text-white shadow-sm transition hover:bg-red-600 dark:border-red-900 dark:bg-red-600 dark:hover:bg-red-700"
          aria-label="Go back to previous page"
          title="Close"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <div className="rounded-[30px] border border-zinc-200 bg-white p-6 shadow-[0_1px_0_rgba(16,24,40,0.02)] dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
          {/* Tab Navigation Header */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-zinc-100 pb-5 dark:border-zinc-800">
            {[
              { id: "profile", label: "Profile", icon: UserIcon },
              { id: "personalization", label: "Personalization", icon: Palette },
              { id: "security", label: "Security & Password", icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(`/account/settings?tab=${tab.id}`, { scroll: false });
                  }}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition ${
                    isActive
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form id="profile" onSubmit={handleSubmitProfile(onProfileSubmit)} className="mx-auto max-w-md space-y-5">
          <div className="relative flex flex-col items-center justify-center pt-2">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUpdatingProfile}
              className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[6px] border-zinc-100 bg-zinc-100 shadow-md ring-1 ring-zinc-200 transition hover:scale-[1.01] dark:border-zinc-800 dark:bg-zinc-800 dark:ring-zinc-700"
              aria-label="Open profile picture actions"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-12 w-12 text-zinc-400" />
              )}

              <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </span>
            </button>

            <button
              type="button"
              onClick={handleAvatarClick}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50 px-4 py-2 text-[12px] font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <ImageUp className="h-3.5 w-3.5" />
              Change Photo
            </button>

            {avatarMenuOpen && (
              <div className="absolute top-36 z-20 mt-2 w-52 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleViewAvatar}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    View picture
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => triggerAvatarInput("choose")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <ImageUp className="h-3.5 w-3.5" />
                  Upload picture
                </button>

                <button
                  type="button"
                  onClick={() => triggerAvatarInput("camera")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Take picture
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <span className="text-base leading-none">×</span>
                    Remove
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={isUpdatingProfile}
              onChange={handleAvatarFileChange}
              className="hidden"
            />
          </div>

          {profileErrors.avatar && (
            <p className="text-center text-[11px] text-red-500">{profileErrors.avatar.message}</p>
          )}

          <div className="pt-2">
            <label className="mb-2 block text-[15px] font-semibold text-zinc-800 dark:text-zinc-200">
              Full Name
            </label>
            <input
              type="text"
              disabled={isUpdatingProfile}
              {...registerProfile("name")}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm transition focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {profileErrors.name && (
              <p className="mt-1 text-[11px] text-red-500">{profileErrors.name.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Profile</span>
          </button>
        </form>
        </div>
      </div>

      {/* Password Card */}
      <div id="security" className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
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
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                disabled={isChangingPassword}
                {...registerPassword("currentPassword")}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 pr-10 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-[11px] text-red-500">{passwordErrors.currentPassword.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  disabled={isChangingPassword}
                  {...registerPassword("newPassword")}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 pr-10 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-[11px] text-red-500">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  disabled={isChangingPassword}
                  {...registerPassword("confirmPassword")}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 pr-10 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
      <div id="danger" className="rounded-3xl border border-red-200 bg-red-50/50 p-6 sm:p-8 dark:border-red-900/40 dark:bg-red-950/20 space-y-4">
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
            onClick={() => {
              setDeleteStep("confirm");
              setDeletePassword("");
              setDeletePasswordError("");
              setShowDeleteConfirm(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        ) : deleteStep === "confirm" ? (
          <div className="rounded-2xl border border-red-300 bg-white p-4 space-y-3 dark:bg-zinc-900 dark:border-red-900">
            <p className="text-xs font-bold text-red-900 dark:text-red-200">
              Are you sure you want to permanently delete your account?
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteStep("password");
                  setDeletePasswordError("");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                <span>Yes, Continue</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteStep("confirm");
                  setDeletePassword("");
                  setDeletePasswordError("");
                }}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                No, Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-red-300 bg-white p-4 space-y-3 dark:bg-zinc-900 dark:border-red-900">
            <p className="text-xs font-bold text-red-900 dark:text-red-200">
              Enter your current password to confirm deletion.
            </p>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                Current password
              </label>
              <div className="relative">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(event) => {
                    setDeletePassword(event.target.value);
                    if (deletePasswordError) setDeletePasswordError("");
                  }}
                  placeholder="Current password"
                  disabled={isDeletingAccount}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 pr-10 text-xs text-zinc-900 focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  aria-label={showDeletePassword ? "Hide current password" : "Show current password"}
                >
                  {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {deletePasswordError && (
                <p className="mt-1 text-[11px] text-red-500">{deletePasswordError}</p>
              )}
            </div>

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
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteStep("confirm");
                  setDeletePassword("");
                  setDeletePasswordError("");
                }}
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
      <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading settings...</div>}>
        <AccountSettingsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
