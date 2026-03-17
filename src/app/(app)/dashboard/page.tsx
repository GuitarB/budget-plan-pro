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

  const { data: memberships } = await supabase
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", user.id);

  const householdId = memberships?.[0]?.household_id ?? null;

  let householdName: string | null = null;
  let accountCount = 0;
  let billCount = 0;
  let transactionCount = 0;
  let nextPaycheckAmount: number | null = null;

  if (householdId) {
    const { data: household } = await supabase
      .from("households")
      .select("name")
      .eq("id", householdId)
      .single();

    householdName = household?.name ?? null;

    const { count: accountsCountResult } = await supabase
      .from("accounts")
      .select("*", { count: "exact", head: true })
      .eq("household_id", householdId);

    accountCount = accountsCountResult ?? 0;

    const { count: billsCountResult } = await supabase
      .from("bills")
      .select("*", { count: "exact", head: true })
      .eq("household_id", householdId)
      .eq("is_active", true);

    billCount = billsCountResult ?? 0;

    const { count: transactionsCountResult } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("household_id", householdId);

    transactionCount = transactionsCountResult ?? 0;

    const { data: incomeSource } = await supabase
      .from("income_sources")
      .select("amount")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    nextPaycheckAmount = incomeSource?.amount ?? null;
  }

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

        <p className="mt-2 text-sm text-neutral-600">
          Household:{" "}
          <span className="font-semibold text-neutral-900">
            {householdName ?? "None"}
          </span>
        </p>

        {profileError ? (
          <p className="mt-2 text-sm text-red-600">
            Profile error: {profileError.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{accountCount}</p>
            <p className="mt-2 text-sm text-neutral-500">
              Financial accounts in this household.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Next Paycheck</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {nextPaycheckAmount !== null
                ? `$${nextPaycheckAmount.toFixed(2)}`
                : "$0.00"}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              First saved income source amount.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Active Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{billCount}</p>
            <p className="mt-2 text-sm text-neutral-500">
              Recurring bills currently active.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transactionCount}</p>
            <p className="mt-2 text-sm text-neutral-500">
              Transactions recorded for this household.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}