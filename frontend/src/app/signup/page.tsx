'use client';
import { useState, useRef, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ── Password strength helper ──────────────────────────────────────────────────
function getStrength(p: string) {
  if (!p) return { score: 0, label: '', color: '' };
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return { score: s, label: 'Weak', color: '#ef4444' };
  if (s <= 3) return { score: s, label: 'Fair', color: '#f59e0b' };
  if (s === 4) return { score: s, label: 'Good', color: '#3b82f6' };
  return { score: s, label: 'Strong', color: '#22c55e' };
}

// ── OTP input component ───────────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const handleChange = (idx: number, raw: string) => {
    if (raw.length > 1) {
      const digits = raw.replace(/\D/g, '').slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      digits.forEach((d, i) => { next[i] = d; });
      onChange(next);
      refs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }
    const digit = raw.replace(/\D/g, '');
    const next = [...value];
    next[idx] = digit;
    onChange(next);
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
  };
  const handleKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      const next = [...value];
      next[idx - 1] = '';
      onChange(next);
      refs.current[idx - 1]?.focus();
    }
  };
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '4px 0 20px' }}>
      {value.map((digit, idx) => (
        <input
          key={idx}
          id={`otp-digit-${idx}`}
          ref={el => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={digit}
          onChange={e => handleChange(idx, e.target.value)}
          onKeyDown={e => handleKey(idx, e)}
          autoComplete="one-time-code"
          style={{
            width: 48,
            height: 56,
            border: `1.5px solid ${digit ? '#6366f1' : '#e2e8f0'}`,
            borderRadius: 10,
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 700,
            color: '#1e293b',
            background: digit ? '#eef2ff' : '#fff',
            outline: 'none',
            fontFamily: 'monospace',
            transition: 'all .2s',
            boxShadow: digit ? '0 0 0 3px rgba(99,102,241,.12)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

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
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 12px 11px 40px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  color: '#1e293b',
  background: '#fff',
  outline: 'none',
  transition: 'border-color .2s, box-shadow .2s',
  fontFamily: 'inherit',
};

const tools = [
  { label: 'Payroll Tools', href: '#payroll' },
  { label: 'Invoicing', href: '#invoicing' },
  { label: 'Utilities', href: '#utilities' },
  { label: 'My Documents', href: '/dashboard' },
];

export default function SignupPage() {
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [toolsOpen, setToolsOpen] = useState(false);
  const router = useRouter();

  const strength = getStrength(password);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send verification code.');
      } else {
        setStep('verify');
        setSuccess(`Verification code sent to ${email}`);
        setResendTimer(60);
      }
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification failed.');
      } else {
        const signInRes = await signIn('credentials', { redirect: false, email, password });
        if (signInRes?.error) {
          router.push('/login');
        } else {
          router.push('/');
        }
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to resend code.');
      } else {
        setSuccess('New code sent.');
        setResendTimer(60);
        setOtpDigits(['', '', '', '', '', '']);
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .auth-root { font-family: 'Inter', sans-serif; }
        .auth-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.12) !important; }
        .auth-btn { background: linear-gradient(135deg, #3b82f6, #6366f1); transition: all .2s; }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,.35); }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: .6; cursor: not-allowed; }
        .spin { animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .tools-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; color: #475569; font-size: 13px; text-decoration: none; transition: color .15s; }
        .tools-item:hover { color: #6366f1; }
        .right-panel { background: linear-gradient(160deg, #f1f5f9 0%, #e8edf5 100%); }
        @media (max-width: 1023px) { .right-panel { display: none !important; } .form-col { width: 100% !important; } }
      `}</style>

      <div className="auth-root" style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>

        {/* ── LEFT: FORM ─────────────────────────────────────────────────────── */}
        <div className="form-col" style={{ width: '55%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', minHeight: '100vh' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Logo */}
            <div style={{ marginBottom: 32 }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <img src="/logo-transparent.png" alt="PayDocs Logo" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
                <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>PayDocs</span>
              </Link>
            </div>

            {/* ── OTP VERIFY STEP ── */}
            {step === 'verify' ? (
              <form onSubmit={handleVerifyOtp} noValidate>
                <button
                  type="button"
                  onClick={() => { setStep('form'); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}
                >
                  ← Back
                </button>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                  Check your inbox
                </h1>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px', lineHeight: 1.6 }}>
                  Enter the 6-digit code sent to <strong style={{ color: '#475569' }}>{email}</strong>
                </p>

                {error && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 13, marginBottom: 18 }}>
                    ⚠ {error}
                  </div>
                )}
                {success && (
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, color: '#16a34a', fontSize: 13, marginBottom: 18 }}>
                    ✓ {success}
                  </div>
                )}

                <OtpInput value={otpDigits} onChange={setOtpDigits} />

                <button
                  id="verify-otp-btn"
                  type="submit"
                  className="auth-btn"
                  disabled={loading || otpDigits.join('').length < 6}
                  style={{ width: '100%', padding: 13, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 10, cursor: 'pointer' }}
                >
                  {loading ? (
                    <>
                      <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', marginRight: 8, verticalAlign: 'middle' }} />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Create Account'
                  )}
                </button>

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#94a3b8' }}>
                  Didn't get it?{' '}
                  <button
                    id="resend-otp-btn"
                    type="button"
                    disabled={resendTimer > 0 || loading}
                    onClick={handleResend}
                    style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: resendTimer > 0 ? 'default' : 'pointer', color: resendTimer > 0 ? '#cbd5e1' : '#6366f1' }}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                  </button>
                </p>
              </form>
            ) : (
              /* ── SIGNUP FORM ── */
              <>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                  Create your account
                </h1>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
                  Enter your details below to get started.
                </p>

                {error && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 13, marginBottom: 18 }}>
                    ⚠ {error}
                  </div>
                )}
                {success && (
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, color: '#16a34a', fontSize: 13, marginBottom: 18 }}>
                    ✓ {success}
                  </div>
                )}

                <form onSubmit={handleSendOtp} noValidate style={{ display: 'flex', flexDirection: 'column' }}>

                  {/* Email */}
                  <label htmlFor="signup-email" style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Email address
                  </label>
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                      <MailIcon />
                    </span>
                    <input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="auth-input"
                      style={inputStyle}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Password */}
                  <label htmlFor="signup-password" style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative', marginBottom: password ? 4 : 20 }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                      <LockIcon />
                    </span>
                    <input
                      id="signup-password"
                      type={showPw ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Min. 6 characters"
                      className="auth-input"
                      style={{ ...inputStyle, paddingRight: 40 }}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      id="toggle-pw"
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      aria-label="Toggle password visibility"
                      style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <EyeIcon open={showPw} />
                    </button>
                  </div>

                  {/* Password strength meter */}
                  {password && strength && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 3,
                              borderRadius: 99,
                              background: i <= strength.score ? strength.color : '#e2e8f0',
                              transition: 'background .3s',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: strength.color, textAlign: 'right', fontWeight: 500 }}>
                        {strength.label}
                      </div>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    id="signup-btn"
                    type="submit"
                    className="auth-btn"
                    disabled={loading}
                    style={{ width: '100%', padding: 13, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', borderRadius: 10, cursor: 'pointer' }}
                  >
                    {loading ? (
                      <>
                        <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', marginRight: 8, verticalAlign: 'middle' }} />
                        Sending verification code...
                      </>
                    ) : (
                      'Sign up'
                    )}
                  </button>
                </form>

                {/* Footer link to Login */}
                <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#94a3b8' }}>
                  Already have an account?{' '}
                  <Link href="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                    Log in
                  </Link>
                </p>

                {/* Security notice */}
                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11.5, color: '#94a3b8', lineHeight: 1.6 }}>
                  🔒 We will send a 6-digit code to verify your email before creating your account.
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: INFO PANEL ──────────────────────────────────────────────── */}
        <div className="right-panel" style={{ width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(59,130,246,.05)', pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 36, boxShadow: '0 20px 60px rgba(15,23,42,.1)' }}>
              <Image src="/auth-illustration.jpg" alt="PayDocs product illustration" width={360} height={260} style={{ width: '100%', height: 'auto', display: 'block' }} priority />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.4px', lineHeight: 1.3 }}>
              Manage payroll and documents in one place
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 28px' }}>
              Generate payslips, create invoices, calculate GST and CTC, and manage all your business documents — all from a single, secure workspace.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['Professional PDF payslips & invoices', 'GST, CTC & salary calculations', 'PDF utilities: merge, watermark, sign'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckIcon />
                  </div>
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <button
                onClick={() => setToolsOpen(v => !v)}
                type="button"
                style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {toolsOpen ? '▾' : '▸'} See all tools
              </button>
              {toolsOpen && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column' }}>
                  {tools.map(t => (
                    <a key={t.label} href={t.href} className="tools-item">
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c7d2fe', flexShrink: 0 }} />
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
