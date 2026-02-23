import { useState, useRef, useEffect } from 'react';
import { User, Mail, Lock, IdCard, ArrowLeft, CheckCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import authService from '../services/auth.service';

/* ── Design tokens ── */
const CHARCOAL = '#1e2028';
const BORDER = '#2e3240';
const BG_RIGHT = '#13151a';

/* ── Shared AuthInput ── */
function AuthInput({ icon: Icon, type = 'text', rightEl, label, hint, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: focused ? '#F27125' : '#6b7280', transition: 'color 0.2s' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200"
          style={{ color: focused ? '#F27125' : '#4b5563' }} />
        <input
          type={type}
          className="w-full pl-10 pr-10 py-3.5 rounded-xl text-sm text-white focus:outline-none transition-all duration-200 placeholder-gray-700"
          style={{
            background: CHARCOAL,
            border: `1px solid ${focused ? '#F27125' : BORDER}`,
            boxShadow: focused ? '0 0 0 3px rgba(242,113,37,0.12), 0 0 20px rgba(242,113,37,0.06)' : 'none',
            caretColor: '#F27125',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-gray-700">{hint}</p>}
    </div>
  );
}

/* ── OTP digit boxes ── */
function OtpBoxes({ value, onChange }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = digits.map((d, idx) => idx === i ? '' : d).join('').padEnd(6, '');
      onChange(next.trimEnd());
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits];
    next[i] = e.key;
    onChange(next.join('').replace(/ /g, ''));
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-between">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i]}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onChange={() => { }}
          className="w-full aspect-square rounded-2xl text-xl font-bold text-center focus:outline-none transition-all duration-200"
          style={{
            background: digits[i] ? 'rgba(242,113,37,0.1)' : CHARCOAL,
            border: digits[i] ? '2px solid rgba(242,113,37,0.6)' : `2px solid ${BORDER}`,
            color: '#F27125',
            boxShadow: digits[i] ? '0 0 12px rgba(242,113,37,0.15)' : 'none',
          }}
          onFocus={e => { e.target.style.borderColor = '#F27125'; e.target.style.boxShadow = '0 0 0 3px rgba(242,113,37,0.15)'; }}
          onBlur={e => {
            e.target.style.boxShadow = digits[i] ? '0 0 12px rgba(242,113,37,0.15)' : 'none';
            e.target.style.borderColor = digits[i] ? 'rgba(242,113,37,0.6)' : BORDER;
          }}
        />
      ))}
    </div>
  );
}

