import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Login | Online-Bazar",
  description: "Sign in to your Online-Bazar account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone-50/50 px-4 py-12 dark:bg-zinc-950">
      <Suspense
        fallback={
          <div className="flex h-64 w-full max-w-md items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
