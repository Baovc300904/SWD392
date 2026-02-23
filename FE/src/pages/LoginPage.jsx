import { useState } from 'react';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Sparkles, Users, CheckSquare, ShieldCheck } from 'lucide-react';
import authService from '../services/auth.service';

/* ── Shared tokens ── */
const CHARCOAL = '#1e2028';
const BORDER = '#2e3240';
const BG_RIGHT = '#13151a';

/* ── Reusable Input ── */
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
          className="w-full pl-10 pr-10 py-3.5 rounded-xl text-sm text-white focus:outline-none transition-all duration-200"
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

/* ── Feature card for left panel ── */
function FeatureCard({ icon, label, desc, delay = 0 }) {
  return (
    <div
      className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl auth-fade-in"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: 'rgba(242,113,37,0.12)', border: '1px solid rgba(242,113,37,0.25)' }}>
        {icon}
      </div>
      <div>
        <p className="text-[13px] font-semibold text-white leading-tight">{label}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

/* ── Stat tile ── */
function StatTile({ val, label }) {
  return (
    <div className="text-center px-3 py-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-lg font-bold text-white leading-none">{val}</p>
      <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════ */
export function LoginPage({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginRole, setLoginRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authService.login(email, password, rememberMe);
      if (loginRole === 'student' && user.role !== 'Student') {
        setError('This account is not a student account. Please use the Lecturer Portal tab.');
        setLoading(false);
        return;
      }
      if (loginRole === 'lecturer' && user.role === 'Student') {
        setError('Student accounts must use the Student Portal tab on the left.');
        setLoading(false);
        return;
      }
      const roleLower = user.role.toLowerCase();
      if (roleLower === 'admin') onLogin('admin');
      else if (roleLower === 'lecturer') onLogin('lecturer');
      else onLogin('student');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ════ LEFT PANEL ════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: '#0e1016' }}>

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(242,113,37,0.20) 0%, transparent 65%)',
              filter: 'blur(80px)',
              animation: 'orb1 12s ease-in-out infinite',
            }} />
          <div className="absolute top-[30%] -right-32 w-[480px] h-[480px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%)',
              filter: 'blur(90px)',
              animation: 'orb2 15s ease-in-out infinite',
            }} />
          <div className="absolute -bottom-24 left-[25%] w-[360px] h-[360px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 65%)',
              filter: 'blur(80px)',
              animation: 'orb1 18s 3s ease-in-out infinite',
            }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
              backgroundSize: '52px 52px',
            }} />
        </div>

        <div className="relative z-10 flex flex-col h-full px-12 py-10 text-white">

          {/* Logo */}
          <div className="flex items-center gap-3 auth-fade-in">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-lg btn-shimmer"
              style={{ background: 'linear-gradient(135deg,#F27125,#d96420)', boxShadow: '0 4px 20px rgba(242,113,37,0.4)' }}>
              S
            </div>
            <span className="font-bold text-xl tracking-tight">SWP Hub</span>
            <span className="ml-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ color: '#F27125', background: 'rgba(242,113,37,0.12)', border: '1px solid rgba(242,113,37,0.25)' }}>
              Beta
            </span>
          </div>

          {/* Main copy */}
          <div className="mt-auto mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 auth-fade-in-delay-1"
              style={{ color: '#F27125' }}>
              Trusted by FPT Students
            </p>
            <h2 className="text-[2.6rem] font-extrabold leading-[1.15] tracking-tight mb-4 auth-fade-in-delay-1">
              The platform built<br />
              <span className="gradient-text">for your project.</span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs auth-fade-in-delay-2">
              Everything you need to manage topics, form teams, and collaborate — in one AI‑powered workspace.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-2.5 mb-8">
            <FeatureCard icon="🤖" label="AI Mentor Bot" desc="Instant answers from your syllabus" delay={200} />
            <FeatureCard icon="👥" label="Smart Group Matching" desc="Find teammates by skill & interest" delay={300} />
            <FeatureCard icon="✅" label="Topic Management" desc="Submit, track and get approved fast" delay={400} />
          </div>

          {/* Divider */}
          <div className="h-px mb-7"
            style={{ background: 'linear-gradient(90deg,rgba(242,113,37,0.5),rgba(255,255,255,0.06),transparent)' }} />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            <StatTile val="2,400+" label="Students" />
            <StatTile val="480+" label="Groups" />
            <StatTile val="8k" label="AI / day" />
          </div>

          {/* Testimonial */}
          <div className="relative rounded-2xl p-5 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(16px)' }}>
            {/* shimmer top line */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)' }} />
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3" fill="#F27125" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[13px] text-gray-400 leading-relaxed mb-4">
              &ldquo;SWP Hub completely transformed how our team collaborated. The AI assistant saved us countless hours during sprint weeks!&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-0.5 rounded-full opacity-70"
                  style={{ background: 'linear-gradient(135deg,#F27125,#f59e0b)', filter: 'blur(4px)' }} />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=NMA" alt="avatar"
                  className="w-9 h-9 rounded-full relative"
                  style={{ border: '2px solid rgba(242,113,37,0.6)' }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white leading-tight">Nguyen Minh Anh</p>
                <p className="text-[11px] text-gray-600 mt-0.5">SE1705 · Spring 2025</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ════ RIGHT PANEL — FORM ════ */}
      <div className="flex-1 flex items-center justify-center px-8 py-8 overflow-y-auto"
        style={{ background: BG_RIGHT }}>
        <div className="w-full max-w-[420px]">

          {/* Back button */}
          <button
            onClick={() => onNavigate('landing', { replace: true })}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-200 mb-10 transition-colors duration-200 text-sm group">
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Home
          </button>

          {/* Role tab switcher — pill style */}
          <div className="mb-8 auth-fade-in">
            <div className="relative flex p-1 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Sliding active pill */}
              <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-in-out"
                style={{
                  background: 'linear-gradient(135deg,rgba(242,113,37,0.25),rgba(242,113,37,0.12))',
                  border: '1px solid rgba(242,113,37,0.35)',
                  left: loginRole === 'student' ? '4px' : 'calc(50%)',
                }} />
              <button
                type="button"
                onClick={() => setLoginRole('student')}
                className="relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 z-10"
                style={{ color: loginRole === 'student' ? '#F27125' : '#6b7280' }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('lecturer')}
                className="relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 z-10"
                style={{ color: loginRole === 'lecturer' ? '#F27125' : '#6b7280' }}>
                <Users className="w-3.5 h-3.5" />
                Lecturer / Admin
              </button>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 auth-fade-in-delay-1">
            <h1 className="text-[2rem] font-extrabold text-white mb-1.5 tracking-tight">
              {loginRole === 'lecturer' ? 'Lecturer Portal' : 'Student Portal'}
            </h1>
            <p className="text-gray-600 text-sm">
              {loginRole === 'lecturer'
                ? 'Sign in with your lecturer or admin credentials'
                : 'Sign in to continue to your workspace'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5 auth-fade-in"
              style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.22)', color: '#f87171' }}>
              <span className="mt-0.5 text-base">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 auth-fade-in-delay-2">

            <AuthInput
              icon={Mail}
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginRole === 'lecturer' ? 'lecturer@fpt.edu.vn' : 'student@fpt.edu.vn'}
              required
            />

            <AuthInput
              icon={Lock}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-600 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                <div
                  className="relative w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: rememberMe ? 'linear-gradient(135deg,#F27125,#d96420)' : CHARCOAL,
                    border: `1.5px solid ${rememberMe ? '#F27125' : BORDER}`,
                    boxShadow: rememberMe ? '0 0 12px rgba(242,113,37,0.35)' : 'none',
                  }}>
                  {rememberMe && <CheckSquare className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-gray-600 select-none">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: '#F27125' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                onMouseLeave={e => e.currentTarget.style.color = '#F27125'}>
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm mt-2 btn-shimmer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading ? 'rgba(242,113,37,0.5)' : 'linear-gradient(135deg,#F27125,#d96420)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(242,113,37,0.35), 0 0 0 0 rgba(242,113,37,0)',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 text-gray-700" style={{ background: BG_RIGHT }}>Or continue with</span>
              </div>
            </div>

            {/* Google SSO */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-medium text-gray-400 transition-all duration-200"
              style={{ background: CHARCOAL, border: `1px solid ${BORDER}` }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = '#252830';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.color = '';
                e.currentTarget.style.background = CHARCOAL;
              }}>
              {/* Google G icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with FPT Google
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-gray-700">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-semibold transition-colors duration-200"
              style={{ color: '#F27125' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
              onMouseLeave={e => e.currentTarget.style.color = '#F27125'}>
              Sign up now
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
