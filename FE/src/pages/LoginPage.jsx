import { useState } from 'react';
import { Mail, Lock, ArrowLeft, Chrome, Eye, EyeOff } from 'lucide-react';
import authService from '../services/auth.service';

export function LoginPage({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginRole, setLoginRole] = useState('student'); // 'student' or 'lecturer'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call Real Backend API
      const user = await authService.login(email, password);

      // Navigate based on role
      // Note: Backend 'role' might be 'admin', 'student', 'lecturer'
      if (user.role === 'admin') {
        onLogin('admin');
      } else if (user.role === 'lecturer') {
        onLogin('lecturer');
      } else {
        onLogin('student'); // Default to student/group view
      }

    } catch (err) {
      console.error("Login failed", err);
      setError(err.message || 'Login failed. Please check your credentials.');
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

          {/* Testimonial */}
          <div className="max-w-md">
            <div className="text-6xl mb-6">"</div>
            <p className="text-2xl font-medium mb-6 leading-relaxed">
              SWP Hub completely transformed how our team collaborated on the project. The AI assistant saved us countless hours!
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Testimonial"
                alt="Student"
                className="w-12 h-12 rounded-full bg-white/20"
              />
              <div>
                <div className="font-semibold">Nguyen Minh Anh</div>
                <div className="text-sm text-gray-400">SE1705 - Spring 2025</div>
              </div>
            </div>
          </div>

          {/* Decorative dots */}
          <div className="absolute bottom-10 left-16 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
            <div className="w-2 h-2 rounded-full bg-white/30"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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

          {/* Role Selection Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginRole('student')}
                className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${loginRole === 'student'
                  ? 'bg-white text-[#F27125] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Student
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('lecturer')}
                className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${loginRole === 'lecturer'
                  ? 'bg-white text-[#F27125] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Lecturer Portal
                </div>
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {loginRole === 'lecturer' ? 'Lecturer Portal' : 'Student Portal'}
            </h1>
            <p className="text-gray-600">
              {loginRole === 'lecturer'
                ? 'Sign in with your lecturer or admin credentials'
                : 'Sign in to continue to your workspace'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder={loginRole === 'lecturer' ? 'lecturer@fpt.edu.vn' : 'student@fpt.edu.vn'}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125]"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm text-[#F27125] hover:text-[#d96420] font-medium transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#F27125] hover:bg-[#d96420] text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-medium transition"
            >
              <Chrome className="w-5 h-5" />
              Sign in with FPT Google
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#F27125] hover:text-[#d96420] font-semibold transition"
            >
              Sign up now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

