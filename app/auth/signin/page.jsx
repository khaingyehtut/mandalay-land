"use client";

import { useState, Suspense } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerUser } from "@/lib/actions/auth";

// ── Shared input style ─────────────────────────────────────────────────────
const inp =
  "w-full bg-[#191C23] border border-[#2C313C] rounded-xl px-4 py-3 text-[#ECE6D9] text-sm placeholder-[#555A66] outline-none transition-all focus:border-[#E0A33B] focus:ring-2 focus:ring-[#E0A33B]/10";

// ── Google icon ────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// ── Facebook icon ──────────────────────────────────────────────────────────
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

// ── OAuth button ───────────────────────────────────────────────────────────
function OAuthBtn({ provider, icon, label, callbackUrl }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await signIn(provider, { callbackUrl });
      }}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[#2C313C] bg-[#191C23] text-[#ECE6D9] text-sm font-medium hover:border-[#3a4150] hover:bg-[#1f2330] active:scale-[.98] transition-all disabled:opacity-60"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-[#888B95]/30 border-t-[#888B95] rounded-full animate-spin" />
      ) : icon}
      {label}
    </button>
  );
}

// ── Sign-in form ───────────────────────────────────────────────────────────
function SignInForm({ callbackUrl }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email သို့မဟုတ် Password မှားနေသည်");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="email" type="email" required placeholder="Email လိပ်စာ" className={inp} autoComplete="email" />
      <input name="password" type="password" required placeholder="Password" className={inp} autoComplete="current-password" />
      {error && (
        <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-[#1A1206] bg-[#E0A33B] hover:bg-amber-400 active:scale-[.98] transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50 text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-[#1A1206]/30 border-t-[#1A1206] rounded-full animate-spin" />
            ဝင်ရောက်နေသည်...
          </span>
        ) : "ဝင်ရောက်မည်"}
      </button>
    </form>
  );
}

// ── Submit button that reads pending state from nearest form ───────────────
function RegisterBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl font-bold text-[#1A1206] bg-[#E0A33B] hover:bg-amber-400 active:scale-[.98] transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50 text-sm"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-[#1A1206]/30 border-t-[#1A1206] rounded-full animate-spin" />
          အကောင့် ဖွင့်နေသည်...
        </span>
      ) : "အကောင့် ဖွင့်မည်"}
    </button>
  );
}

// ── Sign-up form ───────────────────────────────────────────────────────────
function SignUpForm({ onSuccess }) {
  const [state, action] = useFormState(registerUser, {});

  if (state?.success) {
    onSuccess(state.email);
    return null;
  }

  return (
    <form action={action} className="space-y-3">
      <input name="name" type="text" required minLength={2} placeholder="နာမည်" className={inp} />
      <input name="email" type="email" required placeholder="Email လိပ်စာ" className={inp} autoComplete="email" />
      <input name="password" type="password" required minLength={6} placeholder="Password (အနည်းဆုံး ၆ လုံး)" className={inp} autoComplete="new-password" />
      {state?.error && (
        <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <RegisterBtn />
    </form>
  );
}

// ── Inner page (needs Suspense because of useSearchParams) ─────────────────
function SignInInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  const [registered, setRegistered] = useState(null);

  function handleRegistered(email) {
    setRegistered(email);
    setTab("signin");
  }

  return (
    <div className="min-h-screen bg-[#0C0D11] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl border-2 border-[#E0A33B] grid place-items-center mx-auto mb-4 bg-[#E0A33B]/5">
            <svg className="w-7 h-7 text-[#E0A33B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#ECE6D9] mm">မန်းလေး မြေကွက်</h1>
          <p className="text-[#888B95] text-sm mt-1">
            {tab === "signin" ? "အကောင့်ဝင်မည်" : "အကောင့်အသစ် ဖွင့်မည်"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#13151A] border border-[#2C313C] rounded-2xl p-6 shadow-2xl shadow-black/60">

          {/* Tab bar */}
          <div className="flex border border-[#2C313C] rounded-xl p-1 mb-5 gap-1">
            {[["signin", "ဝင်ရောက်မည်"], ["signup", "အကောင့်ဖွင့်မည်"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setTab(v)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all mm ${
                  tab === v
                    ? "bg-[#E0A33B] text-[#1A1206]"
                    : "text-[#888B95] hover:text-[#ECE6D9]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Success banner after registration */}
          {registered && (
            <div className="mb-4 bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-emerald-400 text-xs mm">
              အကောင့် ဖွင့်ပြီးပါပြီ — ယခု ဝင်ရောက်နိုင်ပါပြီ
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-2.5 mb-5">
            <OAuthBtn
              provider="google"
              icon={<GoogleIcon />}
              label="Google ဖြင့် ဆက်လက်မည်"
              callbackUrl={callbackUrl}
            />
            <OAuthBtn
              provider="facebook"
              icon={<FacebookIcon />}
              label="Facebook ဖြင့် ဆက်လက်မည်"
              callbackUrl={callbackUrl}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#2C313C]" />
            <span className="text-[#555A66] text-xs">သို့မဟုတ်</span>
            <div className="flex-1 h-px bg-[#2C313C]" />
          </div>

          {/* Email form */}
          {tab === "signin" ? (
            <SignInForm callbackUrl={callbackUrl} />
          ) : (
            <SignUpForm onSuccess={handleRegistered} />
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-[#888B95] text-xs mt-5">
          {tab === "signin" ? (
            <>
              အကောင့် မရှိသေးဘူးလား?{" "}
              <button onClick={() => setTab("signup")} className="text-[#E0A33B] hover:underline mm">
                အကောင့်ဖွင့်မည်
              </button>
            </>
          ) : (
            <>
              အကောင့် ရှိပြီးသားလား?{" "}
              <button onClick={() => setTab("signin")} className="text-[#E0A33B] hover:underline mm">
                ဝင်ရောက်မည်
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// ── Export with Suspense wrapper (required by useSearchParams) ─────────────
export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0D11]" />}>
      <SignInInner />
    </Suspense>
  );
}
