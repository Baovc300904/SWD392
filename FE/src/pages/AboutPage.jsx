import { ArrowLeft, Target, Users, Heart, Zap, Code2, Palette, Brain, GraduationCap, ArrowRight } from 'lucide-react';

const TEAM = [
  { name: 'Nguyen Van A', role: 'Trưởng nhóm phát triển', seed: 'DevA', color: '#F27125' },
  { name: 'Tran Thi B', role: 'Nhà thiết kế UI/UX', seed: 'DevB', color: '#a855f7' },
  { name: 'Le Van C', role: 'Lập trình viên Backend', seed: 'DevC', color: '#3b82f6' },
  { name: 'Pham Thi D', role: 'Kỹ sư AI', seed: 'DevD', color: '#10b981' },
];
const MENTORS = [
  { name: 'Dr. Tran Minh', role: 'Cố vấn kỹ thuật', seed: 'MentorA', color: '#F27125' },
  { name: 'Dr. Nguyen Duc D', role: 'Cố vấn dự án', seed: 'MentorB', color: '#a855f7' },
];
const STATS = [
  { label: 'Sinh viên đã hỗ trợ', value: '2,400+' },
  { label: 'Nhóm đã tạo', value: '480+' },
  { label: 'Đề tài đã duyệt', value: '1,200+' },
  { label: 'Lượt hỏi AI mỗi ngày', value: '8,000+' },
];
const VALUES = [
  { icon: Target, title: 'Sứ mệnh', color: '#F27125', text: 'Mang đến cho sinh viên những công cụ thông minh giúp đơn giản hóa quản lý đồ án và nâng cao hiệu quả học tập nhờ trợ lý AI.' },
  { icon: Users, title: 'Tầm nhìn', color: '#a855f7', text: 'Trở thành nền tảng hàng đầu cho cộng tác đồ án đại học, thúc đẩy đổi mới và chất lượng trong giáo dục phần mềm.' },
  { icon: Heart, title: 'Giá trị cốt lõi', color: '#10b981', text: 'Đổi mới, hợp tác và thành công của sinh viên là trung tâm trong mọi điều chúng tôi xây dựng.' },
];

function Navbar({ onNavigate }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 border-b"
      style={{ background: 'rgba(10,11,15,0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.06)' }}>
      <button onClick={() => onNavigate('landing', { replace: true })} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
        <ArrowLeft className="w-4 h-4" /> Quay về trang chủ
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#F27125,#d96420)' }}>S</div>
        <span className="font-bold text-white">SWP Hub</span>
      </div>
      <button onClick={() => onNavigate('login')} className="text-sm text-[#F27125] border border-[#F27125]/30 px-4 py-1.5 rounded-lg hover:bg-[#F27125]/10 transition-all">Đăng nhập</button>
    </nav>
  );
}

export function AboutPage({ onNavigate }) {
  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0b0f', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Navbar onNavigate={onNavigate} />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: '#F27125', animation: 'pulse 6s infinite' }} />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: '#a855f7', animation: 'pulse 8s infinite 2s' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#F27125] bg-[#F27125]/10 border border-[#F27125]/20 px-3 py-1.5 rounded-full mb-6">Câu chuyện của chúng tôi</span>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Đồng hành cùng sinh viên FPT<br />
            <span style={{ background: 'linear-gradient(90deg,#F27125,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>thành công trong mỗi dự án</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            SWP Hub ra đời với mong muốn giúp việc quản lý đồ án phần mềm trở nên dễ dàng hơn, hợp tác hơn và hiệu quả hơn cho mọi sinh viên FPT.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="py-10 border-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {STATS.map((s, i) => (
            <div key={i} className="text-center py-8 px-4" style={{ background: '#0a0b0f' }}>
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Giá trị chúng tôi theo đuổi</h2>
            <p className="text-gray-500">Những nguyên tắc định hướng mọi sản phẩm SWP Hub</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, color, text }, i) => (
              <div key={i} className="group relative rounded-2xl p-7 border hover:border-opacity-60 transition-all duration-300 cursor-default overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: `radial-gradient(circle at 30% 30%, ${color}12, transparent 60%)` }} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 relative" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2 relative">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed relative">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────── */}
      <section className="py-20 border-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Hành trình phát triển</h2>
          <div className="space-y-6">
            {[
              { year: '2024', text: 'SWP Hub được tạo ra bởi nhóm sinh viên FPT từng trực tiếp gặp khó khăn khi làm đồ án phần mềm: từ tìm đồng đội phù hợp đến tra cứu nhanh yêu cầu môn học.' },
              { year: '2025', text: 'Kết hợp đam mê công nghệ với AI và các công cụ cộng tác hiện đại, chúng tôi xây dựng SWP Hub thành nền tảng mà chính mình từng mong có khi làm dự án.' },
              { year: '2026', text: 'Hiện nay, SWP Hub đang hỗ trợ hàng nghìn sinh viên cộng tác hiệu quả hơn, học tập tốt hơn và đạt kết quả cao hơn trong đồ án. Và đây mới chỉ là khởi đầu.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-[#F27125] flex-shrink-0" style={{ background: '#F27125/15', border: '1px solid rgba(242,113,37,0.3)' }}>
                    {item.year.slice(2)}
                  </div>
                  {i < 2 && <div className="flex-1 w-px mt-2 mb-0" style={{ background: 'rgba(255,255,255,0.07)' }} />}
                </div>
                <div className="pb-6">
                  <p className="text-xs font-semibold text-[#F27125] mb-2">{item.year}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Đội ngũ phát triển</h2>
            <p className="text-gray-500">Những con người đứng sau SWP Hub</p>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-5">Nhóm phát triển</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {TEAM.map((m, i) => (
              <div key={i} className="group text-center rounded-2xl p-6 border transition-all duration-300 hover:border-opacity-50"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" style={{ background: m.color }} />
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.seed}`} alt={m.name}
                    className="w-20 h-20 rounded-full relative z-10 border-2" style={{ borderColor: `${m.color}40` }} />
                </div>
                <p className="font-semibold text-white text-sm">{m.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>

          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-5">Giảng viên cố vấn</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {MENTORS.map((m, i) => (
              <div key={i} className="group text-center rounded-2xl p-6 border transition-all duration-300 hover:border-opacity-50"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-300" style={{ background: m.color }} />
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.seed}`} alt={m.name}
                    className="w-20 h-20 rounded-full relative z-10 border-2" style={{ borderColor: `${m.color}40` }} />
                </div>
                <p className="font-semibold text-white text-sm">{m.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng đồng hành cùng SWP Hub?</h2>
          <p className="text-gray-400 mb-8">Trở thành một phần của cộng đồng đang thay đổi cách sinh viên học tập và cộng tác.</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => onNavigate('register')}
              className="flex items-center gap-2 text-white font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#F27125,#d96420)' }}>
              Bắt đầu ngay <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => onNavigate('contact')}
              className="text-gray-400 hover:text-white font-semibold px-7 py-3 rounded-xl border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              Liên hệ
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t text-center text-sm text-gray-700" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        © 2026 FPT University · SWP Hub
      </footer>
    </div>
  );
}
