"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Loader2, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.login(username, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-olive-dark p-5">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-olive/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-sm border border-cream/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="text-center">
            <span className="font-display text-4xl font-bold tracking-[0.25em] text-cream">KALEEJ</span>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-olive">Management</p>
            <div className="mx-auto mt-6 h-px w-20 bg-olive" />
            <h1 className="mt-6 font-display text-2xl text-cream">Welcome back</h1>
            <p className="mt-2 text-xs text-cream/50">Sign in to manage your restaurant.</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="label !text-cream/55">Username</span>
              <input required value={username} onChange={(e) => setUsername(e.target.value)} className="field !border-cream/15 !bg-black/30 !text-cream" autoComplete="username" />
            </label>
            <label className="block">
              <span className="label !text-cream/55">Password</span>
              <div className="relative">
                <input required type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="field !border-cream/15 !bg-black/30 !pr-12 !text-cream" autoComplete="current-password" />
                <button type="button" onClick={() => setShow((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/45 hover:text-cream" aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && <p className="rounded-sm bg-olive/15 px-4 py-3 text-xs text-olive-200">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : <><LockKeyhole size={14} /> Sign in to dashboard</>}
            </button>
          </form>

          <div className="mt-8 border-t border-cream/10 pt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-semibold text-cream/50 hover:text-olive">
              <ArrowLeft size={13} /> Back to the website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
