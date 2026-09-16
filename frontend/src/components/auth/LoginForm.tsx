"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@/features/auth/schemas";
import { useLogin } from "@/features/auth/queries";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface LoginFormProps {
  onClose?: () => void;
  onSwitchToRegister?: () => void;
  isClosing?: boolean;
}

export default function LoginForm({ onClose, onSwitchToRegister, isClosing = false }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [fieldsUnlocked, setFieldsUnlocked] = useState(false);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const clearForm = () => {
    reset({
      email: "",
      password: "",
    });

    setShowPassword(false);

    // Also clear the actual DOM values.
    if (emailRef.current) {
      emailRef.current.value = "";
    }

    if (passwordRef.current) {
      passwordRef.current.value = "";
    }
  };

  /*
   * Prevent browser/password-manager autofill on initial page load.
   */
  useEffect(() => {
    clearForm();

    const timer = window.setTimeout(() => {
      clearForm();
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const unlockFields = () => {
    if (!fieldsUnlocked) {
      setFieldsUnlocked(true);
    }
  };

  const handleEmailFocus = () => {
    unlockFields();

    window.setTimeout(() => {
      emailRef.current?.focus();
    }, 0);
  };

  const handlePasswordFocus = () => {
    unlockFields();

    window.setTimeout(() => {
      passwordRef.current?.focus();
    }, 0);
  };

  const onSubmit = (data: LoginSchemaType) => {
    login(data, {
      onSuccess: (user) => {
        clearForm();

        // Prevent admin users from logging in via regular login
        if (user.role === "ADMIN") {
          toast.error("Admin login requires access to the admin panel. Use /admin/login instead.");
          return;
        }

        if (onClose) {
          onClose();
        }

        // For sellers, redirect to status page to check approval
        if (user.role === "SELLER") {
          router.replace("/seller/status");
          return;
        }

        // For customers, redirect to home or specified redirect
        router.replace(redirect || "/");
      },
    });
  };

  const onInvalid = () => {
    toast.error("Please enter a valid email and password.");
  };

  const emailField = register("email");
  const passwordField = register("password");

  return (
    <div className="relative w-full max-w-md">
      {/* Background Decorative Blur */}
      <div className="pointer-events-none absolute -top-6 -left-6 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-teal-500/20 blur-3xl" />

      {/* Main Form Card */}
      <div
        className="relative w-full space-y-6 rounded-3xl border border-zinc-200/80 bg-white/95 p-8 shadow-2xl shadow-zinc-950/5 backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-900/95"
        style={{
          transformOrigin: "calc(100% - 22px) 22px",
          animation: isClosing
            ? "authFormDrop 2600ms cubic-bezier(.32,.08,.55,1) forwards"
            : "authFormIn 350ms cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo size="lg" showSubtitle />
          </div>

          <div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Log in to manage your marketplace account
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
          noValidate
          autoComplete="off"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Email Address
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail className="h-4 w-4" />
              </div>

              <input
                {...emailField}
                ref={(element) => {
                  emailField.ref(element);
                  emailRef.current = element;
                }}
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="off"
                readOnly={!fieldsUnlocked}
                onFocus={handleEmailFocus}
                aria-invalid={!!errors.email}
                className={`w-full rounded-2xl border bg-zinc-50/70 py-3 pr-4 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:bg-zinc-800 ${
                  errors.email
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800"
                    : "border-zinc-200 focus:border-emerald-600 focus:ring-emerald-600/20 dark:border-zinc-700"
                } ${
                  !fieldsUnlocked
                    ? "cursor-text"
                    : ""
                }`}
              />
            </div>

            {errors.email && (
              <p className="text-xs font-medium text-rose-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-500 hover:underline dark:text-emerald-400"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="h-4 w-4" />
              </div>

              <input
                {...passwordField}
                ref={(element) => {
                  passwordField.ref(element);
                  passwordRef.current = element;
                }}
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="off"
                readOnly={!fieldsUnlocked}
                onFocus={handlePasswordFocus}
                aria-invalid={!!errors.password}
                className={`w-full rounded-2xl border bg-zinc-50/70 py-3 pr-10 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:bg-zinc-800 ${
                  errors.password
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800"
                    : "border-zinc-200 focus:border-emerald-600 focus:ring-emerald-600/20 dark:border-zinc-700"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs font-medium text-rose-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center gap-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 before:h-px before:flex-1 before:bg-zinc-200 after:h-px after:flex-1 after:bg-zinc-200 dark:before:bg-zinc-800 dark:after:bg-zinc-800">
          <span>or continue with</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => toast.info("Google sign in will be available soon.")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <span className="text-base font-black text-[#4285F4]">G</span>
            Google
          </button>
          <button
            type="button"
            onClick={() => toast.info("Apple sign in will be available soon.")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <span className="text-lg leading-none text-zinc-900 dark:text-white">●</span>
            Apple
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 pt-2 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          {onSwitchToRegister ? (
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-500 hover:underline dark:text-emerald-400"
            >
              Create account
            </button>
          ) : (
            <Link
              href="/register"
              className="font-semibold text-emerald-600 underline-offset-4 transition-colors hover:text-emerald-500 hover:underline dark:text-emerald-400"
            >
              Create account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}