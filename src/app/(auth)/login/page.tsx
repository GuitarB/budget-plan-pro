import Link from "next/link";
import { AuthForm } from "@/components/shared/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-neutral-900">
      <div className="mx-auto max-w-md">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-green-700">
          Budget Plan Pro
        </p>

        <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Access your household money dashboard.
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <AuthForm mode="login" />
        </div>

        <p className="mt-4 text-sm text-neutral-600">
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-green-700">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}