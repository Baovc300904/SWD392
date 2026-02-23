import { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import authService from '../services/auth.service';

/* ── Design tokens ── */
const CHARCOAL = '#1e2028';
const BORDER = '#2e3240';
const BG_RIGHT = '#13151a';

/* ── AuthInput ── */
function AuthInput({ icon: Icon, type = 'text', rightEl, label, ...props }) {
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
    </div>
  );
}

/* ── OTP digit boxes ── */
function OtpBoxes({ value, onChange }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = digits.map((d, idx) => idx === i ? ' ' : d).join('').trimEnd();
      onChange(next);
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits]; next[i] = e.key;
    onChange(next.join('').trimEnd());
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
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i]}
          onKeyDown={e => handleKey(i, e)} onPaste={handlePaste} onChange={() => { }}
          className="w-full aspect-square rounded-2xl text-xl font-bold text-center focus:outline-none transition-all duration-200"
          style={{
            background: digits[i] !== ' ' && digits[i] ? 'rgba(242,113,37,0.1)' : CHARCOAL,
            border: digits[i] !== ' ' && digits[i] ? '2px solid rgba(242,113,37,0.6)' : `2px solid ${BORDER}`,
            color: '#F27125',
            boxShadow: digits[i] !== ' ' && digits[i] ? '0 0 12px rgba(242,113,37,0.15)' : 'none',
          }}
          onFocus={e => { e.target.style.borderColor = '#F27125'; e.target.style.boxShadow = '0 0 0 3px rgba(242,113,37,0.15)'; }}
          onBlur={e => {
            const filled = digits[i] !== ' ' && digits[i];
            e.target.style.boxShadow = filled ? '0 0 12px rgba(242,113,37,0.15)' : 'none';
            e.target.style.borderColor = filled ? 'rgba(242,113,37,0.6)' : BORDER;
          }}
        />
      ))}
    </div>
  );
}

