import { Brain, Users, Shield, ArrowRight, PlayCircle, Check } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: 'login' | 'register' | 'about' | 'contact' | 'faq') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F27125] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl">SWP Hub</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('about')}
              className="text-gray-700 hover:text-gray-900 font-medium transition"
            >
              About
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Contact
            </button>
            <button
              onClick={() => onNavigate('faq')}
              className="text-gray-700 hover:text-gray-900 font-medium transition"
            >
              FAQ
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('login')}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className="bg-[#F27125] hover:bg-[#d96420] text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0054a6] via-[#1164B4] to-[#0054a6] text-white pt-32 pb-20 overflow-hidden">
        {/* Mesh Gradient Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F27125] rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Master Your SWP Project<br />with AI Support
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
            The all-in-one platform for FPT students to manage topics, form groups, and get instant answers.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <button 
              onClick={() => onNavigate('register')}
              className="bg-[#F27125] hover:bg-[#d96420] text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 transition shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 transition border border-white/30">
              <PlayCircle className="w-5 h-5" />
              View Documentation
            </button>
          </div>

          {/* Hero Mockup */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-2xl">
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-3 text-xs text-gray-400">app.swphub.fpt.edu.vn</span>
                </div>
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 w-full h-full p-6">
                    <div className="bg-[#0054a6] rounded-lg"></div>
                    <div className="col-span-2 bg-gray-800 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose SWP Hub?</h2>
            <p className="text-xl text-gray-600">Everything you need to succeed in your Software Project</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-[#0054a6] hover:shadow-lg transition">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI-Powered Answers</h3>
              <p className="text-gray-600 leading-relaxed">
                Get syllabus-based suggestions instantly. Our AI assistant analyzes your questions and provides accurate answers based on course materials.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Instant Q&A responses
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Syllabus-trained AI
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  24/7 availability
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-[#0054a6] hover:shadow-lg transition">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Group Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Find teammates that match your skill set. Our intelligent algorithm helps you form balanced, effective project teams.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Skill-based matching
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Easy team formation
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Collaboration tools
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-[#0054a6] hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-[#F27125]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Topic Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Streamlined approval workflow for Lecturers. Efficiently manage topic submissions, group assignments, and project milestones.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Quick approvals
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Automated notifications
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Progress tracking
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[#0054a6] mb-2">1,200+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#0054a6] mb-2">50+</div>
              <div className="text-gray-600">Expert Mentors</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#0054a6] mb-2">98%</div>
              <div className="text-gray-600">Project Pass Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0054a6] to-[#1164B4] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start your journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of FPT students already using SWP Hub to ace their projects.
          </p>
          <button 
            onClick={() => onNavigate('register')}
            className="bg-[#F27125] hover:bg-[#d96420] text-white px-10 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#F27125] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-white text-xl">SWP Hub</span>
              </div>
              <p className="text-sm text-gray-400">
                Empowering FPT students to excel in their Software Projects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">About Us</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('about')} className="hover:text-white transition">Our Story</button></li>
                <li><a href="#" className="hover:text-white transition">Team</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition">Support</button></li>
                <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition">FAQ</button></li>
                <li><a href="#" className="hover:text-white transition">Email Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © 2026 FPT University. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}