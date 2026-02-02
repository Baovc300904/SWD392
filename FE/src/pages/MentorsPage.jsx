import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';

export function MentorsPage() {
    return (
        <div className="min-h-screen bg-[#1a1d21] text-white font-sans overflow-hidden">
            {/* Background Mesh Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[30%] w-[45vw] h-[45vw] bg-teal-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[30%] w-[45vw] h-[45vw] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <div className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
                <div className="w-20 h-20 bg-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                    <GraduationCap className="w-10 h-10 text-teal-400" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Expert Mentors
                </h1>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    Connect with experienced lecturers and industry experts who can guide your project to success.
                </p>

                <div className="p-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 max-w-3xl mx-auto">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Coming Soon</h3>
                        <p className="text-gray-400">
                            We are putting the finishing touches on this feature. <br />
                            Stay tuned for the launch!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