/* ── Countdown ── */
function Countdown({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  return <span className={`font-mono text-sm font-bold ${left < 30 ? 'text-red-400' : 'text-[#F27125]'}`}>{m}:{s}</span>;
}

/* ── Step indicator ── */
function StepIndicator({ current }) {
  const steps = ['Email', 'Verify', 'Done'];
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
              <p className="text-[10px] mt-1 font-medium" style={{ color: active ? '#F27125' : done ? '#9ca3af' : '#4b5563' }}>
                {label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-4 rounded-full transition-all duration-500"
                style={{ width: 40, background: done ? 'linear-gradient(90deg,#F27125,rgba(242,113,37,0.3))' : 'rgba(255,255,255,0.07)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── OrangeBtn reusable ── */
function OrangeBtn({ loading, label, loadingLabel, disabled }) {
  return (
    <button type="submit" disabled={loading || disabled}
      className="w-full py-3.5 rounded-xl font-semibold text-sm text-white btn-shimmer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: 'linear-gradient(135deg,#F27125,#d96420)', boxShadow: '0 4px 20px rgba(242,113,37,0.35)' }}>
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingLabel}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          {label}
        </span>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════ */
export function ForgotPasswordPage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleRequestReset = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await authService.forgotPassword(email); setStep(2); setOtpExpired(false); }
    catch (err) { setError(err.message || 'Failed to send reset code.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); setError('');
    const cleanOtp = otp.replace(/ /g, '');
    if (cleanOtp.length < 6) return setError('Please enter all 6 digits');
    if (newPassword !== confirmPassword) return setError('Passwords do not match!');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try { await authService.resetPassword({ email, otp: cleanOtp, newPassword }); setStep(3); setTimeout(() => onNavigate('login', { replace: true }), 3000); }
    catch (err) { setError(err.message || 'Failed to reset password.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(''); setLoading(true);
    try {
      await authService.forgotPassword(email);
      setOtpExpired(false); setOtp(''); setResendCooldown(60);
      const cd = setInterval(() => setResendCooldown(c => { if (c <= 1) { clearInterval(cd); return 0; } return c - 1; }), 1000);
    } catch (err) { setError(err.message || 'Failed to resend code'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ════ LEFT PANEL ════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: '#0e1016' }}>

        {/* Animated orbs */}
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
          {/* Logo */}
          <div className="flex items-center gap-3 auth-fade-in">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base btn-shimmer"
              style={{ background: 'linear-gradient(135deg,#F27125,#d96420)', boxShadow: '0 4px 20px rgba(242,113,37,0.4)' }}>S</div>
            <span className="font-bold text-xl tracking-tight">SWP Hub</span>
          </div>

          {/* Main content */}
          <div className="mt-auto mb-8">
            {/* Lock icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 float-animation"
              style={{ background: 'rgba(242,113,37,0.1)', border: '1px solid rgba(242,113,37,0.25)', boxShadow: '0 0 32px rgba(242,113,37,0.15)' }}>
              <Lock className="w-8 h-8" style={{ color: '#F27125' }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 auth-fade-in-delay-1"
              style={{ color: '#F27125' }}>Account Recovery</p>
            <h2 className="text-[2.6rem] font-extrabold leading-[1.15] tracking-tight mb-4 auth-fade-in-delay-1">
              Forgot your<br />
              <span className="gradient-text">password?</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs auth-fade-in-delay-2">
              No worries. Enter your email and we'll send a secure one-time code to reset your password.
            </p>
          </div>

          {/* Security tips */}
          <div className="space-y-2.5 mb-8">
            {[
              { icon: '🔐', text: 'Use a unique password for each service' },
              { icon: '📧', text: 'Check your spam folder if code is missing' },
              { icon: '⏱️', text: 'OTP codes expire after 10 minutes' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl auth-fade-in"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', animationDelay: `${200 + i * 100}ms` }}>
                <span className="text-lg">{t.icon}</span>
                <p className="text-[12px] text-gray-400">{t.text}</p>
              </div>
            ))}
          </div>

          {/* Support */}
          <div className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs text-gray-600">
              Need help?{' '}
              <a href="mailto:support@swphub.fpt.edu.vn"
                className="transition-colors duration-200"
                style={{ color: '#F27125' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                onMouseLeave={e => e.currentTarget.style.color = '#F27125'}>
                support@swphub.fpt.edu.vn
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ════ RIGHT PANEL ════ */}
      <div className="flex-1 flex items-center justify-center px-8 py-8 overflow-y-auto"
        style={{ background: BG_RIGHT }}>
        <div className="w-full max-w-[420px]">

          <button
            onClick={() => step === 2 ? setStep(1) : onNavigate('login')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-200 mb-8 transition-colors duration-200 text-sm group">
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            {step === 2 ? 'Back to email' : 'Back to Sign In'}
          </button>

          <StepIndicator current={step} />

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <div className="auth-fade-in">
              <div className="mb-7">
                <h1 className="text-[2rem] font-extrabold text-white mb-1.5 tracking-tight">Reset Password</h1>
                <p className="text-gray-600 text-sm">Enter your email and we'll send a verification code.</p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
                  style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171' }}>
                  <span className="mt-0.5">⚠</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-5">
                <AuthInput icon={Mail} label="Email Address" type="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com" required />
                <OrangeBtn loading={loading} label="Send Reset Code →" loadingLabel="Sending..." />
              </form>

              <p className="text-center text-sm text-gray-700 mt-6">
                Remember your password?{' '}
                <button onClick={() => onNavigate('login')}
                  className="font-semibold transition-colors duration-200"
                  style={{ color: '#F27125' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                  onMouseLeave={e => e.currentTarget.style.color = '#F27125'}>
                  Sign In
                </button>
              </p>
            </div>
          )}

          {/* ── STEP 2: OTP + New password ── */}
          {step === 2 && (
            <div className="auth-fade-in">
              <div className="mb-7">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                  style={{ color: '#F27125', background: 'rgba(242,113,37,0.1)', border: '1px solid rgba(242,113,37,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F27125] animate-pulse" />
                  Verification
                </span>
                <h1 className="text-[2rem] font-extrabold text-white mb-1.5 tracking-tight">Enter your code</h1>
                <p className="text-gray-600 text-sm">
                  Code sent to <span className="text-white font-semibold">{email}</span>
                </p>
              </div>

              {import.meta.env.DEV && (
                <div className="mb-5 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5"
                  style={{ background: 'rgba(242,113,37,0.07)', border: '1px solid rgba(242,113,37,0.15)', color: '#9ca3af' }}>
                  <span className="text-base">💡</span>
                  <span><strong className="text-[#F27125]">Dev mode:</strong> Check backend console for the OTP</span>
                </div>
              )}

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
                  style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171' }}>
                  <span className="mt-0.5">⚠</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">

                {/* OTP section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                      6-Digit Code
                    </label>
                    <span className="text-xs">
                      {otpExpired
                        ? <span className="text-red-400 font-medium">Expired</span>
                        : <><span className="text-gray-700">Expires in </span><Countdown seconds={600} onExpire={() => setOtpExpired(true)} /></>}
                    </span>
                  </div>

                  <OtpBoxes value={otp} onChange={setOtp} />

                  {/* Progress bar */}
                  <div className="flex gap-1.5 mt-3">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-200"
                        style={{ background: i < otp.replace(/ /g, '').length ? 'linear-gradient(90deg,#F27125,#f59e0b)' : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-700">{otp.replace(/ /g, '').length}/6 digits</p>
                    <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading}
                      className="text-xs font-semibold transition-colors disabled:opacity-40"
                      style={{ color: resendCooldown > 0 ? '#6b7280' : '#F27125' }}>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : '↺ Resend code'}
                    </button>
                  </div>
                </div>

                <AuthInput icon={Lock} label="New Password"
                  type={showPw ? 'text' : 'password'}
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Create new password (min. 6 chars)" required
                  rightEl={
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="text-gray-600 hover:text-gray-300 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  } />

                <AuthInput icon={Lock} label="Confirm Password"
                  type={showCpw ? 'text' : 'password'}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password" required
                  rightEl={
                    <button type="button" onClick={() => setShowCpw(p => !p)}
                      className="text-gray-600 hover:text-gray-300 transition-colors">
                      {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  } />

                <OrangeBtn loading={loading}
                  label={`Reset Password ${otp.replace(/ /g, '').length === 6 ? '→' : ''}`}
                  loadingLabel="Resetting..." />
              </form>
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
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Password Reset!</h1>
              <p className="text-gray-600 text-sm mb-6">Your password has been updated. Redirecting to login...</p>
              <div className="w-full h-1 rounded-full overflow-hidden mb-6" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#F27125,#f59e0b)', animation: 'progress 3s linear forwards' }} />
              </div>
              <button
                onClick={() => onNavigate('login', { replace: true })}
                className="text-sm font-semibold transition-colors duration-200"
                style={{ color: '#F27125' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                onMouseLeave={e => e.currentTarget.style.color = '#F27125'}>
                Sign In Now →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
