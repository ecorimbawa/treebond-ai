"use client";

import { KeyRound, Mail } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  buttonClass,
  Callout,
  ConsoleMain,
  ErrorBanner,
  Field,
  PageHeader,
  Pill,
  SectionLabel,
} from "@/components/console/ui";

type Account = {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  placeholderEmail: boolean;
};

export function AccountSettings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/account");
    const json = await res.json();
    if (json.success) setAccount(json.data);
    else setError(json.error ?? "Failed to load account");
  }, []);

  useEffect(() => {
    load().finally(() => setIsLoading(false));
  }, [load]);

  async function submit(
    event: FormEvent<HTMLFormElement>,
    successMessage: string,
  ) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    // Only send what the sponsor actually filled in — a blank password field
    // shouldn't be read as "set my password to empty".
    const payload: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      const text = String(value).trim();
      if (text) payload[key] = text;
    }
    if (Object.keys(payload).length === 0) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      setAccount(json.data);
      setNotice(successMessage);
      formElement.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  const isWalletOnly = account?.placeholderEmail === true;

  return (
    <ConsoleMain>
      <PageHeader
        eyebrow="SPONSOR · SETTINGS"
        title="Your account"
        description="Change how you sign in and what we call you. Your trees stay attached to your linked wallets either way."
      />

      {error && (
        <div className="mt-8 max-w-2xl">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      )}
      {notice && (
        <p className="mt-8 max-w-2xl rounded-xl border border-[#cfe2d4] bg-[#eff7f1] px-4 py-3 text-sm font-semibold text-[#246B45]">
          {notice}
        </p>
      )}

      {isLoading ? (
        <p className="mt-8 text-sm text-[#929A94]">Loading…</p>
      ) : (
        <div className="mt-8 grid max-w-4xl gap-8 lg:grid-cols-2">
          <section>
            <SectionLabel>PROFILE</SectionLabel>
            <form
              onSubmit={(e) => submit(e, "Profile updated.")}
              className="mt-4 rounded-2xl border border-[#e2e7e2] bg-white p-6"
            >
              <div className="mb-5 flex items-center gap-2">
                <Pill tone="good">{account?.role?.toUpperCase() ?? "—"}</Pill>
                {isWalletOnly && <Pill tone="chain">WALLET ACCOUNT</Pill>}
              </div>
              <Field
                label="Display name"
                name="fullName"
                defaultValue={account?.fullName ?? ""}
                hint="Shown in your dashboard header"
              />
              <button
                type="submit"
                disabled={isSaving}
                className={`mt-5 ${buttonClass("primary")}`}
              >
                {isSaving ? "Saving…" : "Save profile"}
              </button>
            </form>
          </section>

          <section>
            <SectionLabel>
              {isWalletOnly ? "ADD EMAIL SIGN-IN" : "EMAIL & PASSWORD"}
            </SectionLabel>

            {isWalletOnly && (
              <div className="mt-4">
                <Callout
                  tone="note"
                  icon={<Mail size={16} aria-hidden="true" />}
                  title="You sign in with a wallet"
                >
                  Adding an email and password gives you a second way in, so
                  losing access to the wallet doesn&rsquo;t lock you out of your
                  portfolio.
                </Callout>
              </div>
            )}

            <form
              onSubmit={(e) =>
                submit(
                  e,
                  isWalletOnly
                    ? "Email sign-in added — you can now log in either way."
                    : "Sign-in details updated.",
                )
              }
              className="mt-4 rounded-2xl border border-[#e2e7e2] bg-white p-6"
            >
              <div className="grid gap-4">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={account?.email ?? ""}
                  placeholder={isWalletOnly ? "you@example.com" : undefined}
                  hint={isWalletOnly ? "Not set yet" : undefined}
                />
                {!isWalletOnly && (
                  <Field
                    label="Current password"
                    name="currentPassword"
                    type="password"
                    hint="Required to change your password"
                  />
                )}
                <Field
                  label={isWalletOnly ? "Choose a password" : "New password"}
                  name="password"
                  type="password"
                  hint="At least 8 characters"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className={`mt-5 ${buttonClass("primary")}`}
              >
                <KeyRound size={15} aria-hidden="true" />
                {isSaving
                  ? "Saving…"
                  : isWalletOnly
                    ? "Add email sign-in"
                    : "Update sign-in"}
              </button>
            </form>
          </section>
        </div>
      )}
    </ConsoleMain>
  );
}
