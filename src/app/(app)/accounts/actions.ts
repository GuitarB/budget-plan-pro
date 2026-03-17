"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createAccount(formData: FormData) {
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

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const institution = String(formData.get("institution") ?? "").trim();
  const balanceRaw = String(formData.get("balance") ?? "0").trim();

  if (!name) {
    throw new Error("Account name is required.");
  }

  if (!type) {
    throw new Error("Account type is required.");
  }

  const balance = Number(balanceRaw);

  if (Number.isNaN(balance)) {
    throw new Error("Balance must be a valid number.");
  }

  const { error } = await supabase.from("accounts").insert({
    household_id: membership.household_id,
    name,
    type,
    institution: institution || null,
    balance,
    is_manual: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}