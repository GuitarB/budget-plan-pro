"use client";

import { useState, useTransition } from "react";
import { createAccount } from "@/app/(app)/accounts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const accountTypes = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit_card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "loan", label: "Loan" },
  { value: "other", label: "Other" },
];

export function AccountForm() {
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
            await createAccount(formData);
            setSuccessMessage("Account created successfully.");
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
          Account name
        </label>
        <Input name="name" placeholder="Checking" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Account type
        </label>
        <select
          name="type"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue="checking"
        >
          {accountTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Institution
        </label>
        <Input name="institution" placeholder="Manual or bank name" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Starting balance
        </label>
        <Input
          name="balance"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
        />
      </div>

      <Button type="submit" className="rounded-xl" disabled={pending}>
        {pending ? "Saving..." : "Add account"}
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