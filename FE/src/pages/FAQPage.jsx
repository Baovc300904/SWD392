import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, MessageSquare, X } from 'lucide-react';

const FAQS = [
  { cat: 'Nhóm', q: 'Làm sao để đăng ký nhóm?', a: 'Vào kênh #group-requests trong bảng điều khiển. Nhấn "Tạo nhóm mới", điền thông tin thành viên, chọn đề tài và gửi. Quản trị viên sẽ duyệt trong vòng 24 giờ.' },
  { cat: 'Đề tài', q: 'Tôi có thể đổi đề tài sau khi đã được duyệt không?', a: 'Việc đổi đề tài sau khi duyệt cần quyền đặc biệt. Hãy gửi yêu cầu đổi tại mục phê duyệt đề tài kèm lý do hợp lệ. Cả giảng viên và quản trị viên đều phải đồng ý.' },
  { cat: 'AI', q: 'Gợi ý AI hoạt động như thế nào?', a: 'AI được huấn luyện trên đề cương môn học và các mẫu hỏi đáp phổ biến. Khi bạn đặt câu hỏi, hệ thống sẽ phân tích ngữ cảnh và đưa ra câu trả lời phù hợp dựa trên tài liệu học phần.' },
  { cat: 'Nhóm', q: 'Nếu tôi chưa tìm được đồng đội thì sao?', a: 'Hãy dùng tính năng ghép nhóm thông minh. Vào "Tìm đồng đội", nhập kỹ năng và sở thích, hệ thống sẽ gợi ý các bạn phù hợp. Bạn cũng có thể đăng bài trong kênh lớp.' },
  { cat: 'Chung', q: 'Làm sao để chuyển câu hỏi cho giảng viên?', a: 'Trong kênh hỏi đáp, mỗi câu hỏi có nút "Chuyển cho giảng viên". Nhấn vào để gửi đến giảng viên hoặc cố vấn. Họ sẽ nhận thông báo và phản hồi.' },
  { cat: 'Chung', q: 'Tôi có dùng SWP Hub trên điện thoại được không?', a: 'Có. SWP Hub hỗ trợ giao diện responsive và hoạt động trên các trình duyệt di động. Ứng dụng iOS và Android đang được phát triển.' },
  { cat: 'Chung', q: 'Thiết lập thông báo ở đâu?', a: 'Vào Cài đặt → Thông báo. Hệ thống hỗ trợ email và thông báo đẩy. Bạn sẽ nhận cập nhật khi có duyệt đề tài, yêu cầu nhóm, phản hồi mới và các mốc hạn quan trọng.' },
  { cat: 'Đề tài', q: 'Nếu đề tài của tôi bị từ chối thì sao?', a: 'Bạn sẽ nhận phản hồi chi tiết từ giảng viên về lý do từ chối. Hãy chỉnh sửa đề xuất theo góp ý và gửi lại. Phần lớn trường hợp bị từ chối do phạm vi chưa phù hợp hoặc thiếu chi tiết kỹ thuật.' },
  { cat: 'AI', q: 'AI có hoạt động 24/7 không?', a: 'Có. Trợ lý AI hoạt động liên tục. Chất lượng phản hồi tốt nhất cho các câu hỏi liên quan đến đề cương môn học, lập kế hoạch dự án và thực hành phát triển phần mềm.' },
];

const CATS = ['Tất cả', 'Chung', 'Nhóm', 'Đề tài', 'AI'];

export function FAQPage({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Tất cả');
  const [open, setOpen] = useState(null);

  const filtered = FAQS.filter(f => {
    const matchCat = cat === 'Tất cả' || f.cat === cat;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0b0f', fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 border-b"
        style={{ background: 'rgba(10,11,15,0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={() => onNavigate('landing', { replace: true })} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
          <ArrowLeft className="w-4 h-4" /> Quay về trang chủ
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#F27125,#d96420)' }}>S</div>
          <span className="font-bold text-white">SWP Hub</span>
        </div>
        <div className="w-24" />
      </nav>

      {/* Hero */}
      <div className="relative pt-28 pb-12 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] opacity-10 blur-3xl" style={{ background: 'radial-gradient(ellipse,#F27125,transparent 70%)' }} />
        <div className="relative">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#F27125] bg-[#F27125]/10 border border-[#F27125]/20 px-3 py-1.5 rounded-full mb-6">Trung tâm hỗ trợ</span>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Câu hỏi thường gặp</h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10">Tìm nhanh câu trả lời cho những thắc mắc phổ biến về SWP Hub</p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto px-6">
            <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm text-white placeholder-gray-600 focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(242,113,37,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(242,113,37,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-8 flex-wrap justify-center">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: cat === c ? 'rgba(242,113,37,0.15)' : 'rgba(255,255,255,0.04)',
                color: cat === c ? '#F27125' : 'rgb(107,114,128)',
                border: cat === c ? '1px solid rgba(242,113,37,0.3)' : '1px solid rgba(255,255,255,0.07)',
              }}>
              {c}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {filtered.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-2xl border overflow-hidden transition-all duration-200"
                style={{
                  background: isOpen ? 'rgba(242,113,37,0.06)' : 'rgba(255,255,255,0.02)',
                  borderColor: isOpen ? 'rgba(242,113,37,0.25)' : 'rgba(255,255,255,0.07)',
                }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors duration-150"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(242,113,37,0.1)', color: '#F27125', border: '1px solid rgba(242,113,37,0.2)' }}>
                      {faq.cat}
                    </span>
                    <span className={`font-medium text-sm transition-colors ${isOpen ? 'text-white' : 'text-gray-300'}`}>{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#F27125]' : 'text-gray-600'}`} />
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-6 pb-5">
                    <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Search className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">Không tìm thấy kết quả cho "<span className="text-gray-300">{search}</span>"</p>
              <button onClick={() => { setSearch(''); setCat('Tất cả'); }} className="mt-3 text-xs text-[#F27125] hover:underline">Xóa bộ lọc</button>
            </div>
          )}
        </div>

        {/* Still need help CTA */}
        <div className="mt-14 rounded-2xl p-8 text-center relative overflow-hidden border" style={{ background: 'rgba(242,113,37,0.06)', borderColor: 'rgba(242,113,37,0.2)' }}>
          <div className="absolute inset-0 opacity-20 blur-3xl" style={{ background: 'radial-gradient(ellipse at 50% 0%,#F27125,transparent 70%)' }} />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(242,113,37,0.15)', border: '1px solid rgba(242,113,37,0.3)' }}>
              <MessageSquare className="w-5 h-5 text-[#F27125]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Bạn vẫn cần hỗ trợ?</h3>
            <p className="text-gray-400 text-sm mb-6">Nếu chưa tìm thấy câu trả lời, đội ngũ hỗ trợ sẽ phản hồi trong thời gian sớm nhất.</p>
            <button onClick={() => onNavigate('contact')}
              className="text-white font-semibold px-7 py-3 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#F27125,#d96420)' }}>
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </div>

      <footer className="py-6 border-t text-center text-sm text-gray-700" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        © 2026 FPT University · SWP Hub
      </footer>
    </div>
  );
}
