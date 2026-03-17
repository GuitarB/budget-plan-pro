import Link from "next/link";
import { AuthForm } from "@/components/shared/auth-form";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-neutral-900">
      <div className="mx-auto max-w-md">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-green-700">
          Budget Plan Pro
        </p>

        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Start building your household money system.
        </p>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <AuthForm mode="signup" />
        </div>

        <p className="mt-4 text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-green-700">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}