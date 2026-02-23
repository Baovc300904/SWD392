import { useState } from 'react';
import { ArrowLeft, Mail, MapPin, Phone, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';

const inputCls = `w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none transition-all duration-200`;
const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };

export function ContactPage({ onNavigate }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  const INFO = [
    {
      icon: MapPin, label: 'Address', color: '#F27125',
      lines: ['FPT University HCMC', 'Lot E2a-7, D1 Street, Saigon Hi-tech Park', 'District 9, Ho Chi Minh City'],
    },
    {
      icon: Mail, label: 'Email', color: '#3b82f6',
      lines: ['support@swphub.fpt.edu.vn', 'info@swphub.fpt.edu.vn'],
    },
    {
      icon: Phone, label: 'Phone', color: '#10b981',
      lines: ['+84 (28) 7300 5588', 'Mon–Fri, 8AM – 5PM ICT'],
    },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0b0f', fontFamily: "'Inter',system-ui,sans-serif" }}>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 border-b"
        style={{ background: 'rgba(10,11,15,0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={() => onNavigate('landing', { replace: true })} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#F27125,#d96420)' }}>S</div>
          <span className="font-bold text-white">SWP Hub</span>
        </div>
        <div className="w-24" />
      </nav>

      {/* Hero */}
      <div className="relative pt-28 pb-16 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 blur-3xl" style={{ background: 'radial-gradient(ellipse,#F27125,transparent 70%)' }} />
        <div className="relative">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#F27125] bg-[#F27125]/10 border border-[#F27125]/20 px-3 py-1.5 rounded-full mb-6">Get in Touch</span>
          <h1 className="text-5xl font-bold tracking-tight mb-4">We'd love to hear from you</h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">Send us a message and we'll get back to you within 24 hours.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-5 gap-6">

          {/* Left: info */}
          <div className="md:col-span-2 space-y-4">
            {INFO.map(({ icon: Icon, label, color, lines }, i) => (
              <div key={i} className="group flex gap-4 p-5 rounded-2xl border transition-all duration-300 hover:border-opacity-50"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">{label}</p>
                  {lines.map((l, j) => <p key={j} className="text-sm text-gray-300 leading-relaxed">{l}</p>)}
                </div>
              </div>
            ))}

            {/* Response time card */}
            <div className="flex gap-4 p-5 rounded-2xl border" style={{ background: 'rgba(242,113,37,0.05)', borderColor: 'rgba(242,113,37,0.15)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(242,113,37,0.15)', border: '1px solid rgba(242,113,37,0.3)' }}>
                <Clock className="w-4.5 h-4.5 text-[#F27125]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Avg. Response</p>
                <p className="text-sm text-gray-300">Usually within <span className="text-[#F27125] font-semibold">2–4 hours</span> on weekdays</p>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="md:col-span-3 rounded-2xl p-7 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400 text-sm mb-6">Thanks for reaching out. We'll get back to you soon.</p>
                <button onClick={() => setSent(false)} className="text-sm text-[#F27125] hover:underline">Send another message</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-[#F27125]" />
                  <h2 className="text-lg font-bold text-white">Send a Message</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                      <input type="text" className={inputCls} style={inputStyle} placeholder="Nguyen Van A"
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                        onFocus={e => e.target.style.borderColor = 'rgba(242,113,37,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                      <input type="email" className={inputCls} style={inputStyle} placeholder="you@fpt.edu.vn"
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                        onFocus={e => e.target.style.borderColor = 'rgba(242,113,37,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                    <input type="text" className={inputCls} style={inputStyle} placeholder="How can we help?"
                      value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                      onFocus={e => e.target.style.borderColor = 'rgba(242,113,37,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                    <textarea rows={6} className={`${inputCls} resize-none`} style={inputStyle} placeholder="Tell us more..."
                      value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required
                      onFocus={e => e.target.style.borderColor = 'rgba(242,113,37,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    style={{ background: loading ? '#9a5a2b' : 'linear-gradient(135deg,#F27125,#d96420)' }}>
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="py-6 border-t text-center text-sm text-gray-700" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        © 2026 FPT University · SWP Hub
      </footer>
    </div>
  );
}
