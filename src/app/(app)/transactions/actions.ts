"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
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

  const accountId = String(formData.get("account_id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const merchant = String(formData.get("merchant") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!accountId) {
    throw new Error("Account is required.");
  }

  if (!date) {
    throw new Error("Date is required.");
  }

  if (!amountRaw) {
    throw new Error("Amount is required.");
  }

  if (!direction || !["income", "expense"].includes(direction)) {
    throw new Error("Direction must be income or expense.");
  }

  const amount = Number(amountRaw);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a valid number greater than 0.");
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id, household_id, balance")
    .eq("id", accountId)
    .eq("household_id", householdId)
    .single();

  if (accountError || !account) {
    throw new Error("Selected account was not found in this household.");
  }

  const signedAmount = direction === "expense" ? -amount : amount;
  const newBalance = Number(account.balance) + signedAmount;

  const { error: insertError } = await supabase.from("transactions").insert({
    account_id: accountId,
    household_id: householdId,
    date,
    merchant: merchant || null,
    description: description || null,
    amount,
    direction,
    category: category || null,
    notes: notes || null,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { error: updateError } = await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", accountId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}