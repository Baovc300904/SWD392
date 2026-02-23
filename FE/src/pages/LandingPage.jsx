import { useState, useEffect } from 'react';
import { Brain, Users, Shield, ArrowRight, PlayCircle, Check, ChevronUp, Menu, X } from 'lucide-react';

/* ── Back To Top Button ── */
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={[
        'fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
        'bg-[#F27125] hover:bg-[#d96420] text-white',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
      ].join(' ')}>
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

export function LandingPage({ onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', page: 'about' },
    { label: 'Docs', page: 'docs' },
    { label: 'Contact', page: 'contact' },
    { label: 'FAQ', page: 'faq' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* BackToTop */}
      <BackToTop />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F27125] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl">SWP Hub</span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ label, page }) => (
              <button key={page}
                onClick={() => onNavigate(page)}
                className="text-gray-700 hover:text-gray-900 font-medium transition">
                {label}
              </button>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="text-gray-700 hover:text-gray-900 font-medium">
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="bg-[#F27125] hover:bg-[#d96420] text-white px-6 py-2 rounded-lg font-semibold transition">
              Get Started
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 shadow-lg">
            {navLinks.map(({ label, page }) => (
              <button key={page}
                onClick={() => { onNavigate(page); setMobileMenuOpen(false); }}
                className="w-full text-left text-gray-700 hover:text-gray-900 font-medium py-2 border-b border-gray-50 transition">
                {label}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Sign In
              </button>
              <button
                onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg font-semibold transition">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-[#1a1d21] text-white pt-32 pb-20 overflow-hidden">
        {/* Mesh Gradient Effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#F27125] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#F27125]/60 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Monitor & Manage the Complete<br />Student Project Experience
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
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
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 transition border border-white/30"
              onClick={() => onNavigate('docs')}
            >
              <PlayCircle className="w-5 h-5" />
              View Documentation
            </button>
          </div>

          {/* Hero Product Screenshot */}
          <div className="relative max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-2xl">
              <div className="bg-[#1a1d21] rounded-lg overflow-hidden shadow-2xl">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0f1113] border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white/5 px-4 py-1.5 rounded-md border border-white/10 text-xs text-gray-400 font-mono">
                      🔒 app.swphub.fpt.edu.vn
                    </div>
                  </div>
                </div>

                {/* Actual UI Screenshot */}
                <div className="bg-white">
                  <div className="grid grid-cols-[240px_1fr] h-[500px]">
                    {/* Left Sidebar - Dark Navy */}
                    <div className="bg-[#1a1d21] flex flex-col border-r border-white/10">
                      {/* Workspace Header */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-[#F27125] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-semibold text-sm">SWP Hub</div>
                            <div className="text-gray-500 text-xs">SE1705 Group 3</div>
                          </div>
                        </div>
                      </div>

                      {/* Channel List */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                        <div className="text-gray-500 text-xs font-semibold px-2 py-1.5 uppercase tracking-wider">
                          Channels
                        </div>
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-gray-400 hover:bg-white/5 transition text-sm">
                          <span className="text-gray-500">#</span>
                          <span>general-chat</span>
                        </button>
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-[#F27125] text-white transition text-sm">
                          <span className="opacity-80">#</span>
                          <span className="font-medium">project-tasks</span>
                        </button>
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-gray-400 hover:bg-white/5 transition text-sm">
                          <span className="text-gray-500">🤖</span>
                          <span>ai-mentor-bot</span>
                        </button>
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-gray-400 hover:bg-white/5 transition text-sm">
                          <span className="text-gray-500">📁</span>
                          <span>resources-files</span>
                        </button>
                      </div>

                      {/* User Profile */}
                      <div className="p-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#F27125] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">NA</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">Nguyen A</div>
                            <div className="text-gray-500 text-xs truncate">Online</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="bg-white flex flex-col">
                      {/* Chat Header */}
                      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 font-bold text-base"># project-tasks</span>
                          <span className="text-gray-500 text-sm">•</span>
                          <span className="text-gray-500 text-xs">4 members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-gray-100 rounded">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Message 1 */}
                        <div className="flex gap-3">
                          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">LB</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">Le Thi B</span>
                              <span className="text-xs text-gray-500">10:23 AM</span>
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed">
                              Hey team! I've finished the database design. Should I push it to the repo?
                            </p>
                          </div>
                        </div>

                        {/* Message 2 */}
                        <div className="flex gap-3">
                          <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">PC</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">Pham Van C</span>
                              <span className="text-xs text-gray-500">10:25 AM</span>
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed">
                              Nice! Yeah go ahead. I'll review it this afternoon 👍
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Message Input with AI Button */}
                      <div className="border-t border-gray-200 p-4">
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg bg-white">
                            <input
                              type="text"
                              placeholder="Message #project-tasks"
                              className="flex-1 text-sm outline-none"
                              disabled
                            />
                            <button className="bg-[#F27125] hover:bg-[#d96420] text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition shadow-sm">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <span>AI</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-[#F27125] hover:shadow-lg transition">
              <div className="w-14 h-14 bg-[#F27125]/10 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-[#F27125]" />
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
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-[#F27125] hover:shadow-lg transition">
              <div className="w-14 h-14 bg-[#F27125]/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[#d96420]" />
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
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-[#F27125] hover:shadow-lg transition">
              <div className="w-14 h-14 bg-[#F27125]/30 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-[#c5601f]" />
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

      {/* CTA Section */}
      <section className="py-20 bg-[#1a1d21] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start your journey?</h2>
          <p className="text-xl text-gray-300 mb-8">
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
      <footer className="bg-[#1a1d21] text-gray-300 py-12 border-t border-white/10">
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
                <li><span className="text-gray-600 cursor-not-allowed" title="Coming soon">Team</span></li>
                <li><span className="text-gray-600 cursor-not-allowed" title="Coming soon">Careers</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition">Support</button></li>
                <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition">FAQ</button></li>
                <li><a href="mailto:support@swphub.fpt.edu.vn" className="hover:text-white transition">Email Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-600 cursor-not-allowed" title="Coming soon">Terms of Service</span></li>
                <li><span className="text-gray-600 cursor-not-allowed" title="Coming soon">Privacy Policy</span></li>
                <li><span className="text-gray-600 cursor-not-allowed" title="Coming soon">Cookie Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
            © 2026 FPT University. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

