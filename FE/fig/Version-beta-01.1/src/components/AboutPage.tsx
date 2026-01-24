import { ArrowLeft, Target, Users, Heart } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: 'landing') => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F27125] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl">SWP Hub</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0054a6] to-[#1164B4] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Empowering FPT Students to Succeed</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            SWP Hub was born from the vision of making Software Project management easier, 
            more collaborative, and more successful for every FPT University student.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide students with intelligent tools that simplify project management 
                and enhance learning through AI-powered assistance.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the go-to platform for university project collaboration, 
                fostering innovation and excellence in software development education.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[#F27125]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Values</h3>
              <p className="text-gray-600 leading-relaxed">
                Innovation, collaboration, and student success are at the heart of everything we do. 
                We believe in empowering the next generation of developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Story</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              SWP Hub was created by a team of FPT University students who experienced firsthand 
              the challenges of managing software projects. From finding the right teammates to 
              getting quick answers about project requirements, we knew there had to be a better way.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Combining our passion for technology with the latest in AI and collaborative tools, 
              we built SWP Hub to be the platform we wished we had when we were working on our own projects.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Today, SWP Hub serves thousands of students, helping them collaborate more effectively, 
              learn more efficiently, and achieve better outcomes in their software projects. 
              And we're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
          <p className="text-gray-600 text-center mb-12">
            The passionate individuals behind SWP Hub
          </p>

          <div className="mb-16">
            <h3 className="text-xl font-bold mb-6">Development Team</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-100"
                  />
                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6">Our Mentors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {mentors.map((mentor, index) => (
                <div key={index} className="text-center">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-100"
                  />
                  <h4 className="font-semibold text-gray-900">{mentor.name}</h4>
                  <p className="text-sm text-gray-600">{mentor.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0054a6] to-[#1164B4] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Us on This Journey</h2>
          <p className="text-xl text-blue-100 mb-8">
            Be part of a community that's transforming how students learn and collaborate.
          </p>
          <button
            onClick={() => onNavigate('landing')}
            className="bg-[#F27125] hover:bg-[#d96420] text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">© 2026 FPT University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
