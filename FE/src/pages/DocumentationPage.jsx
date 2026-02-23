import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Search, ChevronRight, ChevronDown, Lightbulb,
    BookOpen, Users, CheckSquare, GraduationCap, HelpCircle, X,
    Zap, Star, ArrowRight, Hash
} from 'lucide-react';

/* ─── Data ────────────────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
    {
        id: 'getting-started', label: 'Getting Started', icon: BookOpen,
        children: [
            { id: 'introduction', label: 'Introduction' },
            { id: 'quick-start', label: 'Quick Start' },
            { id: 'account-setup', label: 'Account Setup' },
        ],
    },
    {
        id: 'topic-registration', label: 'Topic Registration', icon: CheckSquare,
        children: [
            { id: 'browsing-topics', label: 'Browsing Topics' },
            { id: 'submitting-topic', label: 'Submitting a Topic' },
            { id: 'approval-process', label: 'Approval Process' },
        ],
    },
    {
        id: 'project-phases', label: 'Project Phases', icon: Users, defaultOpen: true,
        children: [
            { id: 'planning-setup', label: 'Planning & Setup' },
            { id: 'group-formation', label: 'Group Formation' },
            { id: 'task-management', label: 'Task Management' },
        ],
    },
    {
        id: 'mentor-guide', label: 'Mentor Guide', icon: GraduationCap,
        children: [
            { id: 'mentor-overview', label: 'Overview' },
            { id: 'mentor-meetings', label: 'Scheduling Meetings' },
            { id: 'mentor-feedback', label: 'Giving Feedback' },
        ],
    },
    {
        id: 'faqs', label: 'FAQs', icon: HelpCircle,
        children: [
            { id: 'faq-general', label: 'General' },
            { id: 'faq-groups', label: 'Groups & Teams' },
            { id: 'faq-submission', label: 'Submission' },
        ],
    },
];

const PAGE_CONTENT = {
    'group-formation': {
        breadcrumb: ['Docs', 'Project Phases', 'Group Formation'],
        title: 'Group Formation Guide',
        subtitle: 'Learn how to form effective project teams, find compatible teammates, and set up your group workspace for maximum collaboration and success.',
        badge: 'Project Phases',
        tip: "Groups can have up to 6 members. Form your group early in the semester to ensure all members are aligned on project goals and timelines. Use the AI Mentor Bot to help clarify role expectations.",
        sections: [
            {
                id: 'find-teammates', heading: 'How to Find Teammates',
                intro: 'Finding the right teammates is crucial for project success. SWP Hub offers multiple ways to connect with potential group members who share your interests and complement your skill set.',
                cards: [
                    { title: 'Browse Student Profiles', body: 'Navigate to the "Find Teammates" section to view profiles of students looking for groups. Filter by skills, availability, and project interests.', icon: Users },
                    { title: 'Post a Team Announcement', body: 'Create a public post describing your project vision and the roles you\'re looking to fill. Include details about meeting schedules and expectations.', icon: Zap },
                    { title: 'AI Matchmaking', body: 'Our AI assistant analyzes your skills and preferences to suggest the most compatible teammates from your semester cohort.', icon: Star },
                ],
            },
            {
                id: 'creating-group', heading: 'Creating Your Group',
                intro: 'Once you have found your teammates, the group creator sets up the shared workspace that all members will use throughout the semester.',
                cards: [
                    { title: 'Create a Workspace', body: 'Go to Dashboard → New Group. Give your group a name, select your project topic, and set visibility (public / private).', icon: BookOpen },
                    { title: 'Configure Roles', body: 'Assign roles such as Team Lead, Developer, Designer, and QA to each member so responsibilities are clear from day one.', icon: CheckSquare },
                ],
            },
            {
                id: 'inviting-members', heading: 'Inviting Members',
                intro: 'Invite your teammates via email or share the group join link. They will receive a notification and can accept or decline the invitation.',
                cards: [
                    { title: 'Invite by Email', body: "Enter your teammate's FPT email address and send an invitation directly from the group settings panel.", icon: Zap },
                    { title: 'Share Join Link', body: 'Copy the unique group join link from Settings and share it via any messaging platform.', icon: ArrowRight },
                ],
            },
            {
                id: 'group-roles', heading: 'Group Roles',
                intro: 'Understanding and assigning roles early prevents confusion and ensures all critical tasks are covered.',
                cards: [
                    { title: 'Team Lead', body: 'Coordinates the team, manages the timeline, communicates with the lecturer/mentor, and handles final submissions.', icon: Star },
                    { title: 'Developer / Researcher', body: 'Responsible for the core implementation or research work according to the project topic.', icon: Zap },
                    { title: 'QA / Documentation', body: 'Ensures quality standards are met, writes documentation, and manages deliverables checklist.', icon: CheckSquare },
                ],
            },
            {
                id: 'communication-channels', heading: 'Communication Channels',
                intro: 'SWP Hub provides built-in channels so you never need external tools.',
                cards: [
                    { title: 'Group Chat', body: 'Real-time messaging for quick updates, links, and announcements within your group.', icon: Users },
                    { title: 'Q&A Forum', body: 'Post structured questions visible to your group and mentor with threaded answers.', icon: HelpCircle },
                ],
            },
            {
                id: 'best-practices', heading: 'Best Practices',
                intro: 'Teams that follow these practices consistently deliver better outcomes and experience less stress.',
                cards: [
                    { title: 'Weekly Sync Meetings', body: 'Schedule a 30-minute weekly standup to align on progress, blockers, and next steps.', icon: Star },
                    { title: 'Use the Task Board', body: 'Break the project into smaller tasks on the Task Board. Assign owners and deadlines to every task.', icon: CheckSquare },
                    { title: 'Document Everything', body: 'Keep meeting notes, decisions, and code comments up to date. Future you will be grateful.', icon: BookOpen },
                ],
            },
        ],
        toc: ['How to Find Teammates', 'Creating Your Group', 'Inviting Members', 'Group Roles', 'Communication Channels', 'Best Practices'],
        tocIds: ['find-teammates', 'creating-group', 'inviting-members', 'group-roles', 'communication-channels', 'best-practices'],
    },
    'introduction': {
        breadcrumb: ['Docs', 'Getting Started', 'Introduction'],
        title: 'Introduction to SWP Hub',
        badge: 'Getting Started',
        subtitle: 'SWP Hub is the all-in-one platform designed for FPT University students and lecturers to collaborate on SWP capstone courses.',
        tip: 'SWP Hub replaces the need for scattered tools. Everything from topic registration to group communication happens in one place.',
        sections: [
            {
                id: 'what-is-swp', heading: 'What is SWP Hub?',
                intro: 'SWP Hub brings together students, lecturers, and mentors onto a single collaborative platform for the duration of the SWP semester.',
                cards: [
                    { title: 'For Students', body: 'Manage your group, register topics, track tasks, ask questions, and collaborate with your team — all in one workspace.', icon: Users },
                    { title: 'For Lecturers', body: 'Review and approve topics, monitor group progress, answer Q&A forum posts, and manage semester schedules.', icon: GraduationCap },
                    { title: 'For Mentors', body: 'Provide structured feedback, schedule meetings, and guide multiple groups simultaneously.', icon: Star },
                ],
            },
            {
                id: 'key-features', heading: 'Key Features',
                intro: 'A high-level overview of what SWP Hub provides.',
                cards: [
                    { title: 'Topic Registration', body: 'Browse available research and development topics. Submit your own proposal and track its approval status.', icon: CheckSquare },
                    { title: 'Group Management', body: 'Form teams, assign roles, and collaborate in a dedicated group workspace with chat and task board.', icon: Users },
                    { title: 'AI Assistant', body: 'Ask the AI Mentor Bot questions about SWP requirements, coding best practices, or project planning advice.', icon: Zap },
                ],
            },
        ],
        toc: ['What is SWP Hub?', 'Key Features'],
        tocIds: ['what-is-swp', 'key-features'],
    },
};

function getDefaultContent(id, label, parentLabel) {
    return {
        breadcrumb: ['Docs', parentLabel || 'Section', label],
        title: label,
        badge: parentLabel,
        subtitle: `Documentation for ${label}. This section is coming soon.`,
        tip: null,
        sections: [{
            id: 'overview', heading: 'Overview',
            intro: 'This section is currently being written. Check back soon for detailed documentation.',
            cards: [{ title: 'Coming Soon', body: 'Full documentation for this section will be available before the semester starts.', icon: BookOpen }],
        }],
        toc: ['Overview'],
        tocIds: ['overview'],
    };
}

/* ─── Sidebar Section Component ───────────────────────────────────────────── */
function SidebarSection({ section, activeId, onSelect }) {
    const Icon = section.icon;
    const isChildActive = section.children.some(c => c.id === activeId);
    const [open, setOpen] = useState(section.defaultOpen ?? isChildActive);

    useEffect(() => { if (isChildActive) setOpen(true); }, [isChildActive]);

    return (
        <div className="mb-1">
            <button
                onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all duration-150 group ${isChildActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
                    <span>{section.label}</span>
                </div>
                <span className={`transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </span>
            </button>

            <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="ml-3 mt-0.5 border-l border-white/8 pl-3 py-0.5 space-y-0.5">
                    {section.children.map(child => (
                        <button
                            key={child.id}
                            onClick={() => onSelect(child.id, section.label)}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all duration-150 flex items-center gap-2 group/item ${activeId === child.id
                                ? 'text-[#F27125] font-semibold bg-[#F27125]/10'
                                : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                                }`}
                        >
                            {activeId === child.id && (
                                <span className="w-1 h-1 rounded-full bg-[#F27125] flex-shrink-0" />
                            )}
                            {child.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Card ────────────────────────────────────────────────────────────────── */
function DocCard({ card, index }) {
    const Icon = card.icon || BookOpen;
    return (
        <div
            className="group relative bg-gradient-to-br from-white/3 to-white/1 border border-white/8 rounded-2xl p-5 hover:border-[#F27125]/40 hover:from-[#F27125]/5 hover:to-transparent transition-all duration-300 cursor-default"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-[#F27125]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start gap-4 relative">
                <div className="w-9 h-9 rounded-xl bg-[#F27125]/10 border border-[#F27125]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F27125]/20 group-hover:border-[#F27125]/40 transition-all duration-300">
                    <Icon className="w-4 h-4 text-[#F27125]" />
                </div>
                <div>
                    <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-[#F27125] transition-colors duration-200">
                        {card.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{card.body}</p>
                </div>
            </div>
        </div>
    );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export function DocumentationPage({ onNavigate }) {
    const [activeId, setActiveId] = useState('group-formation');
    const [parentLabel, setParentLabel] = useState('Project Phases');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('');
    const [sidebarSearch, setSidebarSearch] = useState('');
    const mainRef = useRef(null);

    const handleSelect = (id, parent) => {
        setActiveId(id);
        setParentLabel(parent);
        setActiveSection('');
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const content = PAGE_CONTENT[activeId] || getDefaultContent(
        activeId,
        NAV_SECTIONS.flatMap(s => s.children).find(c => c.id === activeId)?.label || activeId,
        parentLabel
    );

    const filteredNav = sidebarSearch
        ? NAV_SECTIONS.map(s => ({
            ...s,
            children: s.children.filter(c => c.label.toLowerCase().includes(sidebarSearch.toLowerCase())),
            defaultOpen: true,
        })).filter(s => s.children.length > 0)
        : NAV_SECTIONS;

    useEffect(() => {
        const el = mainRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
            { root: el, rootMargin: '-20% 0px -60% 0px' }
        );
        const headings = el.querySelectorAll('section[id]');
        headings.forEach(h => observer.observe(h));
        return () => observer.disconnect();
    }, [activeId]);

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#0a0b0f', color: 'white', fontFamily: "'Inter', system-ui, sans-serif" }}>

            {/* ── Sidebar ──────────────────────────────────────────────────────── */}
            <aside className="w-[248px] flex-shrink-0 flex flex-col border-r" style={{ background: '#0f1117', borderColor: 'rgba(255,255,255,0.06)' }}>

                {/* Logo */}
                <div className="flex items-center gap-2.5 px-4 h-14 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #F27125, #d96420)' }}>S</div>
                    <span className="font-bold text-[15px] text-white tracking-tight">SWP Hub</span>
                    <span className="ml-auto text-[10px] font-semibold text-[#F27125] bg-[#F27125]/10 border border-[#F27125]/20 px-1.5 py-0.5 rounded-full">Docs</span>
                </div>

                {/* Sidebar Search */}
                <div className="px-3 py-2.5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={sidebarSearch}
                            onChange={e => setSidebarSearch(e.target.value)}
                            className="w-full text-xs py-2 pl-8 pr-6 rounded-lg text-gray-400 placeholder-gray-600 focus:outline-none focus:ring-1 transition-all"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                        {sidebarSearch && (
                            <button onClick={() => setSidebarSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
                    {filteredNav.map(section => (
                        <SidebarSection key={section.id} section={section} activeId={activeId} onSelect={handleSelect} />
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <button
                        onClick={() => onNavigate && onNavigate('landing', { replace: true })}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all duration-150"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to App
                    </button>
                </div>
            </aside>

            {/* ── Right Panel ──────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top Bar */}
                <header className="flex items-center gap-4 px-6 h-14 border-b flex-shrink-0" style={{ background: '#0f1117', borderColor: 'rgba(255,255,255,0.06)' }}>
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                                type="text"
                                placeholder="Search documentation..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full text-sm py-2 pl-10 pr-14 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 transition-all"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', focusRingColor: '#F27125' }}
                            />
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>/</kbd>
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <button
                            onClick={() => onNavigate && onNavigate('landing', { replace: true })}
                            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-150"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to App
                        </button>
                    </div>
                </header>

                {/* Content + TOC */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Main Content */}
                    <main ref={mainRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        <div className="max-w-3xl mx-auto px-10 py-10">

                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-1.5 mb-6">
                                {content.breadcrumb.map((crumb, i) => (
                                    <span key={i} className="flex items-center gap-1.5">
                                        {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-700" />}
                                        <span className={`text-sm transition-colors ${i === content.breadcrumb.length - 1
                                            ? 'text-gray-300 font-medium'
                                            : 'text-gray-600 hover:text-gray-400 cursor-pointer'
                                            }`}>{crumb}</span>
                                    </span>
                                ))}
                            </nav>

                            {/* Badge + Title */}
                            {content.badge && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F27125] bg-[#F27125]/10 border border-[#F27125]/20 px-2.5 py-1 rounded-full mb-4">
                                    <Hash className="w-3 h-3" />
                                    {content.badge}
                                </span>
                            )}

                            <h1 className="text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
                                {content.title}
                            </h1>
                            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl">{content.subtitle}</p>

                            {/* Divider */}
                            <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, rgba(242,113,37,0.3), rgba(255,255,255,0.04), transparent)' }} />

                            {/* Pro Tip */}
                            {content.tip && (
                                <div className="relative mb-10 rounded-2xl overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(242,113,37,0.12), rgba(242,113,37,0.04))' }} />
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: 'linear-gradient(180deg, #F27125, rgba(242,113,37,0.3))' }} />
                                    <div className="relative flex gap-3.5 px-5 py-4">
                                        <div className="w-8 h-8 rounded-xl bg-[#F27125]/20 border border-[#F27125]/30 flex items-center justify-center flex-shrink-0">
                                            <Lightbulb className="w-4 h-4 text-[#F27125]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#F27125] mb-1 tracking-wide uppercase text-[11px]">Pro Tip</p>
                                            <p className="text-sm text-gray-300 leading-relaxed">{content.tip}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sections */}
                            {content.sections.map((section, si) => (
                                <section key={section.id} id={section.id} className="mb-14 scroll-mt-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h2 className="text-2xl font-bold text-white tracking-tight">{section.heading}</h2>
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-5">{section.intro}</p>

                                    <div className="grid gap-3" style={{ gridTemplateColumns: section.cards.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                                        {section.cards.map((card, ci) => (
                                            <DocCard key={ci} card={card} index={ci} />
                                        ))}
                                    </div>
                                </section>
                            ))}

                            {/* Next / Prev navigation */}
                            <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 transition-colors px-4 py-2.5 rounded-xl hover:bg-white/5">
                                    <ArrowLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <button className="flex items-center gap-2 text-sm text-[#F27125] hover:text-white transition-colors px-4 py-2.5 rounded-xl bg-[#F27125]/10 hover:bg-[#F27125]/20 border border-[#F27125]/20">
                                    Next
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="h-20" />
                        </div>
                    </main>

                    {/* ── Right TOC ───────────────────────────────────────────────── */}
                    <aside className="w-52 flex-shrink-0 py-10 pr-6 overflow-y-auto hidden xl:block" style={{ scrollbarWidth: 'none' }}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 mb-4 px-2">On this page</p>
                        <ul className="space-y-1">
                            {content.toc.map((item, i) => (
                                <li key={i}>
                                    <a
                                        href={`#${content.tocIds[i]}`}
                                        onClick={e => {
                                            e.preventDefault();
                                            mainRef.current?.querySelector(`#${content.tocIds[i]}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            setActiveSection(content.tocIds[i]);
                                        }}
                                        className={`flex items-center gap-2 text-[13px] leading-snug px-2 py-1.5 rounded-lg transition-all duration-150 ${activeSection === content.tocIds[i]
                                            ? 'text-[#F27125] font-semibold bg-[#F27125]/8'
                                            : 'text-gray-600 hover:text-gray-300 hover:bg-white/4'
                                            }`}
                                    >
                                        {activeSection === content.tocIds[i] && (
                                            <span className="w-1 h-1 rounded-full bg-[#F27125] flex-shrink-0" />
                                        )}
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* Version tag */}
                        <div className="mt-8 px-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 mb-2">Version</p>
                            <span className="text-[11px] text-gray-500 bg-white/4 border border-white/8 px-2 py-1 rounded-md">v1.0.0 — Spring 2025</span>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Floating help */}
            <button className="fixed bottom-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-xl hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <HelpCircle className="w-4 h-4" />
            </button>
        </div>
    );
}
