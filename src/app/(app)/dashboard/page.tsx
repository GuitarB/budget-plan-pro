import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

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
  let nextPaycheckLabel: string | null = null;
  let safeToSpend = 0;
  let cashBalanceTotal = 0;
  let billsDueBeforePaycheckTotal = 0;

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

    const today = new Date();
    const todayIso = today.toISOString().split("T")[0];
    const todayDay = today.getDate();

    const { data: incomeSource } = await supabase
      .from("income_sources")
      .select("amount, next_pay_date, name")
      .eq("household_id", householdId)
      .gte("next_pay_date", todayIso)
      .order("next_pay_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    nextPaycheckAmount = incomeSource?.amount ?? null;
    nextPaycheckLabel = incomeSource?.next_pay_date ?? null;

    const { data: cashAccounts } = await supabase
      .from("accounts")
      .select("balance, type")
      .eq("household_id", householdId)
      .in("type", ["checking", "savings", "cash"]);

    cashBalanceTotal =
      cashAccounts?.reduce((sum, account) => {
        return sum + Number(account.balance ?? 0);
      }, 0) ?? 0;

    const { data: activeBills } = await supabase
      .from("bills")
      .select("amount, due_day, is_active")
      .eq("household_id", householdId)
      .eq("is_active", true);

    if (nextPaycheckLabel) {
      const paycheckDate = new Date(`${nextPaycheckLabel}T00:00:00`);
      const paycheckDay = paycheckDate.getDate();
      const sameMonth =
        paycheckDate.getMonth() === today.getMonth() &&
        paycheckDate.getFullYear() === today.getFullYear();

      if (sameMonth) {
        billsDueBeforePaycheckTotal =
          activeBills?.reduce((sum, bill) => {
            const dueDay = Number(bill.due_day ?? 0);

            if (dueDay >= todayDay && dueDay < paycheckDay) {
              return sum + Number(bill.amount ?? 0);
            }

            return sum;
          }, 0) ?? 0;
      } else {
        billsDueBeforePaycheckTotal =
          activeBills?.reduce((sum, bill) => {
            const dueDay = Number(bill.due_day ?? 0);

            if (dueDay >= todayDay || dueDay < paycheckDay) {
              return sum + Number(bill.amount ?? 0);
            }

            return sum;
          }, 0) ?? 0;
      }
    }

    safeToSpend = cashBalanceTotal - billsDueBeforePaycheckTotal;
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
            <CardTitle>Safe to Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(safeToSpend)}</p>
            <p className="mt-2 text-sm text-neutral-500">
              Cash balances minus bills due before next paycheck.
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
                ? formatCurrency(nextPaycheckAmount)
                : "$0.00"}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              {nextPaycheckLabel
                ? `Upcoming pay date: ${nextPaycheckLabel}`
                : "No upcoming pay date found."}
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

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Cash Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(cashBalanceTotal)}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Total of checking, savings, and cash accounts.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Bills Due Before Paycheck</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(billsDueBeforePaycheckTotal)}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Active bills estimated to hit before the next paycheck.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}