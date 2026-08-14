"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "@/features/auth/schemas";
import { useLogin } from "@/features/auth/queries";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
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

  // Clean up form state on unmount so returning to /login is completely fresh
  useEffect(() => {
    return () => {
      reset({ email: "", password: "" });
    };
  }, [reset]);

  const onSubmit = (data: LoginSchemaType) => {
    login(data, {
      onSuccess: () => {
        reset({ email: "", password: "" });
        router.push(redirect);
      },
    });
  };

  const onInvalid = () => {
    toast.error("Please enter a valid email and password.");
  };

  return (
    <div className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">
      {/* Background Decorative Blur */}
      <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

      {/* Main Form Card */}
      <div className="relative w-full space-y-6 rounded-3xl border border-zinc-200/80 bg-white/95 p-8 shadow-2xl shadow-zinc-950/5 backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-900/95">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo size="lg" showSubtitle />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome Back
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Log in to manage your marketplace account
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4" noValidate>
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
                className={`w-full rounded-2xl border bg-zinc-50/70 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:bg-zinc-800 transition-all ${
                  errors.email
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800"
                    : "border-zinc-200 focus:border-emerald-600 focus:ring-emerald-600/20 dark:border-zinc-700"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-rose-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                {...register("password")}
                className={`w-full rounded-2xl border bg-zinc-50/70 py-3 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:bg-zinc-800 transition-all ${
                  errors.password
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800"
                    : "border-zinc-200 focus:border-emerald-600 focus:ring-emerald-600/20 dark:border-zinc-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-rose-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 transition-all duration-200"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Switcher */}
        <div className="pt-2 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 underline-offset-4 hover:underline transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
