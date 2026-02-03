import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import authService from '../services/auth.service';

export function ForgotPasswordPage({ onNavigate }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      console.log('Password reset OTP sent');
      setStep(2); // Move to OTP + password entry
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email,
        otp,
        newPassword
      });
      console.log('Password reset successful');
      setStep(3); // Move to success
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        onNavigate('login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      alert('OTP has been resent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Visual Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1d21] relative overflow-hidden">
        {/* Abstract Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#F27125] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#F27125]/60 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-[#F27125] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <span className="font-bold text-3xl">SWP Hub</span>
          </div>

          {/* Help Text */}
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-6">Having trouble signing in?</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Don't worry! We'll send you a verification code to reset your password. 
              Just enter your email and check your inbox.
            </p>
            
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-sm text-gray-300">
                <strong>Need help?</strong> Contact our support team at{' '}
                <a href="mailto:support@swphub.fpt.edu.vn" className="text-white underline">
                  support@swphub.fpt.edu.vn
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>

          {/* Step 1: Email Entry */}
          {step === 1 && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-600">
                  Enter your email address and we'll send you a verification code.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F27125] hover:bg-[#d96420] text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:bg-gray-400"
                >
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Remember your password?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[#F27125] hover:text-[#d96420] font-semibold transition"
                >
                  Sign In
                </button>
              </p>
            </>
          )}

          {/* Step 2: OTP + New Password Entry */}
          {step === 2 && (
            <>
              <div className="mb-8">
                <div className="inline-block px-4 py-1 bg-orange-50 border border-orange-200 rounded-full mb-4">
                  <span className="text-[#F27125] text-sm font-medium">Step 2 of 3</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter Verification Code</h1>
                <p className="text-gray-600">
                  We've sent a code to <strong className="text-[#F27125]">{email}</strong>
                </p>
                <div className="mt-4 p-3 bg-orange-50 border-l-4 border-[#F27125] rounded-r-lg">
                  <p className="text-sm text-gray-700">
                    <strong>💡 Dev Mode:</strong> Check the backend console for the OTP code
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-4 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent text-center text-3xl tracking-[0.5em] font-bold text-[#F27125] bg-orange-50/30"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Code expires in 10 minutes
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create new password"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125]"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F27125] hover:bg-[#d96420] text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Resetting Password...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-[#F27125] hover:text-[#d96420] font-medium text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Didn't receive code? <span className="font-semibold">Resend OTP</span>
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
