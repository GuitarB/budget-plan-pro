import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountForm } from "@/components/dashboard/account-form";

type AccountRow = {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  balance: number;
  created_at: string;
};

export default async function AccountsPage() {
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

  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, name, type, institution, balance, created_at")
    .eq("household_id", membership.household_id)
    .order("created_at", { ascending: true });

  if (accountsError) {
    throw new Error(accountsError.message);
  }

  return (
    <AppShell
      title="Accounts"
      description="Manage the financial accounts connected to this household."
    >
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Add account</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountForm />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Household accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts && accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.map((account: AccountRow) => (
                  <div
                    key={account.id}
                    className="rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {account.name}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {account.type}
                          {account.institution
                            ? ` • ${account.institution}`
                            : ""}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-neutral-900">
                          ${Number(account.balance).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                No accounts yet. Add your first account on the left.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}