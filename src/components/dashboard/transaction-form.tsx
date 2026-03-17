"use client";

import { useState, useTransition } from "react";
import { createTransaction } from "@/app/(app)/transactions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TransactionFormProps = {
  accounts: {
    id: string;
    name: string;
    type: string;
  }[];
};

export function TransactionForm({ accounts }: TransactionFormProps) {
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
            await createTransaction(formData);
            setSuccessMessage("Transaction created successfully.");
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : "Something went wrong."
            );
          }
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Account</label>
        <select
          name="account_id"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select an account
          </option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({account.type})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Date</label>
        <Input name="date" type="date" defaultValue={today} required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Direction</label>
        <select
          name="direction"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue="expense"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
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
        <label className="text-sm font-medium text-neutral-700">Merchant</label>
        <Input name="merchant" placeholder="Publix" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">
          Description
        </label>
        <Input name="description" placeholder="Groceries" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Category</label>
        <Input name="category" placeholder="Groceries" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Notes</label>
        <Input name="notes" placeholder="Optional notes" />
      </div>

      <Button
        type="submit"
        className="rounded-xl"
        disabled={pending || accounts.length === 0}
      >
        {pending ? "Saving..." : "Add transaction"}
      </Button>

      {accounts.length === 0 ? (
        <p className="text-sm text-red-600">
          You need at least one account before adding transactions.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-green-700">{successMessage}</p>
      ) : null}
    </form>
  );
}