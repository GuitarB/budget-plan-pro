import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillForm } from "@/components/dashboard/bill-form";

type BillRow = {
  id: string;
  name: string;
  amount: number;
  due_day: number | null;
  frequency: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
};

export default async function BillsPage() {
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

  const { data: bills, error: billsError } = await supabase
    .from("bills")
    .select("id, name, amount, due_day, frequency, category, is_active, created_at")
    .eq("household_id", membership.household_id)
    .order("due_day", { ascending: true });

  if (billsError) {
    throw new Error(billsError.message);
  }

  return (
    <AppShell
      title="Bills"
      description="Track recurring household bills and their due dates."
    >
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Add bill</CardTitle>
          </CardHeader>
          <CardContent>
            <BillForm />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Household bills</CardTitle>
          </CardHeader>
          <CardContent>
            {bills && bills.length > 0 ? (
              <div className="space-y-4">
                {bills.map((bill: BillRow) => (
                  <div
                    key={bill.id}
                    className="rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {bill.name}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Due day {bill.due_day ?? "-"} • {bill.frequency}
                          {bill.category ? ` • ${bill.category}` : ""}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-neutral-900">
                          ${Number(bill.amount).toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {bill.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                No bills yet. Add your first bill on the left.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}