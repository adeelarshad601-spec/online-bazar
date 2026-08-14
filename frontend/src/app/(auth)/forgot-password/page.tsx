import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | Online-Bazar",
  description: "Reset your Online-Bazar account password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone-50/50 px-4 py-12 dark:bg-zinc-950">
      <ForgotPasswordForm />
    </div>
  );
}
