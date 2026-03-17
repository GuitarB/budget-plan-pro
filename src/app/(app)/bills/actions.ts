"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBill(formData: FormData) {
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
  const dueDayRaw = String(formData.get("due_day") ?? "").trim();
  const frequency = String(formData.get("frequency") ?? "monthly").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!name) {
    throw new Error("Bill name is required.");
  }

  const amount = Number(amountRaw);

  if (Number.isNaN(amount)) {
    throw new Error("Amount must be a valid number.");
  }

  const dueDay = Number(dueDayRaw);

  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    throw new Error("Due day must be a whole number between 1 and 31.");
  }

  const { error } = await supabase.from("bills").insert({
    household_id: membership.household_id,
    name,
    amount,
    due_day: dueDay,
    frequency,
    category: category || null,
    is_active: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/bills");
  revalidatePath("/dashboard");
}