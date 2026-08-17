"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useCurrentUser } from "@/features/auth/queries";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
        <div className="flex h-64 w-full max-w-md items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-50/50 px-4 py-12 dark:bg-zinc-950">
      <LoginForm adminMode />
    </div>
  );
}
