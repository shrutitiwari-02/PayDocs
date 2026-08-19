'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ── Icons ──────────────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '11px 12px 11px 40px',
  border: '1.5px solid #e2e8f0', borderRadius: 10,
  fontSize: 14, color: '#1e293b', background: '#fff',
  outline: 'none', transition: 'border-color .2s, box-shadow .2s',
  fontFamily: 'inherit',
};

const tools = [
  { label: 'Payroll Tools', href: '#payroll' },
  { label: 'Invoicing', href: '#invoicing' },
  { label: 'Utilities', href: '#utilities' },
  { label: 'My Documents', href: '/dashboard' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', { redirect: false, email, password });
      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Invalid email or password.' : res.error);
      } else {
        router.push('/');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        html, body { overflow: hidden !important; height: 100vh !important; margin: 0; padding: 0; }
        .auth-root { font-family: 'Inter', sans-serif; height: 100vh; overflow: hidden; }
        .auth-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.12) !important; }
        .auth-btn { background: linear-gradient(135deg, #3b82f6, #6366f1); transition: all .2s; }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,.35); }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: .6; cursor: not-allowed; }
        .spin { animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .tools-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; color: #475569; font-size: 12.5px; text-decoration: none; transition: color .15s; }
        .tools-item:hover { color: #6366f1; }
        .right-panel { background: linear-gradient(160deg, #f1f5f9 0%, #e8edf5 100%); }
        @media (max-width: 1023px) { .right-panel { display: none !important; } .form-col { width: 100% !important; } }
      `}</style>

      <div className="auth-root" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#fff' }}>

        {/* ── LEFT: FORM ─────────────────────────────────────────────────────── */}
        <div className="form-col" style={{ width: '55%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px', height: '100vh', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: 380 }}>

            {/* Logo */}
            <div style={{ marginBottom: 20 }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <img src="/logo-transparent.png" alt="PayDocs Logo" style={{ height: 42, width: 'auto', objectFit: 'contain' }} />
                <span style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>PayDocs</span>
              </Link>
            </div>

            {/* Heading */}
            <h1 style={{ fontSize: 25, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              Login to your account
            </h1>
            <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 20px' }}>
              Welcome back — enter your details below.
            </p>

            {/* Error */}
            {error && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 12.5, marginBottom: 14 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column' }}>

              {/* Email */}
              <label htmlFor="login-email" style={{ fontSize: 12.5, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
                Email address
              </label>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                  <MailIcon />
                </span>
                <input
                  id="login-email" type="email" required autoComplete="email"
                  placeholder="Enter your email"
                  className="auth-input"
                  style={inputStyle}
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label htmlFor="login-password" style={{ fontSize: 12.5, fontWeight: 500, color: '#374151' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot your password?
                </Link>
              </div>
              <div style={{ position: 'relative', marginBottom: 18 }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                  <LockIcon />
                </span>
                <input
                  id="login-password" type={showPw ? 'text' : 'password'}
                  required minLength={6} autoComplete="current-password"
                  placeholder="Password"
                  className="auth-input"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button id="toggle-pw" type="button" onClick={() => setShowPw(v => !v)}
                  aria-label="Toggle password visibility"
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>

              {/* Submit */}
              <button id="login-btn" type="submit" className="auth-btn" disabled={loading}
                style={{ width: '100%', padding: 11, color: '#fff', fontWeight: 700, fontSize: 14.5, border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                {loading
                  ? <><span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', marginRight: 8, verticalAlign: 'middle' }} />Signing in...</>
                  : 'Log in'
                }
              </button>
            </form>

            {/* Footer link */}
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#94a3b8' }}>
              Don't have an account?{' '}
              <Link href="/signup" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* ── RIGHT: INFO PANEL ──────────────────────────────────────────────── */}
        <div className="right-panel" style={{ width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 36px', height: '100vh', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(59,130,246,.05)', pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: 340, position: 'relative', zIndex: 1 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, boxShadow: '0 16px 40px rgba(15,23,42,.08)' }}>
              <Image src="/auth-illustration.jpg" alt="PayDocs product illustration" width={340} height={200} style={{ width: '100%', height: 'auto', display: 'block' }} priority />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.4px', lineHeight: 1.3 }}>
              Manage payroll and documents in one place
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 20px' }}>
              Generate payslips, create invoices, calculate GST and CTC, and manage all your business documents — all from a single, secure workspace.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {['Professional PDF payslips & invoices', 'GST, CTC & salary calculations', 'PDF utilities: merge, watermark, sign'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckIcon />
                  </div>
                  <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <button onClick={() => setToolsOpen(v => !v)} type="button"
                style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {toolsOpen ? '▾' : '▸'} See all tools
              </button>
              {toolsOpen && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' }}>
                  {tools.map(t => (
                    <a key={t.label} href={t.href} className="tools-item">
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c7d2fe', flexShrink: 0 }} />
                      {t.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
