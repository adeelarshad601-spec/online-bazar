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
  X,
} from "lucide-react";
import { toast } from "sonner";

interface LoginFormProps {
  onClose?: () => void;
  onSwitchToRegister?: () => void;
  isClosing?: boolean;
}

export default function LoginForm({ onClose, onSwitchToRegister, isClosing: isClosingProp = false }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [fieldsUnlocked, setFieldsUnlocked] = useState(false);
  const [internalClosing, setInternalClosing] = useState(false);

  const isClosing = isClosingProp || internalClosing;

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

  const handleClose = () => {
    if (isClosing) return;
    setInternalClosing(true);
    if (onClose) {
      onClose();
    } else {
      window.setTimeout(() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }, 2700);
    }
  };

  const onInvalid = () => {
    toast.error("Please enter a valid email and password.");
  };

  const emailField = register("email");
  const passwordField = register("password");

  return (
    <>
      <style jsx global>{`
        @keyframes authFormIn {
          from { opacity: 0; transform: translateY(18px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes authFormDrop {
          0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); }
          42% { opacity: 1; transform: rotate(-28deg); }
          52% { opacity: 1; transform: rotate(-28deg); }
          100% { opacity: 0; transform: translate3d(0, 125vh, 0) rotate(-28deg); }
        }

        @keyframes authCloseDrop {
          0% { opacity: 1; transform: translate3d(0, 0, 0); }
          100% { opacity: 0; transform: translate3d(0, 110vh, 0); }
        }
      `}</style>
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
          {/* Red Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition-transform hover:scale-105 hover:bg-red-600 active:scale-95 cursor-pointer"
            aria-label="Close"
            title="Close form"
            style={{
              animation: isClosing
                ? "authCloseDrop 1248ms linear 1352ms forwards"
                : undefined,
            }}
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>

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

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => toast.info("Apple sign in will be available soon.")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-black bg-black px-4 text-[11px] font-bold uppercase text-white transition-colors hover:bg-zinc-800"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-white">
              <path d="M17.05 12.54c-.02-2.03 1.66-3 1.74-3.05a3.74 3.74 0 0 0-2.94-1.59c-1.24-.13-2.44.74-3.07.74-.65 0-1.62-.73-2.66-.71a3.93 3.93 0 0 0-3.3 2.01c-1.42 2.47-.36 6.1 1 8.1.68.98 1.46 2.08 2.5 2.04 1.01-.04 1.4-.65 2.63-.65 1.22 0 1.58.65 2.64.63 1.1-.02 1.77-.98 2.43-1.97a8.1 8.1 0 0 0 1.1-2.28 3.53 3.53 0 0 1-2.07-3.27ZM15.03 6.58a3.56 3.56 0 0 0 .81-2.56 3.62 3.62 0 0 0-2.34 1.21 3.4 3.4 0 0 0-.83 2.46 3 3 0 0 0 2.36-1.11Z" />
            </svg>
            Continue with Apple
          </button>
          <button
            type="button"
            onClick={() => toast.info("Google sign in will be available soon.")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 text-[11px] font-bold uppercase text-white transition-colors hover:bg-blue-700"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-white">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                <path fill="#EA4335" d="M21.35 12.27c0-.72-.06-1.25-.2-1.8H12v3.4h5.36a4.58 4.58 0 0 1-1.99 3v2.5h3.22c1.88-1.73 2.76-4.28 2.76-7.1Z" />
                <path fill="#4285F4" d="M12 21.5c2.7 0 4.96-.89 6.61-2.42l-3.22-2.5c-.9.6-2.04.96-3.39.96-2.61 0-4.83-1.76-5.62-4.13H3.05v2.58A9.99 9.99 0 0 0 12 21.5Z" />
                <path fill="#FBBC05" d="M6.38 13.41A6.01 6.01 0 0 1 6.06 12c0-.49.11-.97.32-1.41V8.01H3.05A9.5 9.5 0 0 0 2 12c0 1.44.35 2.8 1.05 3.99l3.33-2.58Z" />
                <path fill="#34A853" d="M12 6.46c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.95 3.5 14.7 2.5 12 2.5a9.99 9.99 0 0 0-8.95 5.51l3.33 2.58C7.17 8.22 9.39 6.46 12 6.46Z" />
              </svg>
            </span>
            Continue with Google
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
  </>
  );
}