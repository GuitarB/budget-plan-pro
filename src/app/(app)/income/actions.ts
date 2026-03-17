"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createIncomeSource(formData: FormData) {
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
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const frequency = String(formData.get("frequency") ?? "").trim();
  const nextPayDate = String(formData.get("next_pay_date") ?? "").trim();

  if (!name) {
    throw new Error("Income source name is required.");
  }

  const amount = Number(amountRaw);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a valid number greater than 0.");
  }

  if (!frequency) {
    throw new Error("Frequency is required.");
  }

  if (!nextPayDate) {
    throw new Error("Next pay date is required.");
  }

  const { error } = await supabase.from("income_sources").insert({
    household_id: membership.household_id,
    name,
    amount,
    frequency,
    next_pay_date: nextPayDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/income");
  revalidatePath("/dashboard");
}