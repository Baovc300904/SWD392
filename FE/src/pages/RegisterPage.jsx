import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, IdCard, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const registerSchema = z.object({
  studentCode: z.string().min(3, 'Student Code is required'),
  fullName: z.string().min(2, 'Full Name is required'),
  email: z.string()
    .email('Invalid email address')
    .refine((email) => email.endsWith('@gmail.com'), {
      message: 'Only Gmail accounts (@gmail.com) are allowed'
    }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const result = await registerUser(data);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/workspace');
    } else {
      toast.error(result.error || 'Registration failed');
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

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join SWP Hub and start your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Student Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Code
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('studentCode')}
                  placeholder="SE150001"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition ${errors.studentCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.studentCode && (
                <p className="mt-1 text-sm text-red-500">{errors.studentCode.message}</p>
              )}
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
                  {...register('fullName')}
                  placeholder="Nguyen Van A"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
              )}
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
                  {...register('email')}
                  placeholder="yourname@gmail.com"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
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
                  {...register('password')}
                  placeholder="Create a strong password"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition ${errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
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
                  {...register('confirmPassword')}
                  placeholder="Re-enter your password"
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent transition ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                {...register('terms')}
                className="w-4 h-4 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125] mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-[#0054a6] hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#0054a6] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="mt-0 text-sm text-red-500">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#F27125] hover:bg-[#d96420] text-white py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#F27125] hover:text-[#d96420] font-semibold transition"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


