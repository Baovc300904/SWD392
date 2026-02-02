import { Link, useLocation } from 'react-router-dom';
import { Brain, Users, Shield, ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import fptLogo from '../../assets/fpt-logo.png';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determine if we are on a page that needs a transparent navbar initially (like Home)
    // or a solid one (like Admin). For now, we stick to the LandingPage style everywhere
    // but with consistent background if not on top.

    const navBackground = isScrolled
        ? 'bg-white/80 backdrop-blur-md border-b border-gray-200'
        : location.pathname === '/' ? 'bg-white/80 backdrop-blur-md border-b border-gray-200' : 'bg-[#1a1d21]/80 backdrop-blur-md border-b border-white/10';

    const textColor = (isScrolled || location.pathname === '/') ? 'text-gray-700' : 'text-gray-300';
    const hoverColor = (isScrolled || location.pathname === '/') ? 'hover:text-[#F27125]' : 'hover:text-white';
    const logoText = (isScrolled || location.pathname === '/') ? 'text-gray-900' : 'text-white';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBackground}`}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-[#F27125] rounded-lg flex items-center justify-center shadow-lg shadow-[#F27125]/20">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className={`font-bold text-xl tracking-tight ${logoText} group-hover:text-[#F27125] transition`}>SWP Hub</span>
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        to="/about"
                        className={`${textColor} ${hoverColor} font-medium transition`}
                    >
                        About
                    </Link>

                    {/* Features Dropdown */}
                    <div className="relative group">
                        <button className={`flex items-center gap-1 ${textColor} ${hoverColor} font-medium transition py-2`}>
                            Features
                            <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 p-2">
                            <Link to="/ai-mentor" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Brain className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 text-sm">AI Mentor</div>
                                    <div className="text-xs text-gray-500">Instant answers & guidance</div>
                                </div>
                            </Link>
                            <Link to="/group-matching" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 text-sm">Group Matching</div>
                                    <div className="text-xs text-gray-500">Find your perfect team</div>
                                </div>
                            </Link>
                            <Link to="/project-management" className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 text-sm">Project Management</div>
                                    <div className="text-xs text-gray-500">Track progress & tasks</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <Link
                        to="/showcase"
                        className={`${textColor} ${hoverColor} font-medium transition`}
                    >
                        Showcase
                    </Link>
                    <Link
                        to="/mentors"
                        className={`${textColor} ${hoverColor} font-medium transition`}
                    >
                        Mentors
                    </Link>
                    <Link
                        to="/resources"
                        className={`${textColor} ${hoverColor} font-medium transition`}
                    >
                        Resources
                    </Link>

                    <Link
                        to="/contact"
                        className={`${textColor} ${hoverColor} font-medium transition`}
                    >
                        Contact
                    </Link>
                    <Link
                        to="/faq"
                        className={`${textColor} ${hoverColor} font-medium transition`}
                    >
                        FAQ
                    </Link>
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        to="/login"
                        className={`${textColor} ${hoverColor} font-medium`}
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="bg-[#F27125] hover:bg-[#d96420] text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg shadow-[#F27125]/20"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-500"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-4 shadow-xl">
                    <div className="flex flex-col space-y-4">
                        <Link to="/about" className="text-gray-700 font-medium">About</Link>
                        <div className="font-medium text-gray-900">Features</div>
                        <div className="pl-4 space-y-3">
                            <Link to="/ai-mentor" className="block text-gray-600 text-sm">AI Mentor</Link>
                            <Link to="/group-matching" className="block text-gray-600 text-sm">Group Matching</Link>
                            <Link to="/project-management" className="block text-gray-600 text-sm">Project Management</Link>
                        </div>
                        <Link to="/showcase" className="text-gray-700 font-medium">Showcase</Link>
                        <Link to="/mentors" className="text-gray-700 font-medium">Mentors</Link>
                        <Link to="/resources" className="text-gray-700 font-medium">Resources</Link>
                        <Link to="/contact" className="text-gray-700 font-medium">Contact</Link>
                        <Link to="/faq" className="text-gray-700 font-medium">FAQ</Link>
                        <hr className="border-gray-100" />
                        <Link to="/login" className="text-gray-700 font-medium">Sign In</Link>
                        <Link to="/register" className="bg-[#F27125] text-white py-2 rounded-lg text-center font-bold">Get Started</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
