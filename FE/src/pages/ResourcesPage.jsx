import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export function ResourcesPage() {
    return (
        <div className="min-h-screen bg-[#1a1d21] text-white font-sans overflow-hidden">
            {/* Background Mesh Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[5%] left-[50%] w-[40vw] h-[40vw] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[5%] right-[50%] w-[40vw] h-[40vw] bg-amber-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>

            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <div className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                    <FileText className="w-10 h-10 text-yellow-400" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Student Resources
                </h1>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    Access templates, guides, and policy documents to specific FPT University standards.
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
            <Footer />
        </div>
    );
}
