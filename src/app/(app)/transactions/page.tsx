import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/dashboard/transaction-form";

type AccountRow = {
  id: string;
  name: string;
  type: string;
};

type TransactionRow = {
  id: string;
  date: string;
  merchant: string | null;
  description: string | null;
  amount: number;
  direction: string;
  category: string | null;
  notes: string | null;
  created_at: string;
  account_id: string;
};

export default async function TransactionsPage() {
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

  const householdId = membership.household_id;

  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  if (accountsError) {
    throw new Error(accountsError.message);
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select(
      "id, date, merchant, description, amount, direction, category, notes, created_at, account_id"
    )
    .eq("household_id", householdId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (transactionsError) {
    throw new Error(transactionsError.message);
  }

  const accountNameMap = new Map(
    (accounts ?? []).map((account: AccountRow) => [account.id, account.name])
  );

  return (
    <AppShell
      title="Transactions"
      description="Track household spending and income activity."
    >
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Add transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm accounts={(accounts ?? []) as AccountRow[]} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Household transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction: TransactionRow) => (
                  <div
                    key={transaction.id}
                    className="rounded-xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {transaction.description ||
                            transaction.merchant ||
                            "Transaction"}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          {transaction.date} •{" "}
                          {accountNameMap.get(transaction.account_id) ?? "Unknown account"}
                          {transaction.category ? ` • ${transaction.category}` : ""}
                        </p>
                        {transaction.merchant ? (
                          <p className="mt-1 text-xs text-neutral-500">
                            Merchant: {transaction.merchant}
                          </p>
                        ) : null}
                        {transaction.notes ? (
                          <p className="mt-1 text-xs text-neutral-500">
                            Notes: {transaction.notes}
                          </p>
                        ) : null}
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.direction === "income"
                              ? "text-green-700"
                              : "text-neutral-900"
                          }`}
                        >
                          {transaction.direction === "income" ? "+" : "-"}$
                          {Number(transaction.amount).toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500 capitalize">
                          {transaction.direction}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                No transactions yet. Add your first transaction on the left.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}