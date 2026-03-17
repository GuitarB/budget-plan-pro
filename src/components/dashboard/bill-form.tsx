"use client";

import { useState, useTransition } from "react";
import { createBill } from "@/app/(app)/bills/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const frequencies = [
  { value: "monthly", label: "Monthly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "weekly", label: "Weekly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export function BillForm() {
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        setErrorMessage("");
        setSuccessMessage("");

        startTransition(async () => {
          try {
            await createBill(formData);
            setSuccessMessage("Bill created successfully.");
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : "Something went wrong."
            );
          }
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Bill name</label>
        <Input name="name" placeholder="Electric" required />
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
        <label className="text-sm font-medium text-neutral-700">Due day</label>
        <Input
          name="due_day"
          type="number"
          min="1"
          max="31"
          placeholder="15"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Frequency</label>
        <select
          name="frequency"
          defaultValue="monthly"
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
        <label className="text-sm font-medium text-neutral-700">Category</label>
        <Input name="category" placeholder="Utilities" />
      </div>

      <Button type="submit" className="rounded-xl" disabled={pending}>
        {pending ? "Saving..." : "Add bill"}
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