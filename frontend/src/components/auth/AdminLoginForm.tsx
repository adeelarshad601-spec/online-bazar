"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@/features/auth/schemas";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";

export default function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [fieldsUnlocked, setFieldsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

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

    if (emailRef.current) {
      emailRef.current.value = "";
    }

    if (passwordRef.current) {
      passwordRef.current.value = "";
    }
  };

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

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        email: data.email.trim().toLowerCase(),
      };
      const response = await apiClient.post("/auth/admin-login", payload);
      
      if (response.data.success && response.data.data) {
        const user = response.data.data;
        if (user.role !== "ADMIN") {
          toast.error("This account does not have admin access");
          setIsLoading(false);
          return;
        }
        clearForm();
        toast.success(`Welcome back, ${user.name}!`);
        router.replace("/admin/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
        setIsLoading(false);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to log in";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const onInvalid = () => {
    toast.error("Please enter a valid email and password.");
  };

  const emailField = register("email");
  const passwordField = register("password");

  return (
    <div className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">
      {/* Background Decorative Blur */}
      <div className="pointer-events-none absolute -top-6 -left-6 h-32 w-32 rounded-full bg-red-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl" />

      {/* Main Form Card */}
      <div className="relative w-full space-y-6 rounded-3xl border border-zinc-200/80 bg-white/95 p-8 shadow-2xl shadow-zinc-950/5 backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-900/95">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Admin Login
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Access restricted to administrators only
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
              htmlFor="admin-email"
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
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="off"
                readOnly={!fieldsUnlocked}
                onFocus={handleEmailFocus}
                aria-invalid={!!errors.email}
                className={`w-full rounded-2xl border bg-zinc-50/70 py-3 pr-4 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:bg-zinc-800 ${
                  errors.email
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800"
                    : "border-zinc-200 focus:border-red-600 focus:ring-red-600/20 dark:border-zinc-700"
                }`}
              />
            </div>

            {errors.email && (
              <p className="text-xs font-medium text-rose-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>

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
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                readOnly={!fieldsUnlocked}
                onFocus={handlePasswordFocus}
                aria-invalid={!!errors.password}
                className={`w-full rounded-2xl border bg-zinc-50/70 py-3 pr-12 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:bg-zinc-800 ${
                  errors.password
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800"
                    : "border-zinc-200 focus:border-red-600 focus:ring-red-600/20 dark:border-zinc-700"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-red-600 to-orange-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 hover:from-red-500 hover:to-orange-500 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span>Access Admin Panel</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Switcher */}
        <div className="pt-2 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
          Not an admin?{" "}
          <Link
            href="/login"
            className="font-semibold text-red-600 hover:text-red-500 dark:text-red-400 underline-offset-4 hover:underline transition-colors"
          >
            User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
