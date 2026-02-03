import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import authService from '../services/auth.service';

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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
      // Call forgot password API
      await authService.forgotPassword(email, newPassword);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
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
              Don't worry! We'll send you a password reset link to your registered email address. 
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

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-600">
                  Enter your email address and new password to reset your account.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Input */}
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
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Enter the email address associated with your account
                  </p>
                </div>

                {/* New Password Input */}
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
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F27125] hover:bg-[#d96420] text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            /* Success Message */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your password for{' '}
                <span className="font-semibold text-gray-900">{email}</span>
                {' '}has been successfully reset.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700">
                  You can now login with your new password.
                </p>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="w-full bg-[#F27125] hover:bg-[#d96420] text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Additional Help */}
          {!isSubmitted && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Need Help?</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Use the email address you registered with</li>
                <li>• Password must be at least 6 characters</li>
                <li>• Contact support if you need further assistance</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


