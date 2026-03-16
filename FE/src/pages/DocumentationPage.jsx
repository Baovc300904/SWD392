import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Search, ChevronRight, ChevronDown, Lightbulb,
    BookOpen, Users, CheckSquare, GraduationCap, HelpCircle, X,
    Zap, Star, ArrowRight, Hash
} from 'lucide-react';

/* ─── Data ────────────────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
    {
        id: 'getting-started', label: 'Bắt đầu', icon: BookOpen,
        children: [
            { id: 'introduction', label: 'Giới thiệu hệ thống' },
            { id: 'quick-start', label: 'Khởi động nhanh' },
            { id: 'account-setup', label: 'Thiết lập tài khoản' },
        ],
    },
    {
        id: 'topic-registration', label: 'Quản lý đề tài', icon: CheckSquare,
        children: [
            { id: 'browsing-topics', label: 'Xem danh sách đề tài' },
            { id: 'submitting-topic', label: 'Đăng ký hoặc đề xuất đề tài' },
            { id: 'approval-process', label: 'Quy trình xét duyệt' },
        ],
    },
    {
        id: 'project-phases', label: 'Làm việc nhóm', icon: Users, defaultOpen: true,
        children: [
            { id: 'planning-setup', label: 'Lập kế hoạch ban đầu' },
            { id: 'group-formation', label: 'Tạo và vận hành nhóm' },
            { id: 'task-management', label: 'Quản lý công việc' },
        ],
    },
    {
        id: 'mentor-guide', label: 'Giảng viên & quản trị', icon: GraduationCap,
        children: [
            { id: 'mentor-overview', label: 'Tổng quan vai trò' },
            { id: 'mentor-meetings', label: 'Theo dõi và trao đổi' },
            { id: 'mentor-feedback', label: 'Phản hồi và chấm điểm' },
        ],
    },
    {
        id: 'faqs', label: 'Câu hỏi thường gặp', icon: HelpCircle,
        children: [
            { id: 'faq-general', label: 'Câu hỏi chung' },
            { id: 'faq-groups', label: 'Nhóm và cộng tác' },
            { id: 'faq-submission', label: 'Bài nộp và chấm điểm' },
        ],
    },
];

const PAGE_CONTENT = {
    'group-formation': {
        breadcrumb: ['Tài liệu', 'Làm việc nhóm', 'Tạo và vận hành nhóm'],
        title: 'Hướng Dẫn Tạo Và Vận Hành Nhóm',
        subtitle: 'Trang này hướng dẫn sinh viên tìm thành viên phù hợp, tạo nhóm, phân chia vai trò và vận hành workspace nhóm hiệu quả trong suốt kỳ học.',
        badge: 'Làm việc nhóm',
        tip: 'Nhóm nên được tạo sớm ngay khi đề tài có định hướng rõ ràng. Mỗi thành viên cần biết rõ vai trò, deadline và kênh trao đổi trước khi bắt đầu triển khai.',
        sections: [
            {
                id: 'find-teammates', heading: 'Tìm thành viên phù hợp',
                intro: 'Chọn đúng thành viên là bước quan trọng nhất để nhóm hoạt động ổn định. Hãy ưu tiên người có kỹ năng bổ trợ nhau, lịch rảnh tương thích và cam kết tham gia xuyên suốt học kỳ.',
                cards: [
                    { title: 'Xem hồ sơ và mục tiêu', body: 'Đọc thông tin cơ bản của từng bạn, đối chiếu kỹ năng hiện có trong nhóm và xác định khoảng trống cần bổ sung trước khi mời.', icon: Users },
                    { title: 'Thống nhất cách làm việc', body: 'Trao đổi trước về thời gian họp, cách chia task, người chịu trách nhiệm báo cáo và quy định phản hồi trong nhóm.', icon: Zap },
                    { title: 'Dùng AI để rà soát vai trò', body: 'Bạn có thể dùng AI Assistant để gợi ý cách chia vai trò hoặc kiểm tra xem nhóm hiện tại còn thiếu vị trí nào.', icon: Star },
                ],
            },
            {
                id: 'creating-group', heading: 'Tạo nhóm và workspace',
                intro: 'Sau khi chốt thành viên, trưởng nhóm cần tạo workspace chung để cả nhóm cùng theo dõi đề tài, task, hỏi đáp và bài nộp.',
                cards: [
                    { title: 'Đặt tên nhóm rõ ràng', body: 'Sử dụng tên nhóm dễ nhận biết, gắn với lớp hoặc đề tài để giảng viên và quản trị dễ theo dõi.', icon: BookOpen },
                    { title: 'Thiết lập vai trò ngay từ đầu', body: 'Phân công người phụ trách quản lý task, tài liệu, code, kiểm thử và báo cáo để tránh chồng chéo trách nhiệm.', icon: CheckSquare },
                ],
            },
            {
                id: 'inviting-members', heading: 'Mời thành viên vào nhóm',
                intro: 'Sau khi tạo nhóm, hãy mời đúng thành viên đã thống nhất. Kiểm tra kỹ email FPT hoặc mã sinh viên để tránh mời nhầm người.',
                cards: [
                    { title: 'Mời trực tiếp', body: 'Gửi lời mời từ giao diện nhóm để hệ thống ghi nhận đúng thành viên và đồng bộ quyền truy cập.', icon: Zap },
                    { title: 'Theo dõi trạng thái tham gia', body: 'Kiểm tra lại xem lời mời đã được chấp nhận hay chưa trước khi bắt đầu giao task hoặc nộp đề tài.', icon: ArrowRight },
                ],
            },
            {
                id: 'group-roles', heading: 'Phân vai trong nhóm',
                intro: 'Nhóm hoạt động hiệu quả khi mỗi thành viên biết rõ phạm vi công việc, đầu ra cần nộp và người phối hợp trực tiếp.',
                cards: [
                    { title: 'Trưởng nhóm', body: 'Theo dõi tiến độ chung, làm việc với giảng viên, tổng hợp cập nhật và đảm bảo nhóm không trễ mốc.', icon: Star },
                    { title: 'Thành viên triển khai', body: 'Phụ trách nghiên cứu, thiết kế, code hoặc phân tích nghiệp vụ theo kế hoạch đã chia.', icon: Zap },
                    { title: 'Kiểm thử và tài liệu', body: 'Quản lý checklist, rà lỗi, chuẩn hóa bài nộp và giữ tài liệu nhóm luôn cập nhật.', icon: CheckSquare },
                ],
            },
            {
                id: 'communication-channels', heading: 'Kênh trao đổi trong nhóm',
                intro: 'Tận dụng các module có sẵn trong SWP Hub để tập trung toàn bộ trao đổi, quyết định và tài liệu vào một nơi.',
                cards: [
                    { title: 'Task Board', body: 'Dùng bảng công việc để theo dõi ai đang làm gì, deadline nào sắp tới và việc nào đang bị chặn.', icon: Users },
                    { title: 'Q&A Forum', body: 'Gửi câu hỏi có cấu trúc để giảng viên phản hồi, tránh thất lạc thông tin qua chat rời rạc.', icon: HelpCircle },
                ],
            },
            {
                id: 'best-practices', heading: 'Thực hành tốt nên áp dụng',
                intro: 'Những nhóm duy trì đều đặn các nguyên tắc dưới đây thường kiểm soát tiến độ tốt hơn và giảm xung đột nội bộ.',
                cards: [
                    { title: 'Họp ngắn định kỳ', body: 'Mỗi tuần nên có ít nhất một buổi sync để chốt tiến độ, blocker và đầu việc tuần kế tiếp.', icon: Star },
                    { title: 'Task nào cũng có người chịu trách nhiệm', body: 'Không để task ở trạng thái vô chủ. Mọi đầu việc đều cần owner và mốc hoàn thành rõ ràng.', icon: CheckSquare },
                    { title: 'Lưu lại quyết định quan trọng', body: 'Những thay đổi về phạm vi, công nghệ hoặc timeline nên được ghi nhận để tránh tranh cãi về sau.', icon: BookOpen },
                ],
            },
        ],
        toc: ['Tìm thành viên phù hợp', 'Tạo nhóm và workspace', 'Mời thành viên vào nhóm', 'Phân vai trong nhóm', 'Kênh trao đổi trong nhóm', 'Thực hành tốt nên áp dụng'],
        tocIds: ['find-teammates', 'creating-group', 'inviting-members', 'group-roles', 'communication-channels', 'best-practices'],
    },
    'introduction': {
        breadcrumb: ['Tài liệu', 'Bắt đầu', 'Giới thiệu hệ thống'],
        title: 'Giới Thiệu SWP Hub',
        badge: 'Bắt đầu',
        subtitle: 'SWP Hub là nền tảng tập trung dành cho sinh viên, giảng viên và quản trị viên trong môn học/đồ án SWP, giúp theo dõi đề tài, nhóm, hỏi đáp và bài nộp trên cùng một hệ thống.',
        tip: 'Thay vì dùng nhiều công cụ rời rạc, SWP Hub gom toàn bộ quy trình học phần vào một nơi để giảm thất lạc thông tin và dễ kiểm soát tiến độ.',
        sections: [
            {
                id: 'what-is-swp', heading: 'SWP Hub là gì?',
                intro: 'Hệ thống giúp số hóa toàn bộ luồng vận hành học phần: sinh viên lập nhóm và nộp bài, giảng viên theo dõi lớp và trả lời Q&A, manager giám sát toàn bộ hoạt động.',
                cards: [
                    { title: 'Dành cho sinh viên', body: 'Quản lý nhóm, chọn đề tài, cập nhật task, gửi câu hỏi và nộp milestone trên một workspace thống nhất.', icon: Users },
                    { title: 'Dành cho giảng viên', body: 'Theo dõi lớp phụ trách, phản hồi Q&A, xem submission, chấm điểm và quản lý đề tài thuộc phạm vi giảng dạy.', icon: GraduationCap },
                    { title: 'Dành cho manager', body: 'Giám sát người dùng, duyệt topic, xử lý câu hỏi escalated và theo dõi sức khỏe vận hành chung của hệ thống.', icon: Star },
                ],
            },
            {
                id: 'key-features', heading: 'Các chức năng chính',
                intro: 'Đây là những phân hệ quan trọng mà người dùng sẽ thao tác thường xuyên trong SWP Hub.',
                cards: [
                    { title: 'Quản lý đề tài', body: 'Xem danh sách đề tài, tạo đề xuất mới, theo dõi trạng thái chờ duyệt, được duyệt hoặc bị từ chối.', icon: CheckSquare },
                    { title: 'Quản lý nhóm và lớp', body: 'Sinh viên vận hành nhóm, giảng viên theo dõi lớp phụ trách, manager giám sát tổng thể nhóm trên toàn hệ thống.', icon: Users },
                    { title: 'AI Assistant và Q&A', body: 'Hỗ trợ giải đáp nhanh, gợi ý câu trả lời và chuẩn hóa kênh hỏi đáp giữa sinh viên với giảng viên.', icon: Zap },
                ],
            },
        ],
        toc: ['SWP Hub là gì?', 'Các chức năng chính'],
        tocIds: ['what-is-swp', 'key-features'],
    },
};

function getDefaultContent(id, label, parentLabel) {
    return {
        breadcrumb: ['Tài liệu', parentLabel || 'Chuyên mục', label],
        title: label,
        badge: parentLabel,
        subtitle: `Đây là hướng dẫn nhanh cho mục ${label}. Bạn có thể dùng nội dung dưới đây để thao tác đúng quy trình trên SWP Hub.`,
        tip: `Khi thao tác ở mục ${label}, hãy luôn kiểm tra đúng quyền truy cập và trạng thái dữ liệu trước khi lưu thay đổi.`,
        sections: [{
            id: 'overview', heading: 'Tổng quan',
            intro: `Mục ${label} thuộc nhóm ${parentLabel || 'tài liệu chung'}. Phần này giúp bạn hiểu khi nào nên dùng tính năng, ai được thao tác và cần chú ý điều gì.`,
            cards: [
                { title: 'Mục tiêu', body: `Sử dụng ${label} để hoàn thành đúng bước nghiệp vụ trong SWP Hub và tránh thao tác sai vai trò.`, icon: BookOpen },
                { title: 'Các bước đề nghị', body: 'Mở đúng màn hình, kiểm tra dữ liệu hiện có, lọc danh sách nếu cần, sau đó mới thực hiện thao tác tạo/cập nhật/duyệt.', icon: CheckSquare },
                { title: 'Lưu ý', body: 'Nếu dữ liệu không hiển thị như mong đợi, hãy làm mới màn hình, kiểm tra quyền truy cập hoặc trạng thái hiện tại của bản ghi.', icon: HelpCircle },
            ],
        }],
        toc: ['Tổng quan'],
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
    const [parentLabel, setParentLabel] = useState('Làm việc nhóm');
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
                    <span className="ml-auto text-[10px] font-semibold text-[#F27125] bg-[#F27125]/10 border border-[#F27125]/20 px-1.5 py-0.5 rounded-full">Tài liệu</span>
                </div>

                {/* Sidebar Search */}
                <div className="px-3 py-2.5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Tìm trong menu..."
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
                        Quay lại ứng dụng
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
                                placeholder="Tìm trong tài liệu..."
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
                            Quay lại ứng dụng
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
                                            <p className="text-sm font-semibold text-[#F27125] mb-1 tracking-wide uppercase text-[11px]">Mẹo sử dụng</p>
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
                                    Trước
                                </button>
                                <button className="flex items-center gap-2 text-sm text-[#F27125] hover:text-white transition-colors px-4 py-2.5 rounded-xl bg-[#F27125]/10 hover:bg-[#F27125]/20 border border-[#F27125]/20">
                                    Tiếp
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="h-20" />
                        </div>
                    </main>

                    {/* ── Right TOC ───────────────────────────────────────────────── */}
                    <aside className="w-52 flex-shrink-0 py-10 pr-6 overflow-y-auto hidden xl:block" style={{ scrollbarWidth: 'none' }}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 mb-4 px-2">Trong trang này</p>
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
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 mb-2">Phiên bản</p>
                            <span className="text-[11px] text-gray-500 bg-white/4 border border-white/8 px-2 py-1 rounded-md">v1.0.0 — Spring 2026</span>
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
