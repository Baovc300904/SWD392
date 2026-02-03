import { useState } from 'react';
import { User, Mail, Lock, IdCard, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../services/auth.service';

export function RegisterPage({ onNavigate, onLogin }) {
  const [step, setStep] = useState(1); // 1: Register Form, 2: OTP Verification, 3: Success
  const [formData, setFormData] = useState({
    studentCode: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate student code format
    if (!/^SE\d{6}$/.test(formData.studentCode)) {
      setError('Student code must be in format SE followed by 6 digits (e.g., SE150001)');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authService.register(formData);
      console.log('Registration response:', response);
      
      // Check if admin (has token) - skip OTP verification
      if (response.accessToken && response.user) {
        console.log('Admin account created, logging in directly');
        // Store user data and token
        localStorage.setItem('user', JSON.stringify({
          ...response.user,
          token: response.accessToken,
          refreshToken: response.refreshToken
        }));
        
        // Call onLogin callback if provided
        if (onLogin) {
          onLogin(response.user);
        }
        
        // Redirect based on role
        setTimeout(() => {
          if (response.user.role === 'admin') {
            onNavigate('admin');
          } else {
            onNavigate('landing');
          }
        }, 1000);
      } else {
        // Regular user - go to OTP verification
        console.log('Regular user registration, OTP sent');
        setStep(2);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.verifyOTP({
        email: formData.email,
        otp: otp
      });
      console.log('OTP verification successful');
      setStep(3); // Move to success
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      await authService.resendOTP(formData.email);
      alert('OTP has been resent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

          {/* Benefits */}
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-6">Join thousands of successful students</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#F27125] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold mb-1">AI-Powered Assistance</div>
                  <div className="text-sm text-gray-400">Get instant help based on your course syllabus</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#F27125] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold mb-1">Smart Team Matching</div>
                  <div className="text-sm text-gray-400">Find the perfect teammates for your project</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#F27125] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold mb-1">Streamlined Workflow</div>
                  <div className="text-sm text-gray-400">Manage topics, submissions, and feedback in one place</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-600">Join SWP Hub and start your journey</p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                {/* Student Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Code
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.studentCode}
                      onChange={(e) => handleChange('studentCode', e.target.value)}
                      placeholder="SE150001"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125]"
                      required
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Nguyen Van A"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125]"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125]"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Use @gmail.com for regular accounts. Admin: admin@example.com (no verification needed)
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Create a strong password"
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
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125]"
                      required
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125] mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <span className="text-[#F27125] hover:underline cursor-pointer">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-[#F27125] hover:underline cursor-pointer">Privacy Policy</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F27125] hover:bg-[#d96420] text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[#F27125] hover:text-[#d96420] font-semibold transition"
                >
                  Sign In
                </button>
              </p>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              {/* Header with orange accent */}
              <div className="mb-8">
                <div className="inline-block px-4 py-1 bg-orange-50 border border-orange-200 rounded-full mb-4">
                  <span className="text-[#F27125] text-sm font-medium">Step 2 of 3</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                <p className="text-gray-600">
                  We've sent an OTP code to <strong className="text-[#F27125]">{formData.email}</strong>
                </p>
                <div className="mt-4 p-3 bg-orange-50 border-l-4 border-[#F27125] rounded-r-lg">
                  <p className="text-sm text-gray-700">
                    <strong>💡 Dev Mode:</strong> Check the backend console for the OTP code (email not configured)
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-Digit OTP Code
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
                      Verifying...
                    </span>
                  ) : (
                    'Verify OTP'
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully. Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


