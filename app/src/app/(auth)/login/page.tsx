"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const CSS = `
  .lp-root {
    min-height: 100vh;
    display: flex;
    font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
  }

  /* ── LEFT PANEL ── */
  .lp-brand {
    width: 44%;
    background: #0D1B2A;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px;
    position: relative;
    overflow: hidden;
  }

  .lp-brand::before {
    content: '';
    position: absolute;
    top: -120px; right: -80px;
    width: 380px; height: 380px;
    border-radius: 50%;
    background: rgba(234, 88, 12, 0.12);
    filter: blur(90px);
    pointer-events: none;
  }

  .lp-brand::after {
    content: '';
    position: absolute;
    bottom: -60px; left: -40px;
    width: 260px; height: 260px;
    border-radius: 50%;
    background: rgba(234, 88, 12, 0.06);
    filter: blur(70px);
    pointer-events: none;
  }

  .lp-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 1;
    text-decoration: none;
  }

  .lp-logomark {
    width: 36px; height: 36px;
    background: #EA580C;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 16px;
    color: #fff;
  }

  .lp-logoname {
    color: #fff;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: -0.3px;
  }

  .lp-headline {
    position: relative;
    z-index: 1;
  }

  .lp-headline h1 {
    font-size: 44px;
    font-weight: 800;
    color: #fff;
    line-height: 1.08;
    margin: 0 0 20px;
    letter-spacing: -1.5px;
  }

  .lp-headline h1 em {
    font-style: italic;
    color: #FB923C;
  }

  .lp-headline p {
    color: rgba(255,255,255,0.45);
    font-size: 15px;
    line-height: 1.65;
    margin: 0;
    max-width: 340px;
  }

  .lp-stat-row {
    display: flex;
    gap: 28px;
    position: relative;
    z-index: 1;
    margin-top: 32px;
  }

  .lp-stat { display: flex; flex-direction: column; gap: 3px; }

  .lp-stat-num {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -1px;
  }

  .lp-stat-label {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.3px;
  }

  .lp-testimonial {
    background: rgba(255,255,255,0.05);
    border-radius: 14px;
    padding: 24px 26px;
    border: 1px solid rgba(255,255,255,0.08);
    position: relative;
    z-index: 1;
  }

  .lp-testimonial blockquote {
    color: rgba(255,255,255,0.75);
    font-size: 14px;
    line-height: 1.75;
    margin: 0 0 18px;
    font-style: italic;
  }

  .lp-testimonial-author { display: flex; align-items: center; gap: 12px; }

  .lp-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #EA580C 0%, #FB923C 100%);
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    font-weight: 800; font-size: 13px;
    flex-shrink: 0;
  }

  .lp-author-name { color: #fff; font-size: 13px; font-weight: 700; }
  .lp-author-role { color: rgba(255,255,255,0.35); font-size: 12px; }

  /* ── RIGHT PANEL ── */
  .lp-form-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 52px 64px;
    background: #F0F4F8;
  }

  .lp-form-inner {
    width: 100%;
    max-width: 380px;
    animation: lpFadeUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  @keyframes lpFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .lp-form-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: #EA580C;
    margin-bottom: 14px;
  }

  .lp-form-title {
    font-size: 34px;
    font-weight: 800;
    color: #0D1B2A;
    margin: 0 0 8px;
    letter-spacing: -0.8px;
  }

  .lp-form-sub {
    color: #64748B;
    font-size: 15px;
    margin: 0 0 36px;
  }

  .lp-field { margin-bottom: 20px; }

  .lp-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #0D1B2A;
    margin-bottom: 8px;
  }

  .lp-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .lp-input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #E2E8F0;
    border-radius: 8px;
    background: #fff;
    font-size: 15px;
    color: #0D1B2A;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .lp-input:focus {
    border-color: #EA580C;
    box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
  }

  .lp-input::placeholder { color: #94A3B8; }

  .lp-forgot {
    font-size: 13px;
    color: #EA580C;
    font-weight: 600;
    text-decoration: none;
  }
  .lp-forgot:hover { text-decoration: underline; }

  .lp-submit {
    width: 100%;
    padding: 14px;
    background: #EA580C;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 28px;
    font-family: inherit;
    letter-spacing: -0.2px;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
    box-shadow: 0 1px 3px rgba(234, 88, 12, 0.3);
  }

  .lp-submit:hover:not(:disabled) {
    background: #C2410C;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
  }

  .lp-submit:active:not(:disabled) { transform: translateY(0); }

  .lp-submit:disabled {
    background: #CBD5E1;
    cursor: not-allowed;
    box-shadow: none;
  }

  .lp-switch {
    text-align: center;
    margin-top: 26px;
    font-size: 14px;
    color: #64748B;
  }

  .lp-switch a {
    color: #EA580C;
    font-weight: 700;
    text-decoration: none;
  }
  .lp-switch a:hover { text-decoration: underline; }

  @media (max-width: 768px) {
    .lp-brand { display: none; }
    .lp-form-panel { padding: 40px 24px; }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="lp-root">

        {/* ── Brand Panel ── */}
        <div className="lp-brand">
          <Link href="/" className="lp-logo">
            <div className="lp-logomark">C</div>
            <span className="lp-logoname">ContractHub</span>
          </Link>

          <div className="lp-headline">
            <h1>
              Your contracting<br />
              business,<br />
              <em>organized.</em>
            </h1>
            <p>
              Everything you need to run your solo contracting business —
              clients, work orders, invoices, and more.
            </p>
            <div className="lp-stat-row">
              <div className="lp-stat">
                <span className="lp-stat-num">3h+</span>
                <span className="lp-stat-label">saved per week</span>
              </div>
              <div className="lp-stat">
                <span className="lp-stat-num">30d</span>
                <span className="lp-stat-label">free trial</span>
              </div>
              <div className="lp-stat">
                <span className="lp-stat-num">$0</span>
                <span className="lp-stat-label">to get started</span>
              </div>
            </div>
          </div>

          <div className="lp-testimonial">
            <blockquote>
              &ldquo;I went from sticky notes and spreadsheets to having everything
              in one place. I save at least 3 hours every week.&rdquo;
            </blockquote>
            <div className="lp-testimonial-author">
              <div className="lp-avatar">M</div>
              <div>
                <div className="lp-author-name">Marcus T.</div>
                <div className="lp-author-role">Solo contractor &middot; Austin, TX</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Panel ── */}
        <div className="lp-form-panel">
          <div className="lp-form-inner">
            <p className="lp-form-eyebrow">Sign in</p>
            <h2 className="lp-form-title">Welcome back</h2>
            <p className="lp-form-sub">Good to see you again</p>

            <form onSubmit={handleLogin}>
              <div className="lp-field">
                <label className="lp-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="lp-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="lp-field">
                <div className="lp-label-row">
                  <label className="lp-label" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="lp-forgot">Forgot password?</Link>
                </div>
                <input
                  id="password"
                  className="lp-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="lp-submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <p className="lp-switch">
              Don&apos;t have an account?{" "}
              <Link href="/signup">Start your free trial</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
