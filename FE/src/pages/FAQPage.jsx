import { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I register a group?',
      answer:
        'To register a group, navigate to the #group-requests channel in your dashboard. Click on "Create New Group", fill in your team members\' information, select a topic, and submit. Your request will be reviewed by the admin within 24 hours.',
    },
    {
      question: 'Can I change my topic after approval?',
      answer:
        'Topic changes after approval require special permission. You need to submit a change request through the Topic Approvals section, providing a valid reason. The lecturer and admin must both approve before the change takes effect.',
    },
    {
      question: 'How does the AI suggestion work?',
      answer:
        'Our AI assistant is trained on your course syllabus and common Q&A patterns. When you ask a question, it analyzes the context and provides relevant answers based on course materials. You can insert AI suggestions directly into your replies or use them starting point.',
    },
    {
      question: 'What if I can\'t find teammates?',
      answer:
        'Use our Smart Group Matching feature! Go to the "Find Teammates" section, fill in your skills and preferences, and our algorithm will suggest compatible students. You can also post in the class channels to find interested members.',
    },
    {
      question: 'How do I escalate a question to a lecturer?',
      answer:
        'In the Q&A channels, each message has an "Escalate to Manager" button. Click it to forward the question to lecturers or mentors. They\'ll receive a notification and can provide expert guidance.',
    },
    {
      question: 'Can I access SWP Hub on mobile?',
      answer:
        'Yes! SWP Hub is fully responsive and works on mobile browsers. We\'re also developing dedicated iOS and Android apps that will be available soon. You\'ll receive notifications when they launch.',
    },
    {
      question: 'How are notifications sent?',
      answer:
        'You can configure notifications in Settings. We support email alerts and push notifications. You\'ll be notified about topic approvals, group requests, new Q&A responses, and important deadlines.',
    },
    {
      question: 'What happens if my project is rejected?',
      answer:
        'If a topic is rejected, you\'ll receive detailed feedback from the lecturer explaining why. You can revise your proposal based on the feedback and resubmit. Most rejections are due to scope issues or missing technical details.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#1a1d21] text-white font-sans overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      {/* Navigation */}
      <Navbar />

      <div className="relative pt-32 pb-20 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <HelpCircle className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Find answers to commonly asked questions about SWP Hub.
            Can't find what you need? We're here to help.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for answers..."
                className="w-full pl-12 pr-4 py-4 bg-[#1a1d21] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-16">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-white/90 pr-8 text-lg group-hover:text-white transition-colors">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#F27125] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-white flex-shrink-0 transition-colors" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
            <p className="text-gray-500">No matching questions found. Try different keywords.</p>
          </div>
        )}

        {/* Still Need Help */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-10 text-center border border-white/10 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Still need help?</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              Can't find the answer you're looking for? Our support team is here to help you get back on track.
            </p>
            <Link
              to="/contact"
              className="bg-white text-[#1a1d21] hover:bg-gray-100 px-8 py-3 rounded-xl font-bold transition shadow-lg inline-flex items-center gap-2"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}


