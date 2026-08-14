"use client";

import { useCurrentUser } from "@/features/auth/queries";
import { UserRole } from "@/types/auth";
import { ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-zinc-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center text-center px-4">
        <div className="rounded-full bg-rose-100 p-4 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mb-4">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Access Restricted
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
          You do not have the required permissions to access this area.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