/* ── Countdown timer ── */
function Countdown({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return (
    <span className={`font-mono text-sm font-bold ${left < 30 ? 'text-red-400' : 'text-[#F27125]'}`}>
      {m}:{s}
    </span>
  );
}

/* ── Step indicator ── */
function StepIndicator({ current }) {
  const steps = ['Details', 'Verify', 'Done'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: done ? 'linear-gradient(135deg,#F27125,#d96420)' : active ? 'rgba(242,113,37,0.18)' : 'rgba(255,255,255,0.06)',
                  border: done ? 'none' : `2px solid ${active ? '#F27125' : 'rgba(255,255,255,0.12)'}`,
                  color: done ? '#fff' : active ? '#F27125' : '#6b7280',
                  boxShadow: active ? '0 0 16px rgba(242,113,37,0.35)' : 'none',
                }}>
                {done ? '✓' : idx}
              </div>
              <p className="text-[10px] mt-1 font-medium"
                style={{ color: active ? '#F27125' : done ? '#9ca3af' : '#4b5563' }}>
                {label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-4 rounded-full transition-all duration-500"
                style={{
                  width: 40,
                  background: done ? 'linear-gradient(90deg,#F27125,rgba(242,113,37,0.3))' : 'rgba(255,255,255,0.07)',
                }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Left Panel ── */
function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
      style={{ background: '#0e1016' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(242,113,37,0.20) 0%,transparent 65%)', filter: 'blur(80px)', animation: 'orb1 12s ease-in-out infinite' }} />
        <div className="absolute top-[30%] -right-32 w-[480px] h-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.14) 0%,transparent 65%)', filter: 'blur(90px)', animation: 'orb2 15s ease-in-out infinite' }} />
        <div className="absolute -bottom-24 left-[25%] w-[360px] h-[360px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.10) 0%,transparent 65%)', filter: 'blur(80px)', animation: 'orb1 18s 3s ease-in-out infinite' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full px-12 py-10 text-white">
        <div className="flex items-center gap-3 auth-fade-in">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base btn-shimmer"
            style={{ background: 'linear-gradient(135deg,#F27125,#d96420)', boxShadow: '0 4px 20px rgba(242,113,37,0.4)' }}>S</div>
          <span className="font-bold text-xl tracking-tight">SWP Hub</span>
          <span className="ml-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ color: '#F27125', background: 'rgba(242,113,37,0.12)', border: '1px solid rgba(242,113,37,0.25)' }}>Beta</span>
        </div>

        <div className="mt-auto mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 auth-fade-in-delay-1"
            style={{ color: '#F27125' }}>Start your journey</p>
          <h2 className="text-[2.6rem] font-extrabold leading-[1.15] tracking-tight mb-4 auth-fade-in-delay-1">
            Join thousands of<br />
            <span className="gradient-text">FPT students.</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs auth-fade-in-delay-2">
            Create your account and access AI-powered tools, smart team matching, and project management.
          </p>
        </div>

        <div className="space-y-2.5 mb-8">
          {[
            { icon: '🤖', label: 'AI Mentor Bot', desc: 'Instant answers from your syllabus', delay: 200 },
            { icon: '👥', label: 'Smart Group Matching', desc: 'Find teammates by skill & interest', delay: 300 },
            { icon: '✅', label: 'Topic Management', desc: 'Submit, track and get approved fast', delay: 400 },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl auth-fade-in"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', animationDelay: `${f.delay}ms` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: 'rgba(242,113,37,0.12)', border: '1px solid rgba(242,113,37,0.25)' }}>{f.icon}</div>
              <div>
                <p className="text-[13px] font-semibold text-white leading-tight">{f.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-px mb-6"
          style={{ background: 'linear-gradient(90deg,rgba(242,113,37,0.5),rgba(255,255,255,0.06),transparent)' }} />
        <div className="grid grid-cols-3 gap-3">
          {[{ val: '2,400+', label: 'Students' }, { val: '480+', label: 'Groups' }, { val: '8k', label: 'AI / day' }].map((s, i) => (
            <div key={i} className="text-center px-3 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-lg font-bold text-white leading-none">{s.val}</p>
              <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export function RegisterPage({ onNavigate, onLogin }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ studentCode: '', fullName: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const set = (field, val) => setFormData(p => ({ ...p, [field]: val }));

  const handleRegister = async (e) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match!');
    if (!/^(SE\d{6}|AD\d{4})$/.test(formData.studentCode)) return setError('Code must be SE + 6 digits or AD + 4 digits');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await authService.register(formData);
      if (res.accessToken && res.user) {
        localStorage.setItem('user', JSON.stringify({ ...res.user, token: res.accessToken, refreshToken: res.refreshToken }));
        if (onLogin) onLogin(res.user);
        const r = res.user.role?.toLowerCase();
        const dest = r === 'admin' ? 'admin' : r === 'lecturer' ? 'lecturer' : 'group';
        setTimeout(() => onNavigate(dest, { replace: true }), 800);
      } else {
        setStep(2); setOtpExpired(false);
      }
    } catch (err) { setError(err.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); setError('');
    if (otp.length < 6) return setError('Please enter all 6 digits');
    setLoading(true);
    try {
      await authService.verifyOTP({ email: formData.email, otp });
      setStep(3);
      setTimeout(() => onNavigate('login', { replace: true }), 2500);
    } catch (err) { setError(err.message || 'Invalid OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(''); setLoading(true);
    try {
      await authService.resendOTP(formData.email);
      setOtpExpired(false); setOtp(''); setResendCooldown(60);
      const cd = setInterval(() => setResendCooldown(c => { if (c <= 1) { clearInterval(cd); return 0; } return c - 1; }), 1000);
    } catch (err) { setError(err.message || 'Failed to resend OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftPanel />

      <div className="flex-1 flex items-center justify-center px-8 py-8 overflow-y-auto"
        style={{ background: BG_RIGHT }}>
        <div className="w-full max-w-[420px] py-2">

          <button
            onClick={() => step === 2 ? setStep(1) : onNavigate('landing', { replace: true })}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-200 mb-8 transition-colors duration-200 text-sm group">
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            {step === 2 ? 'Back to form' : 'Back to Home'}
          </button>

          <StepIndicator current={step} />

          {/* ── STEP 1: Form ── */}
          {step === 1 && (
            <div className="auth-fade-in">
              <div className="mb-7">
                <h1 className="text-[2rem] font-extrabold text-white mb-1.5 tracking-tight">Create Account</h1>
                <p className="text-gray-600 text-sm">Join SWP Hub and start your journey</p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
                  style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171' }}>
                  <span className="mt-0.5 text-base">⚠</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <AuthInput icon={IdCard} label="Student / Admin Code"
                  value={formData.studentCode} onChange={e => set('studentCode', e.target.value)}
                  placeholder="SE150001 or AD0000" required />

                <AuthInput icon={User} label="Full Name"
                  value={formData.fullName} onChange={e => set('fullName', e.target.value)}
                  placeholder="Nguyen Van A" required />

                <AuthInput icon={Mail} label="Email Address" type="email"
                  value={formData.email} onChange={e => set('email', e.target.value)}
                  placeholder="your.email@gmail.com" required
                  hint="Use @gmail.com · Admin accounts skip verification" />

                <AuthInput icon={Lock} label="Password"
                  type={showPw ? 'text' : 'password'}
                  value={formData.password} onChange={e => set('password', e.target.value)}
                  placeholder="Min. 6 characters" required
                  rightEl={
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="text-gray-600 hover:text-gray-300 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  } />

                <AuthInput icon={Lock} label="Confirm Password"
                  type={showCpw ? 'text' : 'password'}
                  value={formData.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Re-enter your password" required
                  rightEl={
                    <button type="button" onClick={() => setShowCpw(p => !p)}
                      className="text-gray-600 hover:text-gray-300 transition-colors">
                      {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  } />

                <div className="flex items-start gap-2.5 pt-1">
                  <input type="checkbox" id="terms" style={{ accentColor: '#F27125' }}
                    className="w-4 h-4 rounded mt-0.5 flex-shrink-0" required />
                  <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <span className="text-[#F27125] hover:text-[#f59e0b] transition-colors cursor-pointer">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-[#F27125] hover:text-[#f59e0b] transition-colors cursor-pointer">Privacy Policy</span>
                  </label>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white btn-shimmer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#F27125,#d96420)', boxShadow: '0 4px 20px rgba(242,113,37,0.35)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create Account →
                    </span>
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 text-gray-700" style={{ background: BG_RIGHT }}>Already have an account?</span>
                </div>
              </div>

              <button onClick={() => onNavigate('login')}
                className="w-full py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all duration-200"
                style={{ background: CHARCOAL, border: `1px solid ${BORDER}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.background = '#252830'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = CHARCOAL; }}>
                Sign In instead
              </button>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <div className="auth-fade-in">
              <div className="mb-7">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                  style={{ color: '#F27125', background: 'rgba(242,113,37,0.1)', border: '1px solid rgba(242,113,37,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F27125] animate-pulse" />
                  Email Verification
                </span>
                <h1 className="text-[2rem] font-extrabold text-white mb-1.5 tracking-tight">Check your inbox</h1>
                <p className="text-gray-600 text-sm">
                  We sent a 6-digit code to{' '}
                  <span className="text-white font-semibold">{formData.email}</span>
                </p>
              </div>

              {import.meta.env.DEV && (
                <div className="mb-5 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5"
                  style={{ background: 'rgba(242,113,37,0.07)', border: '1px solid rgba(242,113,37,0.15)', color: '#9ca3af' }}>
                  <span className="text-base">💡</span>
                  <span><strong className="text-[#F27125]">Dev mode:</strong> Check the backend console for your OTP code</span>
                </div>
              )}

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
                  style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171' }}>
                  <span className="mt-0.5">⚠</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOTP}>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-600 mb-3">
                  Enter 6-Digit OTP
                </label>

                <OtpBoxes value={otp} onChange={setOtp} />

                {/* Progress bar */}
                <div className="flex gap-1.5 mt-4 mb-3">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{ background: i < otp.length ? 'linear-gradient(90deg,#F27125,#f59e0b)' : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs text-gray-700">
                    {otpExpired ? (
                      <span className="text-red-400 font-medium">Code expired</span>
                    ) : (
                      <>Expires in <Countdown seconds={600} onExpire={() => setOtpExpired(true)} /></>
                    )}
                  </span>
                  <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading}
                    className="text-xs font-semibold transition-colors disabled:opacity-40"
                    style={{ color: resendCooldown > 0 ? '#6b7280' : '#F27125' }}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : '↺ Resend OTP'}
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white btn-shimmer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#F27125,#d96420)', boxShadow: '0 4px 20px rgba(242,113,37,0.35)' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : `Verify Code (${otp.length}/6)`}
                </button>
              </form>

              <p className="text-xs text-gray-700 text-center mt-5">
                Wrong email?{' '}
                <button onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="text-[#F27125] hover:text-[#f59e0b] font-medium transition-colors">
                  Change email
                </button>
              </p>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div className="text-center py-6 auth-fade-in">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: '#4ade80' }} />
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <CheckCircle className="w-12 h-12" style={{ color: '#4ade80' }} />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">You're all set!</h1>
              <p className="text-gray-600 text-sm mb-6">Account verified. Redirecting to login...</p>
              <div className="w-full h-1 rounded-full overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#F27125,#f59e0b)', animation: 'progress 2.5s linear forwards' }} />
              </div>
              <button
                onClick={() => onNavigate('login', { replace: true })}
                className="text-sm font-semibold transition-colors duration-200"
                style={{ color: '#F27125' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                onMouseLeave={e => e.currentTarget.style.color = '#F27125'}>
                Go to Sign In →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
