"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerAccountForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`/api/account/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not access your account.");
      router.push("/account"); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not access your account."); }
    finally { setBusy(false); }
  };

  return <form className="sa-customer-form" onSubmit={submit}>
    {mode === "signup" && <div className="sa-customer-form-grid"><label>First name<input name="firstName" autoComplete="given-name" maxLength={60} required/></label><label>Last name<input name="lastName" autoComplete="family-name" maxLength={60} required/></label></div>}
    <label>Email address<input type="email" name="email" autoComplete="email" maxLength={254} required/></label>
    {mode === "signup" && <label>Mobile number<input type="tel" name="phone" autoComplete="tel" inputMode="tel" maxLength={24} required/></label>}
    <label>Password<input type="password" name="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} required/>{mode === "signup" && <small>Use at least 8 characters.</small>}</label>
    {mode === "signup" && <details className="sa-customer-address"><summary>Add delivery address (optional)</summary><div className="sa-customer-form-grid"><label className="wide">Address<input name="address" autoComplete="street-address" maxLength={160}/></label><label className="wide">Apartment, suite, etc.<input name="addressLine2" maxLength={100}/></label><label>City<input name="city" autoComplete="address-level2" maxLength={80}/></label><label>State<input name="state" autoComplete="address-level1" maxLength={80}/></label><label>PIN code<input name="pincode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}/></label></div></details>}
    {error && <p className="sa-customer-error" role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? "PLEASE WAIT…" : mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}</button>
    <p className="sa-customer-switch">{mode === "signup" ? "Already have an account? " : "New to Sri Alankar Jewellers? "}<Link href={mode === "signup" ? "/account/login" : "/account/signup"}>{mode === "signup" ? "Sign in" : "Create an account"}</Link></p>
  </form>;
}
