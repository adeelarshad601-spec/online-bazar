"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: async (values) => {
      const result = forgotPasswordSchema.safeParse(values);
      if (result.success) {
        return { values: result.data, errors: {} };
      }
      const fieldErrors: Record<string, { type: string; message: string }> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = { type: "validation", message: issue.message };
        }
      });
      return { values: {}, errors: fieldErrors };
    },
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordSchemaType) => {
    // UI ready for future POST /api/auth/forgot-password integration
    toast.success(`Password reset link sent to ${data.email}`);
    setIsSubmitted(true);
    reset();
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
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Reset Password
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Enter your email address to receive password reset instructions
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Check your inbox</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              If an account exists with that email, we have sent instructions to reset your password.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 transition-all duration-200"
            >
              <span>Send Reset Link</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
