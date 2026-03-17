"use client";

import { useState, useTransition } from "react";
import { createIncomeSource } from "@/app/(app)/income/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "semimonthly", label: "Semi-monthly" },
  { value: "monthly", label: "Monthly" },
  { value: "other", label: "Other" },
];

export function IncomeForm() {
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        setErrorMessage("");
        setSuccessMessage("");

        startTransition(async () => {
          try {
            await createIncomeSource(formData);
            setSuccessMessage("Income source created successfully.");
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : "Something went wrong."
            );
          }
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Income source name
        </label>
        <Input name="name" placeholder="Main Paycheck" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Amount</label>
        <Input
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Frequency</label>
        <select
          name="frequency"
          defaultValue="biweekly"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {frequencies.map((frequency) => (
            <option key={frequency.value} value={frequency.value}>
              {frequency.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Next pay date
        </label>
        <Input name="next_pay_date" type="date" defaultValue={today} required />
      </div>

      <Button type="submit" className="rounded-xl" disabled={pending}>
        {pending ? "Saving..." : "Add income source"}
      </Button>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-green-700">{successMessage}</p>
      ) : null}
    </form>
  );
}