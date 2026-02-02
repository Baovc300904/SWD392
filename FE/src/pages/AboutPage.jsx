import { ArrowLeft, Target, Users, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export function AboutPage() {
  const team = [
    {
      name: 'Nguyen Van A',
      role: 'Lead Developer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Developer1',
    },
    {
      name: 'Tran Thi B',
      role: 'UI/UX Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Developer2',
    },
    {
      name: 'Le Van C',
      role: 'Backend Developer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Developer3',
    },
    {
      name: 'Pham Thi D',
      role: 'AI Engineer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Developer4',
    },
  ];

  const mentors = [
    {
      name: 'Dr. Tran Minh',
      role: 'Technical Mentor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor1',
    },
    {
      name: 'Dr. Nguyen Duc D',
      role: 'Project Advisor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor2',
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1d21] text-white overflow-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#F27125]/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="relative pt-32 pb-20 px-6">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Empowering FPT Students to Succeed
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            SWP Hub was born from the vision of making Software Project management easier,
            more collaborative, and more successful for every FPT University student.
          </p>
        </div>

        {/* Mission / Vision Cards */}
        <div className="max-w-7xl mx-auto mb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#F27125]/50 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                To provide students with intelligent tools that simplify project management
                and enhance learning through AI-powered assistance.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                To become the go-to platform for university project collaboration,
                fostering innovation and excellence in software development education.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#F27125]/50 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 bg-[#F27125]/20 rounded-xl flex items-center justify-center mb-6 border border-[#F27125]/20 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-[#F27125]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Values</h3>
              <p className="text-gray-400 leading-relaxed">
                Innovation, collaboration, and student success are at the heart of everything we do.
                We believe in empowering the next generation.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-10 md:p-14 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Story</h2>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                SWP Hub was created by a team of FPT University students who experienced firsthand
                the challenges of managing software projects. From finding the right teammates to
                getting quick answers about project requirements, we knew there had to be a better way.
              </p>
              <p>
                Combining our passion for technology with the latest in AI and collaborative tools,
                we built SWP Hub to be the platform we wished we had when we were working on our own projects.
              </p>
              <p>
                Today, SWP Hub serves thousands of students, helping them collaborate more effectively,
                learn more efficiently, and achieve better outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-7xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
          <p className="text-gray-400 text-center mb-12">The passionate individuals behind SWP Hub</p>

          <div className="mb-16">
            <h3 className="text-xl font-bold mb-8 text-[#F27125] uppercase tracking-wider text-sm px-6">Development Team</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative inline-block mx-auto mb-4">
                    <div className="absolute inset-0 bg-[#F27125] rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="relative w-32 h-32 rounded-full border-4 border-[#1a1d21] bg-[#2a2d31] group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-1">{member.name}</h4>
                  <p className="text-sm text-gray-400">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6">
            <h3 className="text-xl font-bold mb-8 text-blue-400 uppercase tracking-wider text-sm">Our Mentors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {mentors.map((mentor, index) => (
                <div key={index} className="text-center group">
                  <div className="relative inline-block mx-auto mb-4">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="relative w-32 h-32 rounded-full border-4 border-[#1a1d21] bg-[#2a2d31] group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-lg text-white mb-1">{mentor.name}</h4>
                  <p className="text-sm text-gray-400">{mentor.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#F27125] to-[#d96420] rounded-3xl p-12 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Us on This Journey</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Be part of a community that's transforming how students learn and collaborate.
              </p>
              <button
                onClick={() => window.location.href = '/register'}
                className="bg-white text-[#F27125] hover:bg-gray-100 px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-2 transition shadow-xl"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
