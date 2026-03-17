"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          setLoading(false);
          return;
        }

        setMessage("Account created. You can now sign in.");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          setLoading(false);
          return;
        }

        setMessage("Signed in successfully.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">Password</label>
        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full rounded-xl" disabled={loading}>
        {loading
          ? mode === "signup"
            ? "Creating account..."
            : "Signing in..."
          : mode === "signup"
            ? "Create account"
            : "Sign in"}
      </Button>

      {message ? (
        <p className="text-sm text-neutral-600">{message}</p>
      ) : null}
    </form>
  );
}