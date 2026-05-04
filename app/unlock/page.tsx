"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

const UNLOCK_KEY = "moments_unlocked";
const SECRET = "Whiteshark@1";

export default function UnlockPage() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  useEffect(() => {
    setAlreadyUnlocked(localStorage.getItem(UNLOCK_KEY) === "true");
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (secret === SECRET) {
      localStorage.setItem(UNLOCK_KEY, "true");
      setAlreadyUnlocked(true);
      setStatus("ok");
    } else {
      setStatus("bad");
    }
  };

  const onLock = () => {
    localStorage.removeItem(UNLOCK_KEY);
    setAlreadyUnlocked(false);
    setStatus("idle");
    setSecret("");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-12">
      <div className="fade-in w-full">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.32em] text-[#a06a7c]">
            Punith &amp; Pallavi
          </p>
          <h1 className="font-serif text-4xl font-light tracking-tight text-[#3a2030] sm:text-5xl">
            Unlock
          </h1>
          <p className="mt-3 text-sm italic text-[#7a5560]">
            Enter the secret to enable adding & editing moments.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-rose-200 bg-white/80 p-6 shadow-[0_20px_60px_-15px_rgba(180,80,110,0.25)] backdrop-blur-sm"
        >
          <label className="block">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-rose-500">
              Secret
            </span>
            <input
              type="password"
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                if (status === "bad") setStatus("idle");
              }}
              autoFocus
              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-[#3a2030] focus:border-rose-400 focus:outline-none"
              placeholder="••••••••"
            />
          </label>

          {status === "bad" && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Wrong secret. Try again.
            </p>
          )}
          {status === "ok" && (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Unlocked. You can now add, edit, and delete moments.{" "}
              <Link href="/" className="font-medium underline">
                Back to the page →
              </Link>
            </p>
          )}

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={onLock}
              disabled={!alreadyUnlocked}
              className="text-xs uppercase tracking-[0.16em] text-[#9a7080] hover:text-rose-700 disabled:opacity-40"
            >
              Lock
            </button>
            <button
              type="submit"
              className="rounded-full bg-rose-500 px-6 py-2 text-sm font-medium text-white shadow-md transition hover:bg-rose-600"
            >
              Unlock
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-[#9a7080]">
          {alreadyUnlocked
            ? "Currently unlocked on this device."
            : "Currently locked on this device."}
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.18em] text-[#9a7080] underline-offset-4 hover:text-rose-700 hover:underline"
          >
            ← Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
