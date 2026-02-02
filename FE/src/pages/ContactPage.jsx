import { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#1a1d21] text-white font-sans overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[50vw] h-[50vw] bg-[#F27125]/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Navigation */}
      <Navbar />

      <div className="relative pt-32 pb-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-400">
            We'd love to hear from you. Send us a message and we'll respond.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Side - Contact Info */}
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-colors">
              <h2 className="text-2xl font-bold mb-8">Contact Information</h2>

              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Address</h3>
                    <p className="text-gray-400 leading-relaxed">
                      FPT University HCMC<br />
                      Lot E2a-7, D1 Street<br />
                      Saigon Hi-tech Park, District 9<br />
                      Ho Chi Minh City, Vietnam
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/20 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <p className="text-gray-400 hover:text-[#F27125] transition-colors cursor-pointer">support@swphub.fpt.edu.vn</p>
                    <p className="text-gray-400 hover:text-[#F27125] transition-colors cursor-pointer">info@swphub.fpt.edu.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Phone</h3>
                    <p className="text-gray-400 group-hover:text-white transition-colors">+84 (28) 7300 5588</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 8AM - 5PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 h-64 relative group overflow-hidden">
              {/* Abstract Grid Pattern for Map */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              <div className="w-full h-full flex items-center justify-center relative z-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#F27125]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <MapPin className="w-8 h-8 text-[#F27125]" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">View on Google Maps</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-8">Send Us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 ml-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Before entering your name..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent text-white placeholder-gray-600 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@fpt.edu.vn"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent text-white placeholder-gray-600 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 ml-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent text-white placeholder-gray-600 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 ml-1">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent text-white placeholder-gray-600 resize-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#F27125] hover:bg-[#d96420] text-white px-6 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-orange-500/20 mt-4 active:scale-95"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
