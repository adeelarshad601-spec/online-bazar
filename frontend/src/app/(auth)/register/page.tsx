import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register | Online-Bazar",
  description: "Create a new account on Online-Bazar",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone-50/50 px-4 py-12 dark:bg-zinc-950">
      <RegisterForm />
    </div>
  );
}
