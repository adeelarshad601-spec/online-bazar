"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchemaType } from "@/features/auth/schemas";
import { useRegister } from "@/features/auth/queries";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { Eye, EyeOff, Loader2, Lock, Mail, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "SELLER" | null>(null);
  const router = useRouter();

  const { mutate: registerUser, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Clean up form state on unmount so returning to /register is completely fresh
  useEffect(() => {
    return () => {
      reset({ name: "", email: "", password: "", confirmPassword: "" });
    };
  }, [reset]);

  const passwordValue = watch("password") || "";

  // Password Requirement Indicators
  const passwordRequirements = [
    { label: "8+ characters", valid: passwordValue.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(passwordValue) },
    { label: "Lowercase letter", valid: /[a-z]/.test(passwordValue) },
    { label: "Number", valid: /[0-9]/.test(passwordValue) },
    { label: "Special character", valid: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = (data: RegisterSchemaType) => {
    if (!selectedRole) {
      toast.error("Please select an account type");
      return;
    }

    // Send strictly { name, email, password, role } to the backend API
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: selectedRole,
    };

    registerUser(payload, {
      onSuccess: () => {
        reset({ name: "", email: "", password: "", confirmPassword: "" });
        router.push("/login");
      },
    });
  };

  const onInvalid = () => {
    toast.error("Please fulfill all password requirements and correct form errors.");
  };

  return (
    <div className="relative w-full max-w-md animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">
      {/* Background Decorative Blur */}
      <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

      {/* Main Form Card */}
      <div className="relative w-full space-y-6 rounded-3xl border border-zinc-200/80 bg-white/95 p-8 shadow-2xl shadow-zinc-950/5 backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-900/95">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo size="lg" showSubtitle />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create an Account
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Join Online-Bazar to start shopping or selling
            </p>
          </div>
        </div>

        {!selectedRole ? (
          // Role Selection Screen
          <div className="space-y-4">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Choose your account type:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("CUSTOMER")}
                className="relative group rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 p-4 text-center hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-200"
              >
                <div className="text-2xl mb-2">🛍️</div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Customer
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Browse & buy products
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("SELLER")}
                className="relative group rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 p-4 text-center hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-200"
              >
                <div className="text-2xl mb-2">🏪</div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Seller
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Sell your products
                </p>
              </button>
            </div>
          </div>
        ) : (
          // Form after role selection
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {selectedRole === "CUSTOMER" ? "🛍️ Customer Account" : "🏪 Seller Account"}
              </p>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 underline-offset-2 hover:underline"
              >
                Change
              </button>
            </div>
          </>
        )}

        {selectedRole && <form
  onSubmit={handleSubmit(onSubmit, onInvalid)}
  className="space-y-4"
  noValidate
  autoComplete="off"
>
          {/* Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Full Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="reg-name"
                type="text"
                placeholder="John Doe"
                aria-invalid={!!errors.name}
                {...register("name")}
                className={`w-full rounded-2xl border bg-zinc-50/70 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:bg-zinc-800 transition-all ${
                  errors.name
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800"
                    : "border-zinc-200 focus:border-emerald-600 focus:ring-emerald-600/20 dark:border-zinc-700"
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs font-medium text-rose-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="reg-email"
                type="email"
                autoComplete="off"
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
            <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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

            {/* Password Requirement Indicators (Single Description Line) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[11px]">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Must contain:</span>
              {passwordRequirements.map((req, idx) => (
                <span key={idx} className="inline-flex items-center gap-1">
                  {idx > 0 && <span className="text-zinc-300 dark:text-zinc-700 font-bold">•</span>}
                  <span className={req.valid ? "font-semibold text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}>
                    {req.label}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="reg-confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="reg-confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
                className={`w-full rounded-2xl border bg-zinc-50/70 py-3 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-2 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:bg-zinc-800 transition-all ${
                  errors.confirmPassword
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-800"
                    : "border-zinc-200 focus:border-emerald-600 focus:ring-emerald-600/20 dark:border-zinc-700"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs font-medium text-rose-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 transition-all duration-200"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
        }

        {/* Footer Switcher */}
        <div className="pt-2 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 underline-offset-4 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
