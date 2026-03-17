import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeForm } from "@/components/dashboard/income-form";

type IncomeSourceRow = {
  id: string;
  name: string;
  amount: number | null;
  frequency: string | null;
  next_pay_date: string | null;
  created_at: string;
};

export default async function IncomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (membershipError || !membership) {
    throw new Error("No household found for this user.");
  }

  const { data: incomeSources, error: incomeError } = await supabase
    .from("income_sources")
    .select("id, name, amount, frequency, next_pay_date, created_at")
    .eq("household_id", membership.household_id)
    .order("next_pay_date", { ascending: true });

  if (incomeError) {
    throw new Error(incomeError.message);
  }

  return (
    <AppShell
      title="Income"
      description="Manage paycheck sources and future income timing."
    >
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Add income source</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeForm />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Household income sources</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeSources && incomeSources.length > 0 ? (
              <div className="space-y-4">
                {incomeSources.map((income: IncomeSourceRow) => (
                  <div
                    key={income.id}
                    className="rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {income.name}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {income.frequency ?? "No frequency"}
                          {income.next_pay_date
                            ? ` • Next pay: ${income.next_pay_date}`
                            : ""}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-700">
                          ${Number(income.amount ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                No income sources yet. Add your first income source on the left.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}