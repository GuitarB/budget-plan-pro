import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("id", user.id)
    .single();

  return (
    <AppShell
      title="Dashboard"
      description="Your household money command center will live here."
    >
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-neutral-600">
          Supabase connection status:{" "}
          <span className="font-semibold text-neutral-900">Connected</span>
        </p>

        <p className="mt-2 text-sm text-neutral-600">
          Current auth user:{" "}
          <span className="font-semibold text-neutral-900">{user.email}</span>
        </p>

        <p className="mt-2 text-sm text-neutral-600">
          Profile row:{" "}
          <span className="font-semibold text-neutral-900">
            {profile ? "Found" : "Missing"}
          </span>
        </p>

        {profile ? (
          <p className="mt-2 text-sm text-neutral-600">
            Profile email:{" "}
            <span className="font-semibold text-neutral-900">
              {profile.email}
            </span>
          </p>
        ) : null}

        {profileError ? (
          <p className="mt-2 text-sm text-red-600">
            Profile error: {profileError.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Safe to Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
            <p className="mt-2 text-sm text-neutral-500">
              This will become a live planning number.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Next Paycheck</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
            <p className="mt-2 text-sm text-neutral-500">
              Your next income event will appear here.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Bills Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="mt-2 text-sm text-neutral-500">
              Upcoming bills before the next paycheck.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>AI Coach</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              Your weekly guidance will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}